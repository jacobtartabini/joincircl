
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Copy, MessageSquare, Loader2, Wand2 } from "lucide-react";
import { Contact } from "@/types/contact";
import { aiService, MessageTemplate } from "@/services/aiService";
import { toast } from "sonner";

interface AIMessageGeneratorProps {
  contact: Contact;
}

export default function AIMessageGenerator({ contact }: AIMessageGeneratorProps) {
  const [context, setContext] = useState("");
  const [messageType, setMessageType] = useState<'text' | 'email' | 'social'>('text');
  const [generatedTemplate, setGeneratedTemplate] = useState<MessageTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateMessage = async () => {
    if (!context.trim()) {
      toast.error("Please provide some context for the message");
      return;
    }

    setIsLoading(true);
    try {
      const template = await aiService.generateMessageTemplate(contact, context, messageType);
      setGeneratedTemplate(template);
      toast.success("Message template generated!");
    } catch (error) {
      console.error("Error generating message:", error);
      toast.error("Failed to generate message template");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'casual': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-purple-100 text-purple-800';
      case 'friendly': return 'bg-green-100 text-green-800';
      case 'formal': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          AI Message Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="message-type">Message Type</Label>
          <Select value={messageType} onValueChange={(value: 'text' | 'email' | 'social') => setMessageType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select message type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Message</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="context">Context & Purpose</Label>
          <Textarea
            id="context"
            placeholder="e.g., 'Checking in after their job promotion' or 'Following up on our coffee meeting last month'"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          onClick={generateMessage} 
          disabled={isLoading || !context.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Message
            </>
          )}
        </Button>

        {generatedTemplate && (
          <div className="mt-6 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Generated {generatedTemplate.type}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getToneColor(generatedTemplate.tone)}`}>
                  {generatedTemplate.tone}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(
                  generatedTemplate.subject 
                    ? `Subject: ${generatedTemplate.subject}\n\n${generatedTemplate.content}`
                    : generatedTemplate.content
                )}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>

            {generatedTemplate.subject && (
              <div className="mb-2">
                <Label className="text-xs text-muted-foreground">Subject:</Label>
                <p className="font-medium">{generatedTemplate.subject}</p>
              </div>
            )}

            <div>
              <Label className="text-xs text-muted-foreground">Message:</Label>
              <p className="whitespace-pre-wrap mt-1">{generatedTemplate.content}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
