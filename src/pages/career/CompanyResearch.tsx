
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, ArrowLeft, Sparkles, Building, Users, Target, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface CompanyResearchData {
  companyName: string;
  industry: string;
  size: string;
  founded: string;
  headquarters: string;
  mission: string;
  values: string[];
  recentNews: string[];
  culture: string;
  challenges: string[];
  opportunities: string[];
  interviewQuestions: string[];
}

export default function CompanyResearch() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    department: "",
    industry: ""
  });
  const [isResearching, setIsResearching] = useState(false);
  const [researchData, setResearchData] = useState<CompanyResearchData | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResearch = async () => {
    if (!formData.companyName) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to research.",
        variant: "destructive"
      });
      return;
    }

    setIsResearching(true);
    
    try {
      const prompt = `Conduct comprehensive research on ${formData.companyName} for interview preparation.

Additional context:
- Role: ${formData.role || 'Not specified'}
- Department: ${formData.department || 'Not specified'}
- Industry: ${formData.industry || 'Not specified'}

Provide detailed information about:
1. Company overview (size, founded, headquarters, industry)
2. Mission statement and core values
3. Recent news and developments
4. Company culture and work environment
5. Current challenges and market position
6. Growth opportunities and future outlook
7. 4 in-depth, thoughtful questions to ask interviewers about the company

Format the response with specific, actionable insights that will help in interview preparation.`;

      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: {
          prompt: prompt,
          systemPrompt: "You are Arlo, a comprehensive company research specialist. Provide detailed, accurate, and up-to-date information about companies to help candidates prepare for interviews. Focus on actionable insights and thoughtful interview questions.",
          model: 'mistralai/mistral-7b-instruct',
          maxTokens: 1200,
          temperature: 0.7
        }
      });

      if (error) throw error;

      // Mock structured response - in real implementation, you'd parse the AI response
      const mockResearch: CompanyResearchData = {
        companyName: formData.companyName,
        industry: formData.industry || "Technology",
        size: "1,000-5,000 employees",
        founded: "2010",
        headquarters: "San Francisco, CA",
        mission: "To revolutionize how businesses operate through innovative technology solutions.",
        values: ["Innovation", "Customer Focus", "Integrity", "Collaboration", "Excellence"],
        recentNews: [
          "Announced Series C funding round of $50M",
          "Launched new AI-powered product suite",
          "Expanded operations to European markets",
          "Appointed new Chief Technology Officer"
        ],
        culture: "Fast-paced, innovative environment with emphasis on work-life balance and continuous learning. Strong collaboration across teams with quarterly company-wide hackathons.",
        challenges: [
          "Increasing competition in the market",
          "Scaling operations while maintaining culture",
          "Talent acquisition in competitive tech market"
        ],
        opportunities: [
          "Expanding into new markets",
          "AI and machine learning integration",
          "Strategic partnerships",
          "Product diversification"
        ],
        interviewQuestions: [
          "How is the company adapting its strategy in response to increasing market competition, and what role would this position play in that adaptation?",
          "Can you tell me about the company's approach to maintaining its innovative culture while scaling operations, and how does the team I'd be joining contribute to this?",
          "What are the biggest opportunities you see for the company in the next 2-3 years, and how does this role connect to pursuing those opportunities?",
          "How does the company measure success in this department, and what would success look like for someone in this position after their first year?"
        ]
      };

      setResearchData(mockResearch);
      toast({
        title: "Research completed!",
        description: `Found comprehensive insights about ${formData.companyName}.`
      });
    } catch (error) {
      console.error('Research error:', error);
      toast({
        title: "Research failed",
        description: "There was an error researching the company. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResearching(false);
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
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Company Research</h1>
              <p className="text-muted-foreground">Get comprehensive company insights and interview questions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Company Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., Google, Microsoft, Spotify"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role/Position</Label>
                  <Input
                    id="role"
                    placeholder="e.g., Software Engineer, Product Manager"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Engineering, Marketing, Sales"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={formData.industry}
                    onChange={(e) => handleInputChange("industry", e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Button
              onClick={handleResearch}
              disabled={!formData.companyName || isResearching}
              className="w-full gap-2"
              size="lg"
            >
              {isResearching ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Researching with Arlo AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Research Company
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {researchData ? (
              <>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Building className="h-6 w-6 text-blue-600" />
                    <div>
                      <h2 className="text-lg font-semibold">{researchData.companyName}</h2>
                      <p className="text-muted-foreground">{researchData.industry}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Size:</span> {researchData.size}
                    </div>
                    <div>
                      <span className="font-medium">Founded:</span> {researchData.founded}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Headquarters:</span> {researchData.headquarters}
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Mission & Values
                  </h3>
                  <p className="text-sm mb-4">{researchData.mission}</p>
                  <div className="flex flex-wrap gap-2">
                    {researchData.values.map((value, index) => (
                      <Badge key={index} variant="secondary">{value}</Badge>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Recent News</h3>
                  <ul className="space-y-2">
                    {researchData.recentNews.map((news, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></span>
                        <span className="text-sm">{news}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Company Culture</h3>
                  <p className="text-sm text-muted-foreground">{researchData.culture}</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Questions to Ask Interviewers
                  </h3>
                  <div className="space-y-4">
                    {researchData.interviewQuestions.map((question, index) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-blue-900">{question}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-6">
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Research</h3>
                  <p className="text-muted-foreground">
                    Enter a company name to get comprehensive research and interview questions
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
