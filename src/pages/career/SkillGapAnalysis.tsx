
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ListCheck, ArrowLeft, Sparkles, Plus, Trash2, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Skill {
  id: string;
  name: string;
  proficiency: string;
  yearsExperience: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  dateObtained: string;
  expirationDate: string;
}

interface SkillGap {
  skill: string;
  currentLevel: string;
  targetLevel: string;
  priority: 'high' | 'medium' | 'low';
  resources: Array<{
    title: string;
    type: string;
    url: string;
    description: string;
  }>;
}

interface AnalysisResult {
  strengths: string[];
  gaps: SkillGap[];
  learningPlan: string;
  timeline: string;
}

export default function SkillGapAnalysis() {
  const navigate = useNavigate();
  const [targetRole, setTargetRole] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [careerGoals, setCareerGoals] = useState("");
  const [skills, setSkills] = useState<Skill[]>([{ id: "1", name: "", proficiency: "beginner", yearsExperience: "" }]);
  const [certifications, setCertifications] = useState<Certification[]>([{ id: "1", name: "", issuer: "", dateObtained: "", expirationDate: "" }]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const addSkill = () => {
    setSkills(prev => [...prev, { id: Date.now().toString(), name: "", proficiency: "beginner", yearsExperience: "" }]);
  };

  const removeSkill = (id: string) => {
    setSkills(prev => prev.filter(skill => skill.id !== id));
  };

  const updateSkill = (id: string, field: string, value: string) => {
    setSkills(prev => prev.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const addCertification = () => {
    setCertifications(prev => [...prev, { id: Date.now().toString(), name: "", issuer: "", dateObtained: "", expirationDate: "" }]);
  };

  const removeCertification = (id: string) => {
    setCertifications(prev => prev.filter(cert => cert.id !== id));
  };

  const updateCertification = (id: string, field: string, value: string) => {
    setCertifications(prev => prev.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  const analyzeSkillGaps = async () => {
    if (!targetRole) {
      toast({
        title: "Target role required",
        description: "Please specify your target career role.",
        variant: "destructive"
      });
      return;
    }

    const validSkills = skills.filter(skill => skill.name.trim());
    if (validSkills.length === 0) {
      toast({
        title: "Skills required",
        description: "Please add at least one skill to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const prompt = `Conduct a comprehensive skill gap analysis for career development:

Target Career Information:
- Target Role: ${targetRole}
- Target Industry: ${targetIndustry}
- Career Goals: ${careerGoals}

Current Skills & Experience:
${validSkills.map(skill => `- ${skill.name}: ${skill.proficiency} level, ${skill.yearsExperience} years experience`).join('\n')}

Current Certifications:
${certifications.filter(cert => cert.name.trim()).map(cert => `- ${cert.name} from ${cert.issuer} (${cert.dateObtained})`).join('\n')}

Provide:
1. Top 5 current strengths that align with the target role
2. 5-7 key skill gaps to address, with priority levels (high/medium/low)
3. For each skill gap, suggest 2-3 specific learning resources (courses, certifications, books, or practice platforms)
4. A personalized 6-month learning plan with milestones
5. Estimated timeline to reach target proficiency

Focus on practical, actionable recommendations with specific resources and realistic timelines.`;

      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: {
          prompt: prompt,
          systemPrompt: "You are Arlo, a career development specialist. Provide detailed, practical skill gap analysis with specific learning resources and actionable development plans.",
          model: 'mistralai/mistral-7b-instruct',
          maxTokens: 1200,
          temperature: 0.7
        }
      });

      if (error) throw error;

      // Mock analysis for demo - in real implementation, parse AI response
      const mockAnalysis: AnalysisResult = {
        strengths: [
          "Strong foundation in core programming concepts",
          "Good problem-solving and analytical thinking",
          "Experience with version control systems",
          "Understanding of software development lifecycle",
          "Collaborative mindset and communication skills"
        ],
        gaps: [
          {
            skill: "Cloud Architecture (AWS/Azure)",
            currentLevel: "None",
            targetLevel: "Intermediate",
            priority: "high",
            resources: [
              {
                title: "AWS Certified Solutions Architect",
                type: "Certification",
                url: "https://aws.amazon.com/certification/",
                description: "Industry-standard certification for cloud architecture"
              },
              {
                title: "A Cloud Guru AWS Course",
                type: "Online Course",
                url: "https://acloudguru.com",
                description: "Comprehensive hands-on AWS training"
              }
            ]
          },
          {
            skill: "System Design",
            currentLevel: "Beginner",
            targetLevel: "Advanced",
            priority: "high",
            resources: [
              {
                title: "Designing Data-Intensive Applications",
                type: "Book",
                url: "https://dataintensive.net/",
                description: "Essential book for understanding large-scale systems"
              },
              {
                title: "System Design Interview Course",
                type: "Online Course",
                url: "https://www.educative.io/courses/grokking-the-system-design-interview",
                description: "Practical system design patterns and examples"
              }
            ]
          },
          {
            skill: "Leadership & Team Management",
            currentLevel: "None",
            targetLevel: "Intermediate",
            priority: "medium",
            resources: [
              {
                title: "The Manager's Path",
                type: "Book",
                url: "https://www.oreilly.com/library/view/the-managers-path/9781491973882/",
                description: "Guide for transitioning from developer to technical leader"
              },
              {
                title: "LinkedIn Learning Leadership Courses",
                type: "Online Course",
                url: "https://www.linkedin.com/learning/",
                description: "Various leadership and management skill courses"
              }
            ]
          }
        ],
        learningPlan: "Focus on cloud architecture and system design first (months 1-4), then transition to leadership skills (months 5-6). Dedicate 10-15 hours per week to learning.",
        timeline: "6-9 months to reach target proficiency levels with consistent effort"
      };

      setAnalysis(mockAnalysis);
      toast({
        title: "Analysis complete!",
        description: "Your personalized skill gap analysis and learning plan is ready."
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your skills. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
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
              <ListCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Skill Gap & Learning Plan</h1>
              <p className="text-muted-foreground">Analyze skill gaps and get personalized learning recommendations</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Career Goals</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="targetRole">Target Role *</Label>
                  <Input
                    id="targetRole"
                    placeholder="e.g., Senior Software Engineer, Product Manager"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="targetIndustry">Target Industry</Label>
                  <Input
                    id="targetIndustry"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={targetIndustry}
                    onChange={(e) => setTargetIndustry(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="careerGoals">Career Goals & Timeline</Label>
                  <Textarea
                    id="careerGoals"
                    placeholder="What do you want to achieve? Any specific timeline?"
                    value={careerGoals}
                    onChange={(e) => setCareerGoals(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Current Skills</h2>
                <Button onClick={addSkill} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </div>
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={skill.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Skill {index + 1}</span>
                      {skills.length > 1 && (
                        <Button
                          onClick={() => removeSkill(skill.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Skill Name *</Label>
                        <Input
                          placeholder="e.g., JavaScript, Project Management"
                          value={skill.name}
                          onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Proficiency Level</Label>
                        <select
                          value={skill.proficiency}
                          onChange={(e) => updateSkill(skill.id, "proficiency", e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                      <div>
                        <Label>Years Experience</Label>
                        <Input
                          placeholder="e.g., 2"
                          value={skill.yearsExperience}
                          onChange={(e) => updateSkill(skill.id, "yearsExperience", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Certifications</h2>
                <Button onClick={addCertification} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </Button>
              </div>
              <div className="space-y-4">
                {certifications.map((cert, index) => (
                  <div key={cert.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Certification {index + 1}</span>
                      {certifications.length > 1 && (
                        <Button
                          onClick={() => removeCertification(cert.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Certification Name</Label>
                        <Input
                          placeholder="e.g., AWS Solutions Architect"
                          value={cert.name}
                          onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Issuing Organization</Label>
                        <Input
                          placeholder="e.g., Amazon Web Services"
                          value={cert.issuer}
                          onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Date Obtained</Label>
                        <Input
                          type="date"
                          value={cert.dateObtained}
                          onChange={(e) => updateCertification(cert.id, "dateObtained", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Expiration Date</Label>
                        <Input
                          type="date"
                          value={cert.expirationDate}
                          onChange={(e) => updateCertification(cert.id, "expirationDate", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Button
              onClick={analyzeSkillGaps}
              disabled={isAnalyzing}
              className="w-full gap-2"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Analyzing with Arlo AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze Skill Gaps
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {analysis ? (
              <>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Your Strengths
                  </h3>
                  <div className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Skill Gaps to Address
                  </h3>
                  <div className="space-y-4">
                    {analysis.gaps.map((gap, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{gap.skill}</h4>
                          <Badge variant={getPriorityColor(gap.priority) as any}>
                            {gap.priority} priority
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          <span className="font-medium">Current:</span> {gap.currentLevel} → 
                          <span className="font-medium"> Target:</span> {gap.targetLevel}
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Recommended Resources:</h5>
                          {gap.resources.map((resource, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{resource.title}</span>
                                  <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                              </div>
                              <Button size="sm" variant="ghost" className="p-1">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Learning Plan & Timeline</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Recommended Approach:</h4>
                      <p className="text-sm text-muted-foreground">{analysis.learningPlan}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Timeline:</h4>
                      <p className="text-sm text-muted-foreground">{analysis.timeline}</p>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-6">
                <div className="text-center py-8">
                  <ListCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
                  <p className="text-muted-foreground">
                    Enter your target role and current skills to get a personalized skill gap analysis
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
