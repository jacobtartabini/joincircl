import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  TrendingUp, 
  Volume2, 
  Eye, 
  MessageSquare,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  PlayCircle,
  Repeat
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InterviewFeedbackProps {
  sessionData: any;
  onBack: () => void;
  onRetake: () => void;
}

interface FeedbackScore {
  category: string;
  score: number;
  maxScore: number;
  feedback: string[];
  suggestions: string[];
}

export function InterviewFeedback({ sessionData, onBack, onRetake }: InterviewFeedbackProps) {
  const [feedbackScores, setFeedbackScores] = useState<FeedbackScore[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Use real AI analysis data from session
    setTimeout(() => {
      const analysis = sessionData.overallAnalysis || {};
      
      const scores: FeedbackScore[] = [
        {
          category: "Content & Structure",
          score: analysis.contentScore || 78,
          maxScore: 100,
          feedback: [
            "Strong use of specific examples and achievements",
            "Good structure in responses using STAR method",
            "Relevant experience highlighted effectively",
            `Answered questions with ${analysis.confidenceLevel || 75}% confidence level`
          ],
          suggestions: [
            "Include more quantifiable results in your examples",
            "Practice connecting experiences more directly to the role",
            "Prepare 2-3 additional examples for behavioral questions"
          ]
        },
        {
          category: "Vocal Delivery",
          score: analysis.deliveryScore || 85,
          maxScore: 100,
          feedback: [
            `Clear articulation with ${analysis.speechRate || 160} words per minute`,
            "Confident tone throughout the interview",
            "Good use of professional language",
            `Only ${analysis.fillerWordCount || 3} filler words detected`
          ],
          suggestions: [
            "Reduce filler words ('um', 'like') by practicing responses",
            "Vary your tone more to show enthusiasm",
            "Practice pausing before answering complex questions"
          ]
        },
        {
          category: "Body Language & Presence",
          score: analysis.bodyLanguageScore || 72,
          maxScore: 100,
          feedback: [
            "Maintained good posture throughout most of the session",
            "Appropriate facial expressions and gestures",
            `${analysis.eyeContactPercentage || 70}% eye contact with camera`,
            "Professional appearance and demeanor"
          ],
          suggestions: [
            "Maintain more consistent eye contact with the camera",
            "Avoid touching face or adjusting clothing during responses",
            "Practice animated expressions while maintaining professionalism",
            "Use purposeful hand gestures to emphasize key points"
          ]
        },
        {
          category: "Interview Readiness",
          score: Math.round((analysis.contentScore + analysis.deliveryScore) / 2) || 80,
          maxScore: 100,
          feedback: [
            "Good use of allocated time for most questions",
            "Appropriate pacing without rushing",
            "Completed answers within time limits",
            "Demonstrated preparation and knowledge"
          ],
          suggestions: [
            "Take 2-3 seconds to think before responding",
            "Practice company-specific questions more thoroughly",
            "Use a timer when practicing to build internal clock",
            "Research recent company news and initiatives"
          ]
        }
      ];

      setFeedbackScores(scores);
      const avgScore = scores.reduce((acc, score) => acc + score.score, 0) / scores.length;
      setOverallScore(Math.round(avgScore));
      setIsAnalyzing(false);
    }, 3000);
  }, [sessionData]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 85) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isAnalyzing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-12 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl text-center">
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Analyzing Your Performance</h2>
              <p className="text-muted-foreground">
                Arlo is reviewing your responses and generating personalized feedback...
              </p>
            </div>
            <div className="space-y-2">
              <Progress value={75} className="w-64 mx-auto" />
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
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
            Back to Interview Prep
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" className="rounded-full">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="p-8 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Interview Performance Report</h1>
            <p className="text-muted-foreground">
              Your mock interview analysis is complete
            </p>
          </div>

          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </div>
              <div className="text-lg font-semibold text-gray-900">Overall Score</div>
              <Badge 
                variant={getScoreBadgeVariant(overallScore)} 
                className="mt-2"
              >
                {overallScore >= 85 ? "Excellent" : overallScore >= 70 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  {sessionData.questions?.length || 5}
                </div>
                <div className="text-sm text-blue-800">Questions</div>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  {formatDuration(sessionData.totalDuration || 600)}
                </div>
                <div className="text-sm text-green-800">Duration</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={onRetake} variant="outline" className="rounded-full">
              <Repeat className="h-4 w-4 mr-2" />
              Retake Interview
            </Button>
            <Button className="rounded-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Complete
            </Button>
          </div>
        </div>
      </Card>

      {/* Detailed Feedback */}
      <Tabs defaultValue="scores" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scores">Performance Scores</TabsTrigger>
          <TabsTrigger value="responses">Response Review</TabsTrigger>
          <TabsTrigger value="improvements">Key Improvements</TabsTrigger>
          <TabsTrigger value="practice">Practice Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbackScores.map((score, index) => (
              <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{score.category}</h3>
                    <Badge variant={getScoreBadgeVariant(score.score)} className="rounded-full">
                      {score.score}/100
                    </Badge>
                  </div>

                  <Progress value={score.score} className="h-3" />

                  <div className="space-y-3">
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {score.feedback.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600">• {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-2">
                        <Lightbulb className="h-4 w-4" />
                        Improvement Areas
                      </h4>
                      <ul className="space-y-1">
                        {score.suggestions.slice(0, 2).map((item, i) => (
                          <li key={i} className="text-sm text-gray-600">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-6">
          <div className="space-y-6">
            {sessionData.questions?.map((question: any, index: number) => (
              <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Question {index + 1}
                      </h3>
                      <p className="text-gray-700">{question.question}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {question.category}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        Vocal Analysis
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Voice Clarity</span>
                          <span className={`font-semibold ${question.analysis?.voiceClarity > 80 ? 'text-green-600' : question.analysis?.voiceClarity > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {question.analysis?.voiceClarity > 80 ? 'Excellent' : question.analysis?.voiceClarity > 60 ? 'Good' : 'Needs Work'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Speaking Pace</span>
                          <span className={`font-semibold ${question.analysis?.pace > 75 ? 'text-green-600' : question.analysis?.pace > 55 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {question.analysis?.pace > 75 ? 'Optimal' : question.analysis?.pace > 55 ? 'Moderate' : 'Too Fast/Slow'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Enthusiasm</span>
                          <span className={`font-semibold ${question.analysis?.enthusiasm > 80 ? 'text-green-600' : question.analysis?.enthusiasm > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {question.analysis?.enthusiasm > 80 ? 'High' : question.analysis?.enthusiasm > 60 ? 'Moderate' : 'Low'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Visual Analysis
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Eye Contact</span>
                          <span className={`font-semibold ${question.analysis?.eyeContactScore > 80 ? 'text-green-600' : question.analysis?.eyeContactScore > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {question.analysis?.eyeContactScore > 80 ? 'Excellent' : question.analysis?.eyeContactScore > 60 ? 'Good' : 'Needs Improvement'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Facial Expression</span>
                          <span className={`font-semibold ${question.analysis?.facialExpressionScore > 75 ? 'text-green-600' : question.analysis?.facialExpressionScore > 55 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {question.analysis?.facialExpressionScore > 75 ? 'Engaging' : question.analysis?.facialExpressionScore > 55 ? 'Neutral' : 'Flat'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gestures</span>
                          <span className={`font-semibold ${question.analysis?.gestureScore > 75 ? 'text-green-600' : question.analysis?.gestureScore > 55 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {question.analysis?.gestureScore > 75 ? 'Natural' : question.analysis?.gestureScore > 55 ? 'Limited' : 'Distracting'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {question.response && (
                    <div className="pt-4 border-t border-gray-100">
                      <Button variant="outline" size="sm" className="rounded-full">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Review Recording
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="improvements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-red-50 border-red-200 rounded-2xl">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Areas to Address
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-red-900">Eye Contact</p>
                      <p className="text-sm text-red-700">Practice looking directly at the camera, not the screen</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-red-900">Filler Words</p>
                      <p className="text-sm text-red-700">Reduce "um" and "like" usage through practice</p>
                    </div>
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="p-6 bg-green-50 border-green-200 rounded-2xl">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Strong Points to Maintain
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-green-900">STAR Method</p>
                      <p className="text-sm text-green-700">Excellent use of structured responses</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-green-900">Confidence</p>
                      <p className="text-sm text-green-700">Strong, confident delivery throughout</p>
                    </div>
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-blue-50 border-blue-200 rounded-2xl">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Arlo's Personalized Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-800">Before Your Real Interview</h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li>• Practice 3-5 times with different question sets</li>
                    <li>• Record yourself answering company-specific questions</li>
                    <li>• Work on reducing filler words with timed practice</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-800">During the Interview</h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li>• Focus on maintaining eye contact with interviewer</li>
                    <li>• Take 2-3 seconds to think before answering</li>
                    <li>• Use your natural hand gestures to emphasize points</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Your Personalized Practice Plan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Week 1: Foundation Building</h4>
                  <div className="space-y-3">
                    {[
                      "Practice STAR method with 5 behavioral questions daily",
                      "Record 2-minute elevator pitch practice",
                      "Work on eye contact with camera exercises"
                    ].map((task, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-600 mt-0.5" />
                        <span className="text-sm text-gray-700">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Week 2: Advanced Practice</h4>
                  <div className="space-y-3">
                    {[
                      "Complete 2-3 full mock interviews",
                      "Practice company-specific scenarios",
                      "Work on confident body language"
                    ].map((task, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span className="text-sm text-blue-700">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-semibold text-amber-900 mb-2">📅 Schedule Your Next Session</h4>
                <p className="text-sm text-amber-800 mb-3">
                  Practice makes perfect! Schedule your next mock interview session to track your improvement.
                </p>
                <Button size="sm" className="rounded-full">
                  Schedule Next Practice
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}