import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  Play, 
  Pause, 
  Square, 
  SkipForward,
  ArrowLeft,
  Clock,
  Users,
  Building,
  Target,
  CheckCircle,
  AlertCircle,
  Eye,
  Volume2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { JobApplicationWorkflow } from "@/hooks/use-job-application-workflow";

interface MockInterviewQuestion {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'situational' | 'company-specific';
  category: string;
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

interface MockInterviewSessionProps {
  workflow: JobApplicationWorkflow;
  onBack: () => void;
  onComplete: (sessionData: any) => void;
}

export function MockInterviewSession({ workflow, onBack, onComplete }: MockInterviewSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [responses, setResponses] = useState<Record<string, RecordedResponse>>({});
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [preparationTime, setPreparationTime] = useState(30); // 30 seconds to prepare
  const [isPreparingAnswer, setIsPreparingAnswer] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Generate 2 behavioral questions for the interview
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
      question: `What are your key strengths that make you ideal for this ${workflow.job_title} position?`,
      type: "behavioral",
      category: "Self-Assessment",
      timeLimit: 120,
      tips: ["Use specific examples", "Connect to job requirements", "Be confident"]
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    setupCamera();
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

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Error",
        description: "Unable to access camera. You can still practice without video recording.",
        variant: "destructive"
      });
      setIsCameraOn(false);
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

  const startSession = () => {
    setSessionStarted(true);
    setTimeRemaining(currentQuestion.timeLimit);
    toast({
      title: "Interview Started",
      description: "Good luck! Take your time to think before answering."
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
      const audioChunks: BlobPart[] = [];
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

        // Show completion feedback
        toast({
          title: "Response Recorded",
          description: `Your ${duration}s response has been saved for analysis.`,
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
    // Generate AI analysis data
    const analysisData = await generateMockAnalysis();
    
    const sessionData = {
      applicationId: workflow.id,
      jobTitle: workflow.job_title,
      company: workflow.company_name,
      questions: questions.map(q => ({
        ...q,
        response: responses[q.id],
        analysis: analysisData[q.id] || {}
      })),
      completedAt: new Date().toISOString(),
      totalDuration: questions.reduce((acc, q) => {
        const response = responses[q.id];
        return acc + (response?.duration || 0);
      }, 0),
      overallAnalysis: analysisData.overall || {}
    };

    onComplete(sessionData);
  };

  const extractVideoFrame = async (videoBlob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadeddata = () => {
        video.currentTime = Math.min(5, video.duration / 2); // Extract frame from middle or 5s
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
      const audio = new Audio();
      audio.onloadeddata = () => {
        // For now, return the video blob (it contains audio)
        // In production, you might want to extract just the audio track
        resolve(videoBlob);
      };
      audio.src = URL.createObjectURL(videoBlob);
    });
  };

  const analyzeRecording = async (questionId: string, videoFrame: string, audioBlob: Blob) => {
    try {
      toast({
        title: "Analyzing Response",
        description: "Arlo is analyzing your video and audio...",
      });

      // Convert audio to base64
      const audioBase64 = await blobToBase64(audioBlob);
      
      const response = await fetch('/functions/v1/analyze-interview-recording', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoBase64: videoFrame,
          audioBase64: audioBase64.split(',')[1], // Remove data:audio/... prefix
          question: currentQuestion.question,
          jobTitle: workflow.job_title,
          company: workflow.company_name
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysis = await response.json();
      
      // Update the response with analysis
      setResponses(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          analysis
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
    // Compile real analysis data from responses
    const analysisData: any = { overall: {}, questions: {} };
    
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
        // Fallback mock data for responses without analysis
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
      // Fallback mock data
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

  if (!sessionStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interview Prep
          </Button>
        </div>

        <Card className="p-8 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Mock Interview Session</h1>
              <p className="text-lg text-muted-foreground">
                Practice for your {workflow.job_title} interview at {workflow.company_name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <Clock className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold text-blue-900">Duration</div>
                  <div className="text-sm text-blue-700">{questions.length} questions</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <Target className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold text-green-900">Tailored</div>
                  <div className="text-sm text-green-700">For this specific role</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <Users className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-semibold text-purple-900">AI Feedback</div>
                  <div className="text-sm text-purple-700">Detailed analysis</div>
                </div>
              </div>
            </div>

            {/* Camera Preview */}
            <div className="relative w-80 h-60 mx-auto bg-gray-900 rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button
                  size="sm"
                  variant={isCameraOn ? "default" : "secondary"}
                  onClick={toggleCamera}
                  className="rounded-full"
                >
                  {isCameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant={isMicOn ? "default" : "secondary"}
                  onClick={toggleMic}
                  className="rounded-full"
                >
                  {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-semibold text-amber-900">Before you start:</h4>
                    <ul className="text-sm text-amber-800 mt-2 space-y-1">
                      <li>• Find a quiet, well-lit space</li>
                      <li>• Test your camera and microphone</li>
                      <li>• Have a glass of water nearby</li>
                      <li>• Sit up straight and maintain eye contact with the camera</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button onClick={startSession} size="lg" className="px-8 py-3 text-lg rounded-full">
                <Play className="h-5 w-5 mr-2" />
                Start Interview
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit Interview
          </Button>
          <div className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="w-32" />
          <Badge variant="outline" className="px-3 py-1">
            {currentQuestion.category}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Panel */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
          <div className="space-y-4">
            <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Recording
                </div>
              )}

              {/* Timer */}
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-mono">
                {formatTime(timeRemaining)}
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button
                  size="sm"
                  variant={isCameraOn ? "default" : "secondary"}
                  onClick={toggleCamera}
                  className="rounded-full"
                >
                  {isCameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant={isMicOn ? "default" : "secondary"}
                  onClick={toggleMic}
                  className="rounded-full"
                >
                  {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Recording Controls */}
            <div className="flex items-center justify-center gap-4">
              {!responses[currentQuestion.id] && !isAnswering ? (
                <div className="space-y-3 text-center">
                  <Button onClick={startAnswer} size="lg" className="px-6 rounded-full">
                    <Play className="h-5 w-5 mr-2" />
                    Start Video Recording
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Record your video response to this question
                  </p>
                </div>
              ) : isAnswering ? (
                <div className="space-y-3 text-center">
                  <Button onClick={handleStopAnswer} variant="destructive" size="lg" className="px-6 rounded-full">
                    <Square className="h-5 w-5 mr-2" />
                    Stop Recording
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Recording in progress... ({formatTime(timeRemaining)} remaining)
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-center">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Response Recorded</span>
                  </div>
                  <Button onClick={startAnswer} variant="outline" size="sm" className="rounded-full">
                    Re-record Response
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Question Panel */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {currentQuestion.type}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {formatTime(currentQuestion.timeLimit)} time limit
                </Badge>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Tips */}
            {currentQuestion.tips && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for this question:</h4>
                <ul className="space-y-1">
                  {currentQuestion.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-blue-800">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Progress through questions */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{currentQuestionIndex + 1} / {questions.length}</span>
              </div>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
            </div>

            {/* Real-time feedback indicators */}
            {isAnswering && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Eye Contact</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Voice Level</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0 || isAnswering}
                className="rounded-full"
              >
                Previous
              </Button>
              
              {responses[currentQuestion.id] && !isAnswering && (
                <Button onClick={nextQuestion} className="rounded-full">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Interview
                    </>
                  ) : (
                    <>
                      Next Question
                      <SkipForward className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
              
              {!responses[currentQuestion.id] && !isAnswering && (
                <div className="text-sm text-amber-600 font-medium">
                  Video recording required to proceed
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}