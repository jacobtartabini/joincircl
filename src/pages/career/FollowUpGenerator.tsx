
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, ArrowLeft, Sparkles, Copy, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InterviewerInfo {
  name: string;
  role: string;
  personalNotes: string;
}

interface ThankYouEmail {
  interviewer: string;
  subject: string;
  content: string;
}

export default function FollowUpGenerator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    interviewDate: "",
    interviewType: "phone",
    overallImpression: "",
    keyTopics: "",
    nextSteps: ""
  });
  const [interviewers, setInterviewers] = useState<InterviewerInfo[]>([{ name: "", role: "", personalNotes: "" }]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [thankYouEmails, setThankYouEmails] = useState<ThankYouEmail[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterviewerChange = (index: number, field: string, value: string) => {
    setInterviewers(prev => prev.map((interviewer, i) => 
      i === index ? { ...interviewer, [field]: value } : interviewer
    ));
  };

  const addInterviewer = () => {
    setInterviewers(prev => [...prev, { name: "", role: "", personalNotes: "" }]);
  };

  const removeInterviewer = (index: number) => {
    setInterviewers(prev => prev.filter((_, i) => i !== index));
  };

  const generateThankYouEmails = async () => {
    if (!formData.companyName || !formData.jobTitle || interviewers.some(i => !i.name)) {
      toast({
        title: "Missing information",
        description: "Please fill in company name, job title, and all interviewer names.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const emails: ThankYouEmail[] = [];
      
      for (const interviewer of interviewers) {
        const prompt = `Generate a personalized thank you email for an interview follow-up.

Interview Details:
- Company: ${formData.companyName}
- Position: ${formData.jobTitle}
- Interview Date: ${formData.interviewDate}
- Interview Type: ${formData.interviewType}
- Overall Impression: ${formData.overallImpression}
- Key Topics Discussed: ${formData.keyTopics}
- Next Steps Mentioned: ${formData.nextSteps}

Interviewer Details:
- Name: ${interviewer.name}
- Role: ${interviewer.role}
- Personal Notes: ${interviewer.personalNotes}

Create a professional, personalized thank you email that:
1. References specific topics discussed during the interview
2. Reiterates interest in the position
3. Includes any follow-up items mentioned
4. Reflects the tone and style appropriate for this interviewer
5. Is genuine and not overly formal

Format as: Subject line followed by email body.`;

        const { data, error } = await supabase.functions.invoke('openrouter-ai', {
          body: {
            prompt: prompt,
            systemPrompt: "You are Arlo, a professional communication specialist. Generate authentic, personalized thank you emails that help candidates make a strong impression while maintaining professionalism.",
            model: 'mistralai/mistral-7b-instruct',
            maxTokens: 800,
            temperature: 0.7
          }
        });

        if (error) throw error;

        // Parse the response to extract subject and body
        const response = data.response;
        const subjectMatch = response.match(/Subject:?\s*(.+)/i);
        const subject = subjectMatch ? subjectMatch[1].trim() : `Thank you for the ${formData.jobTitle} interview`;
        
        const bodyStart = response.indexOf('\n') + 1;
        const content = response.substring(bodyStart).trim();

        emails.push({
          interviewer: interviewer.name,
          subject,
          content
        });
      }

      setThankYouEmails(emails);
      toast({
        title: "Thank you emails generated!",
        description: `Created ${emails.length} personalized email${emails.length > 1 ? 's' : ''}.`
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: "There was an error generating the emails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Email content has been copied to your clipboard."
    });
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
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Follow-Up & Thank You Generator</h1>
              <p className="text-muted-foreground">Generate personalized thank you emails for each interviewer</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Interview Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g., Google"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Software Engineer"
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interviewDate">Interview Date</Label>
                    <Input
                      id="interviewDate"
                      type="date"
                      value={formData.interviewDate}
                      onChange={(e) => handleInputChange("interviewDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="interviewType">Interview Type</Label>
                    <select
                      id="interviewType"
                      value={formData.interviewType}
                      onChange={(e) => handleInputChange("interviewType", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="phone">Phone</option>
                      <option value="video">Video Call</option>
                      <option value="in-person">In Person</option>
                      <option value="panel">Panel Interview</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="keyTopics">Key Topics Discussed</Label>
                  <Textarea
                    id="keyTopics"
                    placeholder="e.g., My React experience, their tech stack, company culture..."
                    value={formData.keyTopics}
                    onChange={(e) => handleInputChange("keyTopics", e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="overallImpression">Overall Interview Impression</Label>
                  <Textarea
                    id="overallImpression"
                    placeholder="How did the interview go? Any highlights or concerns?"
                    value={formData.overallImpression}
                    onChange={(e) => handleInputChange("overallImpression", e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="nextSteps">Next Steps Mentioned</Label>
                  <Textarea
                    id="nextSteps"
                    placeholder="What did they say about next steps or timeline?"
                    value={formData.nextSteps}
                    onChange={(e) => handleInputChange("nextSteps", e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Interviewers</h2>
                <Button onClick={addInterviewer} size="sm" variant="outline">
                  Add Interviewer
                </Button>
              </div>
              <div className="space-y-4">
                {interviewers.map((interviewer, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Interviewer {index + 1}</span>
                      {interviewers.length > 1 && (
                        <Button
                          onClick={() => removeInterviewer(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Name *</Label>
                        <Input
                          placeholder="e.g., John Smith"
                          value={interviewer.name}
                          onChange={(e) => handleInterviewerChange(index, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Role/Title</Label>
                        <Input
                          placeholder="e.g., Engineering Manager"
                          value={interviewer.role}
                          onChange={(e) => handleInterviewerChange(index, "role", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Personal Notes</Label>
                      <Textarea
                        placeholder="Specific things you discussed with this person..."
                        value={interviewer.personalNotes}
                        onChange={(e) => handleInterviewerChange(index, "personalNotes", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Button
              onClick={generateThankYouEmails}
              disabled={isGenerating}
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
                  Generate Thank You Emails
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {thankYouEmails.length > 0 ? (
              thankYouEmails.map((email, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Thank You Email for {email.interviewer}</h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(`Subject: ${email.subject}\n\n${email.content}`)}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Subject Line:</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded border">
                        <p className="text-sm font-medium">{email.subject}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email Content:</Label>
                      <div className="mt-1 p-4 bg-gray-50 rounded border">
                        <pre className="text-sm whitespace-pre-wrap font-sans">{email.content}</pre>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6">
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Generate</h3>
                  <p className="text-muted-foreground">
                    Fill in the interview details and interviewer information to generate personalized thank you emails
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
