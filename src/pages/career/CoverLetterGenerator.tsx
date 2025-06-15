
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, ArrowLeft, Copy, Download, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CoverLetterForm {
  jobTitle: string;
  companyName: string;
  hiringManager: string;
  jobDescription: string;
  personalExperience: string;
  tone: string;
}

export default function CoverLetterGenerator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CoverLetterForm>({
    jobTitle: "",
    companyName: "",
    hiringManager: "",
    jobDescription: "",
    personalExperience: "",
    tone: "professional"
  });
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof CoverLetterForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.jobTitle || !formData.companyName) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the job title and company name.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `Generate a professional cover letter with the following details:

Job Title: ${formData.jobTitle}
Company: ${formData.companyName}
${formData.hiringManager ? `Hiring Manager: ${formData.hiringManager}` : ''}
${formData.jobDescription ? `Job Description: ${formData.jobDescription}` : ''}

Personal Experience and Skills:
${formData.personalExperience}

Tone: ${formData.tone}

Please create a compelling cover letter that:
1. Has a strong opening that grabs attention
2. Highlights relevant experience and skills
3. Shows enthusiasm for the role and company
4. Includes specific examples when possible
5. Has a professional closing
6. Is tailored to the job requirements
7. Maintains the requested tone throughout

The letter should be well-structured and ready to send.`;

      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: {
          prompt: prompt,
          systemPrompt: "You are Arlo, a professional career advisor and expert cover letter writer. Create compelling, personalized cover letters that help candidates stand out while maintaining professionalism. Always include specific details from the provided information and make the letter feel authentic and tailored.",
          model: 'mistralai/mistral-7b-instruct',
          maxTokens: 800,
          temperature: 0.7
        }
      });

      if (error) throw error;

      setGeneratedLetter(data.response);
      toast({
        title: "Cover letter generated!",
        description: "Your personalized cover letter is ready for review."
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your cover letter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    toast({
      title: "Copied to clipboard",
      description: "Your cover letter has been copied to the clipboard."
    });
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.companyName}_${formData.jobTitle}_CoverLetter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
              <Pencil className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cover Letter Generator</h1>
              <p className="text-muted-foreground">Create personalized cover letters with AI</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Job Details</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Software Engineer, Marketing Manager"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., Google, Microsoft, Startup Inc."
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hiringManager">Hiring Manager (Optional)</Label>
                  <Input
                    id="hiringManager"
                    placeholder="e.g., John Smith, Ms. Johnson"
                    value={formData.hiringManager}
                    onChange={(e) => handleInputChange("hiringManager", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={formData.tone} onValueChange={(value) => handleInputChange("tone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Job Description (Optional)</h2>
              <Textarea
                placeholder="Paste the job description here to create a more tailored cover letter..."
                value={formData.jobDescription}
                onChange={(e) => handleInputChange("jobDescription", e.target.value)}
                rows={6}
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Your Experience & Skills</h2>
              <Textarea
                placeholder="Tell me about your relevant experience, skills, and achievements. Be specific about projects, technologies, or accomplishments that relate to this role..."
                value={formData.personalExperience}
                onChange={(e) => handleInputChange("personalExperience", e.target.value)}
                rows={8}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Include specific examples, metrics, and technologies when possible.
              </p>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.jobTitle || !formData.companyName}
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Generating with Arlo AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {generatedLetter ? (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Your Cover Letter</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                    {generatedLetter}
                  </pre>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Pro tip:</strong> Review and customize this letter before sending. 
                    Add specific details about why you want to work for this company and 
                    any connections you might have there.
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Generate</h3>
                  <p className="text-muted-foreground">
                    Fill in the job details and your experience to create a personalized cover letter
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
