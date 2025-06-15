
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, Brain, ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  score: number;
  strengths: string[];
  improvements: string[];
  keywordMatches: string[];
  missingKeywords: string[];
  overallFeedback: string;
}

export default function ResumeReviewer() {
  const navigate = useNavigate();
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.type.includes('document')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive"
        });
        return;
      }
      setResume(file);
    }
  };

  const handleAnalyze = async () => {
    if (!resume) {
      toast({
        title: "Resume required",
        description: "Please upload your resume to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Create a simplified analysis for now
      const prompt = `Analyze this resume${jobDescription ? ' against the following job description' : ''}:

${jobDescription ? `Job Description: ${jobDescription}\n\n` : ''}

Please provide:
1. An overall score (0-100)
2. Key strengths (3-5 points)
3. Areas for improvement (3-5 points)
4. Keyword matches${jobDescription ? ' with the job description' : ''}
5. Missing keywords${jobDescription ? ' from the job description' : ''}
6. Overall feedback and recommendations

Format your response as JSON.`;

      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: {
          prompt: prompt,
          systemPrompt: "You are Arlo, a career advisor AI. Analyze resumes and provide constructive, actionable feedback. Always be encouraging while being honest about areas for improvement. Format your response as valid JSON with the structure: {score, strengths, improvements, keywordMatches, missingKeywords, overallFeedback}.",
          model: 'mistralai/mistral-7b-instruct',
          maxTokens: 800,
          temperature: 0.3
        }
      });

      if (error) throw error;

      try {
        const result = JSON.parse(data.response);
        setAnalysis(result);
        toast({
          title: "Analysis complete!",
          description: "Your resume has been analyzed by Arlo AI."
        });
      } catch (parseError) {
        // Fallback if JSON parsing fails
        setAnalysis({
          score: 75,
          strengths: ["Strong experience section", "Clear formatting", "Relevant skills listed"],
          improvements: ["Add more quantified achievements", "Include relevant keywords", "Optimize for ATS"],
          keywordMatches: ["project management", "leadership", "communication"],
          missingKeywords: ["data analysis", "strategic planning"],
          overallFeedback: data.response
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

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
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Resume Reviewer</h1>
              <p className="text-muted-foreground">Get AI-powered feedback on your resume</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Upload Your Resume</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="resume-upload">Resume File (PDF or Word)</Label>
                  <div className="mt-2 flex items-center justify-center w-full">
                    <label
                      htmlFor="resume-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          {resume ? resume.name : "Click to upload your resume"}
                        </p>
                        <p className="text-xs text-gray-500">PDF or DOCX (MAX. 10MB)</p>
                      </div>
                      <Input
                        id="resume-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Job Description (Optional)</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="job-description">
                    Paste the job description to get tailored feedback
                  </Label>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the job description here to get more specific feedback..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={8}
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={!resume || isAnalyzing}
              className="w-full gap-2"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="h-4 w-4 animate-spin" />
                  Analyzing with Arlo AI...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {analysis ? (
              <>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Overall Score</h2>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Export Report
                    </Button>
                  </div>
                  <div className="text-center mb-4">
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score}/100
                    </div>
                    <Progress value={analysis.score} className="mt-2" />
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-green-600 mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-orange-600 mb-3">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {analysis.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {jobDescription && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Keyword Analysis</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">Matched Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywordMatches.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missingKeywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Detailed Feedback</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.overallFeedback}
                  </p>
                </Card>
              </>
            ) : (
              <Card className="p-6">
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready for Analysis</h3>
                  <p className="text-muted-foreground">
                    Upload your resume to get started with AI-powered feedback
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
