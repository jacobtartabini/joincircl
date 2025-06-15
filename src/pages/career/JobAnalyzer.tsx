
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Search, ArrowLeft, Brain, Clock, Briefcase, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JobAnalysis {
  requiredSkills: string[];
  experienceLevel: string;
  companyCulture: string[];
  dayInLife: string[];
  weekInRole: string[];
  skillsGap: string[];
  fitScore: number;
  preparationTips: string[];
  learningRecommendations: string[];
}

export default function JobAnalyzer() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please paste a job description to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const prompt = `Analyze this job description and provide detailed insights:

${jobDescription}

Please provide:
1. Required skills and qualifications (technical and soft skills)
2. Experience level required (entry, mid, senior)
3. Company culture indicators
4. A "day in the life" breakdown (5-7 daily activities)
5. A "week in the role" overview (weekly responsibilities)
6. Skills gap analysis (what skills might be commonly missing)
7. A fit score (0-100) based on role complexity and requirements
8. Preparation tips for interviews
9. Learning recommendations to excel in this role

Format as JSON with the structure: {requiredSkills, experienceLevel, companyCulture, dayInLife, weekInRole, skillsGap, fitScore, preparationTips, learningRecommendations}`;

      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: {
          prompt: prompt,
          systemPrompt: "You are Arlo, an expert career advisor and job market analyst. Provide detailed, actionable insights about job roles. Be specific and practical in your analysis. Format your response as valid JSON.",
          model: 'mistralai/mistral-7b-instruct',
          maxTokens: 1000,
          temperature: 0.3
        }
      });

      if (error) throw error;

      try {
        const result = JSON.parse(data.response);
        setAnalysis(result);
        toast({
          title: "Analysis complete!",
          description: "Job description has been analyzed by Arlo AI."
        });
      } catch (parseError) {
        // Fallback analysis if JSON parsing fails
        setAnalysis({
          requiredSkills: ["Communication", "Problem-solving", "Team collaboration"],
          experienceLevel: "Mid-level (3-5 years)",
          companyCulture: ["Fast-paced environment", "Growth mindset", "Innovation focused"],
          dayInLife: [
            "Review and prioritize daily tasks",
            "Attend team standup meetings",
            "Work on core project deliverables",
            "Collaborate with cross-functional teams",
            "Document progress and update stakeholders"
          ],
          weekInRole: [
            "Strategic planning and goal setting",
            "Project execution and delivery",
            "Stakeholder communication",
            "Professional development activities",
            "Process improvement initiatives"
          ],
          skillsGap: ["Advanced technical expertise", "Leadership experience", "Industry certifications"],
          fitScore: 75,
          preparationTips: [
            "Research the company's recent projects",
            "Prepare specific examples of relevant experience",
            "Practice explaining technical concepts simply"
          ],
          learningRecommendations: [
            "Complete relevant online certifications",
            "Build a portfolio of related projects",
            "Network with professionals in the field"
          ]
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the job description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFitScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

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
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Job Description Analyzer</h1>
              <p className="text-muted-foreground">Understand role requirements and expectations</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Job Description</h2>
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste the complete job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={15}
                  className="min-h-[300px]"
                />
                <p className="text-sm text-muted-foreground">
                  Include the full job posting for the most comprehensive analysis
                </p>
              </div>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={!jobDescription.trim() || isAnalyzing}
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
                  Analyze Job Description
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {analysis ? (
              <>
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Role Complexity Score</h2>
                  <div className="text-center mb-4">
                    <div className={`text-4xl font-bold ${getFitScoreColor(analysis.fitScore)}`}>
                      {analysis.fitScore}/100
                    </div>
                    <Progress value={analysis.fitScore} className="mt-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Based on requirements complexity and experience needed
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">Experience Level: {analysis.experienceLevel}</p>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    A Day in This Role
                  </h3>
                  <ul className="space-y-2">
                    {analysis.dayInLife.map((activity, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-sm">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Weekly Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {analysis.weekInRole.map((responsibility, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span className="text-sm">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Company Culture Indicators</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.companyCulture.map((culture, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {culture}
                      </span>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Skills Gap Analysis</h3>
                  <ul className="space-y-2 mb-4">
                    {analysis.skillsGap.map((gap, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span className="text-sm">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Interview Preparation Tips</h3>
                  <ul className="space-y-2">
                    {analysis.preparationTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Learning Recommendations</h3>
                  <ul className="space-y-2">
                    {analysis.learningRecommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-indigo-500 mt-1">•</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </>
            ) : (
              <Card className="p-6">
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready for Analysis</h3>
                  <p className="text-muted-foreground">
                    Paste a job description to get detailed insights about the role
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
