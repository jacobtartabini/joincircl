
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, ArrowLeft, Sparkles, Play, Pause, RotateCcw, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface MockInterviewQuestion {
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface InterviewResponse {
  question: string;
  answer: string;
  feedback: string;
  starAnalysis: {
    situation: string;
    task: string;
    action: string;
    result: string;
    takeaway: string;
  };
  score: number;
}

export default function MockInterview() {
  const navigate = useNavigate();
  const [setupData, setSetupData] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    experienceLevel: "mid"
  });
  const [currentStep, setCurrentStep] = useState<'setup' | 'interview' | 'review'>('setup');
  const [questions, setQuestions] = useState<MockInterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setSetupData(prev => ({ ...prev, [field]: value }));
  };

  const generateQuestions = async () => {
    if (!setupData.jobTitle) {
      toast({
        title: "Job title required",
        description: "Please enter a job title to generate interview questions.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingQuestions(true);
    
    try {
      const prompt = `Generate 5 comprehensive interview questions for a ${setupData.jobTitle} position${setupData.companyName ? ` at ${setupData.companyName}` : ''}.

Job Context:
- Role: ${setupData.jobTitle}
- Company: ${setupData.companyName || 'Not specified'}
- Experience Level: ${setupData.experienceLevel}
- Job Description: ${setupData.jobDescription || 'Not provided'}

Create a mix of:
1. Behavioral questions (2-3 questions)
2. Technical/Role-specific questions (2-3 questions)
3. One situational question

Each question should be designed to elicit STAR method responses (Situation, Task, Action, Result, Takeaway).

Format as a JSON array with: question, category, difficulty.`;

      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: {
          prompt: prompt,
          systemPrompt: "You are Arlo, an expert interview coach. Generate realistic, challenging interview questions that help candidates practice and improve their interview skills using the STAR method.",
          model: 'mistralai/mistral-7b-instruct',
          maxTokens: 800,
          temperature: 0.7
        }
      });

      if (error) throw error;

      // Mock questions for demo - in real implementation, parse AI response
      const mockQuestions: MockInterviewQuestion[] = [
        {
          question: "Tell me about a time when you had to overcome a significant challenge in a previous role.",
          category: "Behavioral",
          difficulty: "medium"
        },
        {
          question: "Describe a situation where you had to work with a difficult team member. How did you handle it?",
          category: "Behavioral",
          difficulty: "medium"
        },
        {
          question: `What technical skills do you think are most important for success in a ${setupData.jobTitle} role?`,
          category: "Technical",
          difficulty: "easy"
        },
        {
          question: "Walk me through a project you're particularly proud of. What was your role and what was the outcome?",
          category: "Behavioral",
          difficulty: "medium"
        },
        {
          question: `If you were to start in this ${setupData.jobTitle} position tomorrow, what would you focus on in your first 90 days?`,
          category: "Situational",
          difficulty: "hard"
        }
      ];

      setQuestions(mockQuestions);
      setCurrentStep('interview');
      toast({
        title: "Questions generated!",
        description: "Your mock interview is ready to begin."
      });
    } catch (error) {
      console.error('Question generation error:', error);
      toast({
        title: "Generation failed",
        description: "There was an error generating questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const analyzeAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "Please provide an answer",
        description: "Enter your response to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const currentQuestion = questions[currentQuestionIndex];
      const prompt = `Analyze this interview response using the STAR method:

Question: ${currentQuestion.question}
Answer: ${currentAnswer}

Provide:
1. STAR method breakdown (identify Situation, Task, Action, Result, Takeaway)
2. Overall feedback on the response
3. Specific suggestions for improvement
4. Score out of 10
5. What elements are missing or could be strengthened

Be constructive and specific in your feedback.`;

      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: {
          prompt: prompt,
          systemPrompt: "You are Arlo, an expert interview coach. Analyze interview responses using the STAR method and provide constructive, actionable feedback to help candidates improve.",
          model: 'mistralai/mistral-7b-instruct',
          maxTokens: 600,
          temperature: 0.3
        }
      });

      if (error) throw error;

      // Mock analysis for demo
      const mockResponse: InterviewResponse = {
        question: currentQuestion.question,
        answer: currentAnswer,
        feedback: "Good start! Your response shows relevant experience, but could be strengthened by providing more specific details about the outcome and quantifiable results. Consider structuring your response more clearly using the STAR method.",
        starAnalysis: {
          situation: "Partially identified - needs more context",
          task: "Clearly defined",
          action: "Well described with specific steps",
          result: "Mentioned but could use more detail",
          takeaway: "Missing - add what you learned"
        },
        score: 7
      };

      setResponses(prev => [...prev, mockResponse]);
      setCurrentAnswer("");
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setCurrentStep('review');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'destructive';
      default: return 'secondary';
    }
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
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Mock Interview</h1>
                <p className="text-muted-foreground">Practice with AI using the STAR method</p>
              </div>
            </div>
          </div>

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
              onClick={generateQuestions}
              disabled={!setupData.jobTitle || isGeneratingQuestions}
              className="w-full mt-6 gap-2"
              size="lg"
            >
              {isGeneratingQuestions ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Mock Interview
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (currentStep === 'interview') {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="min-h-screen refined-web-theme pb-20">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep('setup')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Setup
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Mock Interview</h1>
                  <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-lg font-semibold">{currentQuestionIndex + 1}/{questions.length}</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={getDifficultyColor(currentQuestion.difficulty) as any}>
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="outline">{currentQuestion.category}</Badge>
              </div>
              <h2 className="text-lg font-semibold mb-4">{currentQuestion.question}</h2>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Remember the STAR method:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li><strong>Situation:</strong> Set the context</li>
                  <li><strong>Task:</strong> Explain your responsibility</li>
                  <li><strong>Action:</strong> Describe what you did</li>
                  <li><strong>Result:</strong> Share the outcomes</li>
                  <li><strong>Takeaway:</strong> What you learned</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <Label htmlFor="answer">Your Response</Label>
              <Textarea
                id="answer"
                placeholder="Take your time to structure your response using the STAR method..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={10}
                className="mt-2"
              />
              <Button
                onClick={analyzeAnswer}
                disabled={!currentAnswer.trim() || isAnalyzing}
                className="w-full mt-4 gap-2"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    Analyzing Response...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Submit Answer
                  </>
                )}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Review step
  const averageScore = responses.reduce((sum, r) => sum + r.score, 0) / responses.length;
  
  return (
    <div className="min-h-screen refined-web-theme pb-20">
      <div className="max-w-6xl mx-auto p-6">
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
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Interview Complete!</h1>
              <p className="text-muted-foreground">Review your performance and feedback</p>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="p-6 mb-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Overall Score</h2>
            <div className="text-4xl font-bold text-primary mb-2">
              {averageScore.toFixed(1)}/10
            </div>
            <p className="text-muted-foreground">
              {averageScore >= 8 ? "Excellent performance!" : 
               averageScore >= 6 ? "Good job! Room for improvement." : 
               "Keep practicing - you'll get there!"}
            </p>
          </div>
        </Card>

        {/* Individual Responses */}
        <div className="space-y-6">
          {responses.map((response, index) => (
            <Card key={index} className="p-6">
              <h3 className="font-semibold mb-3">Question {index + 1}: {response.question}</h3>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Your Answer:</h4>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                  {response.answer}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  STAR Analysis
                  <Badge variant="outline">{response.score}/10</Badge>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {Object.entries(response.starAnalysis).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-sm capitalize">{key}</div>
                      <div className="text-xs text-muted-foreground mt-1">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Feedback:</h4>
                <p className="text-sm text-muted-foreground">{response.feedback}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <Button
            onClick={() => {
              setCurrentStep('setup');
              setResponses([]);
              setQuestions([]);
              setCurrentQuestionIndex(0);
              setCurrentAnswer("");
            }}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Start New Interview
          </Button>
          <Button onClick={() => navigate("/career")}>
            Back to Career Hub
          </Button>
        </div>
      </div>
    </div>
  );
}
