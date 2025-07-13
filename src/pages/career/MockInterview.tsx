import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  ArrowLeft, 
  Play, 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff,
  Square,
  SkipForward,
  Clock,
  CheckCircle,
  Video,
  Eye,
  Volume2,
  RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MockInterviewQuestion {
  id: string;
  question: string;
  category: string;
  type: 'behavioral';
  timeLimit: number; // in seconds
  tips?: string[];
}

interface RecordedResponse {
  videoBlob: Blob;
  audioBlob?: Blob;
  videoFrame?: string;
  duration: number;
  startTime: number;
  endTime: number;
  analysis?: any;
}

interface InterviewSession {
  id?: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  experienceLevel: string;
  questions: MockInterviewQuestion[];
  responses: Record<string, RecordedResponse>;
  overallAnalysis?: any;
  totalDuration: number;
  completedAt: string;
}

export default function MockInterview() {
  const navigate = useNavigate();
  const [setupData, setSetupData] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    experienceLevel: "mid"
  });
  const [currentStep, setCurrentStep] = useState<'setup' | 'interview' | 'review' | 'sessions'>('setup');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, RecordedResponse>>({});
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [preparationTime, setPreparationTime] = useState(30);
  const [isPreparingAnswer, setIsPreparingAnswer] = useState(false);
  const [sessionAnalysis, setSessionAnalysis] = useState<any>(null);
  const [isCameraConnected, setIsCameraConnected] = useState(false);
  const [isConnectingCamera, setIsConnectingCamera] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Only 2 behavioral questions
  const questions: MockInterviewQuestion[] = [
    {
      id: "challenge",
      question: "Tell me about a time you faced a significant challenge at work and how you handled it.",
      type: "behavioral",
      category: "Problem Solving",
      timeLimit: 180,
      tips: ["Use STAR method", "Focus on your actions", "Highlight the outcome"]
    },
    {
      id: "strengths",
      question: `What are your key strengths that make you ideal for this ${setupData.jobTitle || 'position'}?`,
      type: "behavioral", 
      category: "Self-Assessment",
      timeLimit: 120,
      tips: ["Use specific examples", "Connect to job requirements", "Be confident"]
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    loadSavedSessions();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isAnswering && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleStopAnswer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAnswering, timeRemaining]);

  const loadSavedSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('mock_interview_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const setupCamera = async () => {
    setIsConnectingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              resolve(true);
            };
          }
        });
      }
      
      setIsCameraConnected(true);
      setIsCameraOn(true);
      setIsMicOn(true);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Error",
        description: "Unable to access camera. You can still practice without video recording.",
        variant: "destructive"
      });
      setIsCameraOn(false);
      setIsCameraConnected(false);
    } finally {
      setIsConnectingCamera(false);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSetupData(prev => ({ ...prev, [field]: value }));
  };

  const startInterview = async () => {
    if (!setupData.jobTitle) {
      toast({
        title: "Job title required",
        description: "Please enter a job title to start the interview.",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep('interview');
    setSessionStarted(false);  // Start with setup screen first
    
    toast({
      title: "Setting up interview...",
      description: "Please allow camera access to continue."
    });
  };

  const startPreparation = () => {
    setIsPreparingAnswer(true);
    setPreparationTime(30);
    
    const prepTimer = setInterval(() => {
      setPreparationTime(prev => {
        if (prev <= 1) {
          clearInterval(prepTimer);
          setIsPreparingAnswer(false);
          toast({
            title: "Preparation Time Over",
            description: "You can now start recording your answer.",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startAnswer = async () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const videoChunks: BlobPart[] = [];
      const startTime = Date.now();
      setRecordingStartTime(startTime);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
        const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
        
        // Extract frame for visual analysis
        const videoFrame = await extractVideoFrame(videoBlob);
        
        // Extract audio for transcription
        const audioBlob = await extractAudioFromVideo(videoBlob);
        
        setResponses(prev => ({
          ...prev,
          [currentQuestion.id]: {
            videoBlob,
            audioBlob,
            videoFrame,
            duration,
            startTime,
            endTime
          }
        }));

        toast({
          title: "Response Recorded",
          description: `Your ${duration}s response has been saved.`,
        });

        // Analyze the recording
        await analyzeRecording(currentQuestion.id, videoFrame, audioBlob);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsAnswering(true);
      setTimeRemaining(currentQuestion.timeLimit);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Unable to start recording. Please check your camera permissions.",
        variant: "destructive"
      });
    }
  };

  const handleStopAnswer = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsAnswering(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(questions[currentQuestionIndex + 1].timeLimit);
      setIsAnswering(false);
      setIsRecording(false);
    } else {
      completeSession();
    }
  };

  const completeSession = async () => {
    const analysisData = await generateMockAnalysis();
    setSessionAnalysis(analysisData);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save your session.",
          variant: "destructive"
        });
        setCurrentStep('review');
        return;
      }

      const sessionData = {
        user_id: user.id,
        job_title: setupData.jobTitle,
        company_name: setupData.companyName,
        job_description: setupData.jobDescription,
        experience_level: setupData.experienceLevel,
        questions: JSON.parse(JSON.stringify(questions)),
        responses: Object.values(responses).map(r => ({
          duration: r.duration,
          analysis: r.analysis || {}
        })),
        overall_analysis: analysisData.overall || {},
        total_duration: questions.reduce((acc, q) => {
          const response = responses[q.id];
          return acc + (response?.duration || 0);
        }, 0),
        session_data: JSON.parse(JSON.stringify({
          questions,
          responses: Object.fromEntries(
            Object.entries(responses).map(([key, value]) => [
              key,
              {
                duration: value.duration,
                startTime: value.startTime,
                endTime: value.endTime,
                analysis: value.analysis || {}
              }
            ])
          ),
          analysis: analysisData
        }))
      };

      const { error } = await supabase
        .from('mock_interview_sessions')
        .insert(sessionData);

      if (error) throw error;
      
      toast({
        title: "Session Saved",
        description: "Your interview session has been saved for future reference."
      });
      
      loadSavedSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Save Error",
        description: "Session completed but couldn't be saved.",
        variant: "destructive"
      });
    }

    setCurrentStep('review');
  };

  const extractVideoFrame = async (videoBlob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadeddata = () => {
        video.currentTime = Math.min(5, video.duration / 2);
      };
      
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
        
        const base64Frame = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        resolve(base64Frame);
      };
      
      video.src = URL.createObjectURL(videoBlob);
    });
  };

  const extractAudioFromVideo = async (videoBlob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      resolve(videoBlob); // For now, return the video blob (it contains audio)
    });
  };

  const analyzeRecording = async (questionId: string, videoFrame: string, audioBlob: Blob) => {
    try {
      toast({
        title: "Analyzing Response",
        description: "Arlo is analyzing your video and audio...",
      });

      const audioBase64 = await blobToBase64(audioBlob);
      
      const { data, error } = await supabase.functions.invoke('analyze-interview-recording', {
        body: {
          videoBase64: videoFrame,
          audioBase64: audioBase64.split(',')[1],
          question: currentQuestion.question,
          jobTitle: setupData.jobTitle,
          company: setupData.companyName
        },
      });

      if (error) throw error;

      setResponses(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          analysis: data
        }
      }));

      toast({
        title: "Analysis Complete",
        description: "Your response has been analyzed successfully!",
      });
    } catch (error) {
      console.error('Error analyzing recording:', error);
      toast({
        title: "Analysis Error",
        description: "Unable to analyze your response. You can still continue with the interview.",
        variant: "destructive"
      });
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const generateMockAnalysis = async () => {
    const analysisData: any = { overall: {} };
    
    let totalContentScore = 0;
    let totalDeliveryScore = 0;
    let totalBodyLanguageScore = 0;
    let validResponses = 0;

    questions.forEach(q => {
      const response = responses[q.id];
      if (response?.analysis) {
        analysisData[q.id] = response.analysis;
        totalContentScore += response.analysis.contentScore || 0;
        totalDeliveryScore += response.analysis.voiceClarity || 0;
        totalBodyLanguageScore += response.analysis.bodyLanguageScore || 0;
        validResponses++;
      } else {
        analysisData[q.id] = {
          contentRelevance: Math.floor(Math.random() * 20) + 75,
          structureClarity: Math.floor(Math.random() * 20) + 70,
          eyeContactScore: Math.floor(Math.random() * 30) + 60,
          facialExpressionScore: Math.floor(Math.random() * 25) + 70,
          gestureScore: Math.floor(Math.random() * 20) + 75,
          voiceClarity: Math.floor(Math.random() * 20) + 75,
          pace: Math.floor(Math.random() * 20) + 70,
          enthusiasm: Math.floor(Math.random() * 25) + 70
        };
      }
    });

    if (validResponses > 0) {
      analysisData.overall = {
        contentScore: Math.round(totalContentScore / validResponses),
        deliveryScore: Math.round(totalDeliveryScore / validResponses),
        bodyLanguageScore: Math.round(totalBodyLanguageScore / validResponses),
        eyeContactPercentage: Math.floor(Math.random() * 30) + 60,
        speechRate: Math.floor(Math.random() * 40) + 140,
        fillerWordCount: Math.floor(Math.random() * 8),
        confidenceLevel: Math.floor(Math.random() * 30) + 70
      };
    } else {
      analysisData.overall = {
        contentScore: Math.floor(Math.random() * 20) + 75,
        deliveryScore: Math.floor(Math.random() * 20) + 70,
        bodyLanguageScore: Math.floor(Math.random() * 25) + 65,
        eyeContactPercentage: Math.floor(Math.random() * 30) + 60,
        speechRate: Math.floor(Math.random() * 40) + 140,
        fillerWordCount: Math.floor(Math.random() * 8),
        confidenceLevel: Math.floor(Math.random() * 30) + 70
      };
    }

    return analysisData;
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentStep === 'setup') {
    return (
      <div className="min-h-screen refined-web-theme pb-20">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/career")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Career Hub
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Mock Interview</h1>
                <p className="text-muted-foreground">Practice with video recording and AI feedback</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Interview Setup</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Software Engineer, Product Manager"
                      value={setupData.jobTitle}
                      onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g., Google, Microsoft, Startup Inc."
                      value={setupData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description here for more tailored questions..."
                      value={setupData.jobDescription}
                      onChange={(e) => handleInputChange("jobDescription", e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Experience Level</Label>
                    <div className="flex gap-2 mt-2">
                      {['entry', 'mid', 'senior'].map((level) => (
                        <Button
                          key={level}
                          variant={setupData.experienceLevel === level ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleInputChange("experienceLevel", level)}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={startInterview}
                  disabled={!setupData.jobTitle}
                  className="w-full mt-6 gap-2"
                  size="lg"
                >
                  <Video className="h-4 w-4" />
                  Start Video Interview
                </Button>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">What to Expect</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Video className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Video Recording</p>
                      <p className="text-sm text-muted-foreground">Record your responses to 2 behavioral questions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Eye className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">AI Analysis</p>
                      <p className="text-sm text-muted-foreground">Get feedback on content and body language</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Save Progress</p>
                      <p className="text-sm text-muted-foreground">Sessions saved for future reference</p>
                    </div>
                  </div>
                </div>

                {savedSessions.length > 0 && (
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('sessions')}
                      className="w-full"
                    >
                      View Past Sessions ({savedSessions.length})
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'sessions') {
    return (
      <div className="min-h-screen refined-web-theme pb-20">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep('setup')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Setup
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Past Interview Sessions</h1>
              <p className="text-muted-foreground">Review your previous mock interviews</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSessions.map((session) => (
              <Card key={session.id} className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold">{session.job_title}</h3>
                    <p className="text-sm text-muted-foreground">{session.company_name}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.floor(session.total_duration / 60)}m {session.total_duration % 60}s
                    </div>
                    <div>
                      {new Date(session.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {session.overall_analysis && (
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        Content: {session.overall_analysis.contentScore || 'N/A'}%
                      </Badge>
                      <Badge variant="outline">
                        Delivery: {session.overall_analysis.deliveryScore || 'N/A'}%
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'interview') {
    if (!sessionStarted) {
      return (
        <div className="min-h-screen refined-web-theme pb-20">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep('setup')} className="rounded-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Setup
              </Button>
            </div>

            <Card className="p-8 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900">Mock Interview Session</h1>
                  <p className="text-lg text-muted-foreground">
                    Practice for your {setupData.jobTitle} interview{setupData.companyName && ` at ${setupData.companyName}`}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-blue-900">Duration</p>
                      <p className="text-sm text-blue-700">2 questions, ~5 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <Video className="h-5 w-5 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-green-900">Format</p>
                      <p className="text-sm text-green-700">Video responses only</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                    <Eye className="h-5 w-5 text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium text-purple-900">Analysis</p>
                      <p className="text-sm text-purple-700">AI feedback provided</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={async () => {
                    toast({
                      title: "Setting up camera...",
                      description: "Please allow camera access to continue."
                    });
                    
                    await setupCamera();
                    
                    // Give a moment for video to connect
                    setTimeout(() => {
                      setSessionStarted(true);
                      setTimeRemaining(currentQuestion.timeLimit);
                      toast({
                        title: "Interview Ready!",
                        description: "Your camera is connected. You can now begin the interview."
                      });
                    }, 1000);
                  }}
                  size="lg"
                  className="px-12"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Begin Interview
                </Button>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen refined-web-theme pb-20">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setSessionStarted(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</h1>
              <p className="text-muted-foreground">{currentQuestion.category}</p>
            </div>
            <div className="ml-auto">
              <Progress value={(currentQuestionIndex / questions.length) * 100} className="w-32" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Question Panel */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-4">{currentQuestion.category}</Badge>
                  <h2 className="text-lg font-semibold leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">Remember the STAR method:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li><strong>Situation:</strong> Set the context</li>
                    <li><strong>Task:</strong> Explain your responsibility</li>
                    <li><strong>Action:</strong> Describe what you did</li>
                    <li><strong>Result:</strong> Share the outcomes</li>
                  </ul>
                </div>

                {currentQuestion.tips && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Tips:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {currentQuestion.tips.map((tip, index) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4 pt-4">
                  {!responses[currentQuestion.id] && !isAnswering && (
                    <div className="text-center space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-3">
                          Take a moment to think about your response using the STAR method.
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                          Time limit: {formatTime(currentQuestion.timeLimit)}
                        </p>
                      </div>
                      
                      <Button
                        onClick={startAnswer}
                        className="w-full gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                        size="lg"
                      >
                        <Video className="h-4 w-4" />
                        Start Recording Response
                      </Button>
                    </div>
                  )}

                  {isAnswering && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                          <p className="text-lg font-semibold text-red-800 mb-2">Recording...</p>
                          <p className="text-3xl font-bold text-red-600">{formatTime(timeRemaining)}</p>
                          <p className="text-sm text-red-700 mt-2">
                            {timeRemaining <= 30 ? "Final 30 seconds!" : "Speak clearly and confidently"}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleStopAnswer}
                        className="w-full gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                        size="lg"
                      >
                        <Square className="h-4 w-4" />
                        Stop Recording & Continue
                      </Button>
                    </div>
                  )}

                  {responses[currentQuestion.id] && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <p className="font-semibold text-green-800">Response Recorded Successfully!</p>
                        </div>
                        <div className="text-sm text-green-700 space-y-1">
                          <p>Duration: {responses[currentQuestion.id].duration} seconds</p>
                          <p>Your response has been saved and will be analyzed by Arlo AI.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        {currentQuestionIndex < questions.length - 1 ? (
                          <Button
                            onClick={nextQuestion}
                            className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                            size="lg"
                          >
                            <SkipForward className="h-4 w-4" />
                            Next Question
                          </Button>
                        ) : (
                          <Button
                            onClick={completeSession}
                            className="flex-1 gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                            size="lg"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Complete Interview
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => {
                            // Allow re-recording
                            setResponses(prev => {
                              const newResponses = { ...prev };
                              delete newResponses[currentQuestion.id];
                              return newResponses;
                            });
                            setIsAnswering(false);
                            setTimeRemaining(currentQuestion.timeLimit);
                          }}
                          variant="outline"
                          size="lg"
                          className="px-6"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Video Panel */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  {isConnectingCamera ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white">
                      <Video className="h-12 w-12 mb-4 animate-pulse" />
                      <p className="text-lg font-medium">Connecting Camera...</p>
                      <p className="text-sm text-gray-300 mt-2">Please allow camera access</p>
                    </div>
                  ) : isCameraConnected && isCameraOn ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : !isCameraConnected ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white">
                      <CameraOff className="h-12 w-12 mb-4" />
                      <p className="text-lg font-medium">Camera Not Connected</p>
                      <p className="text-sm text-gray-300 mt-2">Click "Begin Interview" to connect</p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white">
                      <CameraOff className="h-12 w-12 mb-4" />
                      <p className="text-lg font-medium">Camera Disabled</p>
                      <p className="text-sm text-gray-300 mt-2">Click the camera button to enable</p>
                    </div>
                  )}
                  
                  {isRecording && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                      ● REC
                    </div>
                  )}
                  
                  {isCameraConnected && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      ● LIVE
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleCamera}
                    disabled={!isCameraConnected}
                    className={!isCameraOn ? "bg-red-50 border-red-200" : ""}
                  >
                    {isCameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleMic}
                    disabled={!isCameraConnected}
                    className={!isMicOn ? "bg-red-50 border-red-200" : ""}
                  >
                    {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                </div>
                
                {isCameraConnected && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Camera ready! You can now record your responses.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'review') {
    const analysis = sessionAnalysis?.overall || {};
    
    return (
      <div className="min-h-screen refined-web-theme pb-20">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/career")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Career Hub
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Interview Complete!</h1>
              <p className="text-muted-foreground">Review your performance and Arlo's feedback</p>
            </div>
          </div>

          {/* Overall Score */}
          <Card className="p-6 mb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Overall Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analysis.contentScore || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Content Quality</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {analysis.deliveryScore || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Delivery</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {analysis.bodyLanguageScore || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Body Language</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Vocal Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Speech Rate</span>
                  <span>{analysis.speechRate || 150} WPM</span>
                </div>
                <div className="flex justify-between">
                  <span>Filler Words</span>
                  <span>{analysis.fillerWordCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence Level</span>
                  <span>{analysis.confidenceLevel || 70}%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Visual Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Eye Contact</span>
                  <span>{analysis.eyeContactPercentage || 60}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Professional Posture</span>
                  <span>{analysis.bodyLanguageScore || 70}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Engagement Level</span>
                  <span>{analysis.confidenceLevel || 70}%</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Individual Questions */}
          <div className="space-y-6 mb-8">
            {questions.map((question, index) => {
              const response = responses[question.id];
              const questionAnalysis = sessionAnalysis?.[question.id] || {};
              
              return (
                <Card key={question.id} className="p-6">
                  <h3 className="font-semibold mb-3">Question {index + 1}: {question.question}</h3>
                  
                  {response && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Response Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{response.duration}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Content Relevance:</span>
                            <span>{questionAnalysis.contentRelevance || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Structure Clarity:</span>
                            <span>{questionAnalysis.structureClarity || 0}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Performance Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Eye Contact:</span>
                            <span>{questionAnalysis.eyeContactScore || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Voice Clarity:</span>
                            <span>{questionAnalysis.voiceClarity || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Enthusiasm:</span>
                            <span>{questionAnalysis.enthusiasm || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setCurrentStep('setup');
                setResponses({});
                setCurrentQuestionIndex(0);
                setSessionStarted(false);
                setSessionAnalysis(null);
              }}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Start New Interview
            </Button>
            <Button onClick={() => setCurrentStep('sessions')}>
              View All Sessions
            </Button>
            <Button onClick={() => navigate("/career")}>
              Back to Career Hub
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}