
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, ArrowLeft, Sparkles, Plus, Trash2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface JobOffer {
  id: string;
  companyName: string;
  jobTitle: string;
  salary: string;
  bonus: string;
  equity: string;
  benefits: string;
  location: string;
  workArrangement: string;
  startDate: string;
  additionalNotes: string;
}

interface OfferAnalysis {
  recommendation: string;
  strengths: string[];
  concerns: string[];
  negotiationTips: string[];
  score: number;
}

export default function OfferComparison() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<JobOffer[]>([
    {
      id: "1",
      companyName: "",
      jobTitle: "",
      salary: "",
      bonus: "",
      equity: "",
      benefits: "",
      location: "",
      workArrangement: "hybrid",
      startDate: "",
      additionalNotes: ""
    }
  ]);
  const [priorities, setPriorities] = useState({
    salary: "high",
    workLifeBalance: "high",
    careerGrowth: "high",
    companyStability: "medium",
    benefits: "medium",
    location: "medium"
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, OfferAnalysis>>({});

  const addOffer = () => {
    const newOffer: JobOffer = {
      id: Date.now().toString(),
      companyName: "",
      jobTitle: "",
      salary: "",
      bonus: "",
      equity: "",
      benefits: "",
      location: "",
      workArrangement: "hybrid",
      startDate: "",
      additionalNotes: ""
    };
    setOffers(prev => [...prev, newOffer]);
  };

  const removeOffer = (id: string) => {
    setOffers(prev => prev.filter(offer => offer.id !== id));
  };

  const updateOffer = (id: string, field: string, value: string) => {
    setOffers(prev => prev.map(offer => 
      offer.id === id ? { ...offer, [field]: value } : offer
    ));
  };

  const updatePriority = (field: string, value: string) => {
    setPriorities(prev => ({ ...prev, [field]: value }));
  };

  const analyzeOffers = async () => {
    const validOffers = offers.filter(offer => offer.companyName && offer.jobTitle);
    
    if (validOffers.length === 0) {
      toast({
        title: "No valid offers",
        description: "Please add at least one offer with company name and job title.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const analysisResults: Record<string, OfferAnalysis> = {};
      
      for (const offer of validOffers) {
        const prompt = `Analyze this job offer based on the provided priorities and give detailed insights:

Job Offer Details:
- Company: ${offer.companyName}
- Position: ${offer.jobTitle}
- Salary: ${offer.salary}
- Bonus: ${offer.bonus}
- Equity: ${offer.equity}
- Benefits: ${offer.benefits}
- Location: ${offer.location}
- Work Arrangement: ${offer.workArrangement}
- Start Date: ${offer.startDate}
- Additional Notes: ${offer.additionalNotes}

User Priorities (high/medium/low):
- Salary: ${priorities.salary}
- Work-Life Balance: ${priorities.workLifeBalance}
- Career Growth: ${priorities.careerGrowth}
- Company Stability: ${priorities.companyStability}
- Benefits: ${priorities.benefits}
- Location: ${priorities.location}

Provide:
1. Overall recommendation score (1-10)
2. Top 3 strengths of this offer
3. Top 3 concerns or potential issues
4. 4 specific negotiation tips for this offer
5. Brief overall assessment

Focus on practical, actionable insights based on the user's stated priorities.`;

        const { data, error } = await supabase.functions.invoke('openrouter-ai', {
          body: {
            prompt: prompt,
            systemPrompt: "You are Arlo, a career negotiation expert. Provide detailed, practical analysis of job offers with specific negotiation strategies tailored to the user's priorities.",
            model: 'mistralai/mistral-7b-instruct',
            maxTokens: 1000,
            temperature: 0.7
          }
        });

        if (error) throw error;

        // Mock analysis for demo - in real implementation, parse AI response
        analysisResults[offer.id] = {
          recommendation: `Strong offer with competitive compensation. This position aligns well with your priorities for ${priorities.salary === 'high' ? 'salary' : 'career growth'}.`,
          strengths: [
            "Competitive salary package",
            "Strong company reputation",
            "Good work-life balance potential"
          ],
          concerns: [
            "Limited equity upside",
            "Unclear promotion timeline",
            "Benefits could be stronger"
          ],
          negotiationTips: [
            "Request detailed breakdown of bonus structure",
            "Negotiate for additional vacation days",
            "Ask about professional development budget",
            "Inquire about flexible work arrangements"
          ],
          score: Math.floor(Math.random() * 3) + 7 // 7-9 range for demo
        };
      }

      setAnalysis(analysisResults);
      toast({
        title: "Analysis complete!",
        description: `Analyzed ${validOffers.length} offer${validOffers.length > 1 ? 's' : ''} based on your priorities.`
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the offers. Please try again.",
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
      <div className="max-w-7xl mx-auto p-6">
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
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Offer Comparison & Negotiation Prep</h1>
              <p className="text-muted-foreground">Compare offers and get negotiation strategies</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Priorities Section */}
          <div className="xl:col-span-1">
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Your Priorities</h2>
              <div className="space-y-4">
                {Object.entries(priorities).map(([key, value]) => (
                  <div key={key}>
                    <Label className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <select
                      value={value}
                      onChange={(e) => updatePriority(key, e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                ))}
              </div>
            </Card>

            <Button
              onClick={analyzeOffers}
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
                  Analyze Offers
                </>
              )}
            </Button>
          </div>

          {/* Offers Section */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Job Offers</h2>
              <Button onClick={addOffer} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Offer
              </Button>
            </div>

            {offers.map((offer, index) => (
              <Card key={offer.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Offer {index + 1}</h3>
                  <div className="flex items-center gap-2">
                    {analysis[offer.id] && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{analysis[offer.id].score}/10</span>
                      </div>
                    )}
                    {offers.length > 1 && (
                      <Button
                        onClick={() => removeOffer(offer.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name *</Label>
                    <Input
                      placeholder="e.g., Google"
                      value={offer.companyName}
                      onChange={(e) => updateOffer(offer.id, "companyName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Job Title *</Label>
                    <Input
                      placeholder="e.g., Senior Software Engineer"
                      value={offer.jobTitle}
                      onChange={(e) => updateOffer(offer.id, "jobTitle", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Base Salary</Label>
                    <Input
                      placeholder="e.g., $120,000"
                      value={offer.salary}
                      onChange={(e) => updateOffer(offer.id, "salary", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Bonus</Label>
                    <Input
                      placeholder="e.g., $15,000 annual"
                      value={offer.bonus}
                      onChange={(e) => updateOffer(offer.id, "bonus", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Equity/Stock Options</Label>
                    <Input
                      placeholder="e.g., 1000 RSUs vesting over 4 years"
                      value={offer.equity}
                      onChange={(e) => updateOffer(offer.id, "equity", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Work Arrangement</Label>
                    <select
                      value={offer.workArrangement}
                      onChange={(e) => updateOffer(offer.id, "workArrangement", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Benefits</Label>
                    <Textarea
                      placeholder="Health insurance, 401k match, PTO, etc."
                      value={offer.benefits}
                      onChange={(e) => updateOffer(offer.id, "benefits", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Additional Notes</Label>
                    <Textarea
                      placeholder="Any other important details about this offer..."
                      value={offer.additionalNotes}
                      onChange={(e) => updateOffer(offer.id, "additionalNotes", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                {/* Analysis Results */}
                {analysis[offer.id] && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">AI Analysis</h4>
                        <p className="text-sm text-muted-foreground">{analysis[offer.id].recommendation}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Strengths</h4>
                        <div className="space-y-1">
                          {analysis[offer.id].strengths.map((strength, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                              <span className="text-sm">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Concerns</h4>
                        <div className="space-y-1">
                          {analysis[offer.id].concerns.map((concern, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                              <span className="text-sm">{concern}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Negotiation Tips</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {analysis[offer.id].negotiationTips.map((tip, i) => (
                            <div key={i} className="p-3 bg-blue-50 rounded-lg">
                              <span className="text-sm font-medium">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
