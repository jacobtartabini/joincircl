
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Copy, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LinkedInMessageGeneratorToolProps {
  onClose: () => void;
}

export function LinkedInMessageGeneratorTool({ onClose }: LinkedInMessageGeneratorToolProps) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientCompany, setRecipientCompany] = useState("");
  const [messageType, setMessageType] = useState("");
  const [context, setContext] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!recipientName || !messageType) {
      toast({
        title: "Missing Information",
        description: "Please fill in the recipient name and message type.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation (replace with actual AI call)
    setTimeout(() => {
      const templates = {
        connection: `Hi ${recipientName},\n\nI came across your profile and was impressed by your work at ${recipientCompany || 'your company'}. ${context ? `I noticed ${context.toLowerCase()} and ` : ''}I'd love to connect and learn more about your experience in the industry.\n\nBest regards`,
        job_inquiry: `Hello ${recipientName},\n\nI hope this message finds you well. I'm reaching out regarding potential opportunities at ${recipientCompany || 'your organization'}. ${context ? `${context} ` : ''}I'd appreciate the chance to discuss how my background might align with your team's needs.\n\nThank you for your time`,
        follow_up: `Hi ${recipientName},\n\nI wanted to follow up on our previous conversation${recipientCompany ? ` about opportunities at ${recipientCompany}` : ''}. ${context ? `${context} ` : ''}I'm still very interested and would love to continue our discussion.\n\nLooking forward to hearing from you`,
        informational: `Hello ${recipientName},\n\nI'm reaching out because I'm genuinely interested in learning more about your career path${recipientCompany ? ` at ${recipientCompany}` : ''}. ${context ? `${context} ` : ''}Would you be open to a brief conversation about your experience in the field?\n\nI'd greatly appreciate any insights you could share`
      };
      
      setGeneratedMessage(templates[messageType as keyof typeof templates] || "Please select a message type to generate a message.");
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast({
      title: "Copied to clipboard",
      description: "The LinkedIn message has been copied to your clipboard."
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-blue-600" />
            LinkedIn Message Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name *</Label>
              <Input
                id="recipientName"
                placeholder="John Smith"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipientCompany">Company (Optional)</Label>
              <Input
                id="recipientCompany"
                placeholder="Google, Microsoft, etc."
                value={recipientCompany}
                onChange={(e) => setRecipientCompany(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="messageType">Message Type *</Label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger className="bg-white/40 dark:bg-white/5 border-white/30 dark:border-white/15 backdrop-blur-sm">
                <SelectValue placeholder="Select message type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="connection">Connection Request</SelectItem>
                <SelectItem value="job_inquiry">Job Inquiry</SelectItem>
                <SelectItem value="follow_up">Follow-up Message</SelectItem>
                <SelectItem value="informational">Informational Interview</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (Optional)</Label>
            <Textarea
              id="context"
              placeholder="Any specific details you'd like to mention (mutual connections, shared interests, specific role, etc.)"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Message"}
          </Button>

          {generatedMessage && (
            <Card className="p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Generated Message</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <div className="whitespace-pre-wrap text-sm text-gray-700 border rounded-lg p-3 bg-white">
                {generatedMessage}
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
