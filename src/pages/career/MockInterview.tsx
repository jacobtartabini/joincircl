import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Mic, MicOff, Video, VideoOff, Play, Square, ArrowRight } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  category: string;
}

const BEHAVIORAL_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Tell me about a time when you had to overcome a significant challenge at work. How did you approach it?",
    category: "Problem Solving"
  },
  {
    id: 2,
    text: "Describe a situation where you had to work with a difficult team member. How did you handle it?",
    category: "Teamwork"
  }
];

export default function MockInterview() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedResponses, setRecordedResponses] = useState<Blob[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();

  // Initialize camera and microphone
  useEffect(() => {
    const initializeMedia = async () => {
      setIsConnecting(true);
      try {
        const constraints = {
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user' 
          },
          audio: true
        };
        
        console.log('Requesting media access with constraints:', constraints);
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Verify stream has video tracks
        const videoTracks = mediaStream.getVideoTracks();
        const audioTracks = mediaStream.getAudioTracks();
        
        console.log('Media stream obtained:', {
          videoTracks: videoTracks.length,
          audioTracks: audioTracks.length,
          active: mediaStream.active
        });
        
        if (videoTracks.length === 0) {
          throw new Error('No video track found in media stream');
        }
        
        setStream(mediaStream);
        
        // Connect stream to video element for live preview
        if (videoRef.current) {
          console.log('Connecting stream to video element');
          videoRef.current.srcObject = mediaStream;
          
          // Explicitly play the video with error handling
          try {
            await videoRef.current.play();
            console.log('Video playback started successfully');
          } catch (playError) {
            console.error('Error starting video playback:', playError);
            // Try playing after user interaction if autoplay fails
            if (playError.name === 'NotAllowedError') {
              toast.error('Click anywhere to start camera preview');
            }
          }
        }
        
        setIsConnected(true);
        console.log('Camera and microphone initialized successfully');
      } catch (error) {
        console.error('Error accessing media devices:', error);
        let errorMessage = 'Failed to access camera or microphone. ';
        
        if (error.name === 'NotFoundError') {
          errorMessage += 'No camera found.';
        } else if (error.name === 'NotAllowedError') {
          errorMessage += 'Please allow camera and microphone permissions.';
        } else if (error.name === 'NotReadableError') {
          errorMessage += 'Camera is being used by another application.';
        } else {
          errorMessage += 'Please check your permissions and try again.';
        }
        
        toast.error(errorMessage);
      } finally {
        setIsConnecting(false);
      }
    };

    initializeMedia();

    return () => {
      // Cleanup function
      if (stream) {
        console.log('Cleaning up media stream');
        stream.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped ${track.kind} track`);
        });
      }
    };
  }, []);

  const startRecording = async () => {
    if (!stream) {
      toast.error('Camera not ready. Please wait...');
      return;
    }

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedResponses(prev => [...prev, blob]);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      console.log('Started recording for question:', BEHAVIORAL_QUESTIONS[currentQuestionIndex].text);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
      console.log('Stopped recording');
    }
  };

  const handleContinue = () => {
    if (currentQuestionIndex < BEHAVIORAL_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    if (!user) {
      toast.error('Please log in to save your interview session');
      return;
    }

    try {
      // Save mock interview session to database
      const { data, error } = await supabase
        .from('mock_interview_sessions')
        .insert({
          user_id: user.id,
          job_title: 'Behavioral Interview Practice',
          questions: BEHAVIORAL_QUESTIONS.map((q, index) => ({
            question: q.text,
            category: q.category,
            response_recorded: index < recordedResponses.length
          })),
          responses: recordedResponses.map((_, index) => ({
            question_index: index,
            recorded: true,
            duration: 0 // We could track duration if needed
          })),
          session_data: {
            total_questions: BEHAVIORAL_QUESTIONS.length,
            completed_questions: recordedResponses.length,
            session_type: 'behavioral'
          },
          total_duration: 0 // We could track total session duration
        })
        .select()
        .single();

      if (error) throw error;

      setSessionData(data);
      setShowResults(true);
      toast.success('Interview session completed and saved!');
    } catch (error) {
      console.error('Error saving interview session:', error);
      toast.error('Failed to save interview session');
    }
  };

  if (showResults) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Interview Complete! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>You've successfully completed your behavioral interview practice session.</p>
            <p>Your responses have been recorded and saved to your profile.</p>
            <div className="bg-muted p-4 rounded-lg">
              <p><strong>Questions Answered:</strong> {recordedResponses.length} of {BEHAVIORAL_QUESTIONS.length}</p>
              <p><strong>Session Type:</strong> Behavioral Interview</p>
            </div>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Start New Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = BEHAVIORAL_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / BEHAVIORAL_QUESTIONS.length) * 100;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Mock Interview Session</h1>
          <p className="text-muted-foreground">Practice with behavioral questions and get recorded feedback</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {BEHAVIORAL_QUESTIONS.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Question Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {currentQuestion.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed mb-6">
                {currentQuestion.text}
              </p>
              
              <div className="space-y-3">
                {!isRecording ? (
                  <Button 
                    onClick={startRecording} 
                    className="w-full"
                    disabled={!isConnected || isConnecting}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Recording Response
                  </Button>
                ) : (
                  <Button 
                    onClick={stopRecording} 
                    variant="destructive" 
                    className="w-full"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                
                {recordedResponses[currentQuestionIndex] && !isRecording && (
                  <Button 
                    onClick={handleContinue} 
                    className="w-full"
                  >
                    {currentQuestionIndex === BEHAVIORAL_QUESTIONS.length - 1 ? (
                      <>Finish Interview</>
                    ) : (
                      <>
                        Next Question
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              {isRecording && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-red-700 font-medium">Recording in progress...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Video className="w-5 h-5 mr-2" />
                Your Response
                {isConnecting && (
                  <span className="ml-2 text-sm text-muted-foreground">Connecting...</span>
                )}
                {isConnected && !isConnecting && (
                  <span className="ml-2 text-sm text-green-600">Connected</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {isConnecting ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p>Connecting to camera...</p>
                    </div>
                  </div>
                ) : isConnected ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                    onLoadedMetadata={() => console.log('Video metadata loaded')}
                    onCanPlay={() => console.log('Video can play')}
                    onPlay={() => console.log('Video started playing')}
                    onError={(e) => console.error('Video error:', e)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <VideoOff className="w-12 h-12 mx-auto mb-2" />
                      <p>Camera not available</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                {recordedResponses[currentQuestionIndex] ? (
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Response recorded for this question
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    No response recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
