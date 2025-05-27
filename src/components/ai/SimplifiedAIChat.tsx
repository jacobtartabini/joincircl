
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Send, 
  MessageCircle,
  Loader2,
  Trash2,
  Copy
} from "lucide-react";
import { Contact } from "@/types/contact";
import { toast } from "sonner";
import { useChatHistory } from "@/hooks/use-chat-history";
import { supabase } from "@/integrations/supabase/client";

interface SimplifiedAIChatProps {
  contacts: Contact[];
}

export default function SimplifiedAIChat({ contacts }: SimplifiedAIChatProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage, clearHistory } = useChatHistory();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessageContent = inputMessage;
    addMessage({
      role: 'user',
      content: userMessageContent
    });

    setInputMessage("");
    setIsLoading(true);

    try {
      // Create context about the user's network
      const networkContext = `The user has ${contacts.length} contacts in their network.`;
      
      // Get a sample of contacts for context (limit to avoid token overuse)
      const sampleContacts = contacts.slice(0, 3);
      const contactContext = sampleContacts.length > 0 
        ? `Sample contacts: ${sampleContacts.map(c => 
            `${c.name} (${c.circle} circle${c.company_name ? `, works at ${c.company_name}` : ''}${c.last_contact ? `, last contacted: ${new Date(c.last_contact).toLocaleDateString()}` : ''})`
          ).join(', ')}`
        : 'No contacts in network yet.';

      // Create a comprehensive system prompt for relationship assistance
      const systemPrompt = `You are a helpful relationship assistant for Circl, a relationship management app. 
      
      Help users with:
      - Relationship management and networking advice
      - Contact organization strategies
      - Communication tips and best practices
      - Building and maintaining professional and personal relationships
      - Follow-up strategies and timing
      - Networking event preparation
      - Reconnecting with old contacts
      
      User's context: ${networkContext} ${contactContext}
      
      Provide practical, actionable advice. Be warm, encouraging, and specific. If asked about contacts they don't have, suggest ways to build their network. Keep responses concise but helpful.`;

      // Enhanced prompt with context
      const enhancedPrompt = `User question: "${userMessageContent}"
      
      Context: ${networkContext} ${contactContext}
      
      Please provide helpful relationship management advice based on this question.`;

      console.log('Calling OpenRouter AI with prompt:', enhancedPrompt);

      // Call the OpenRouter edge function
      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: {
          prompt: enhancedPrompt,
          systemPrompt: systemPrompt,
          model: 'mistralai/mistral-7b-instruct',
          maxTokens: 500,
          temperature: 0.7
        }
      });

      if (error) {
        console.error('OpenRouter AI error:', error);
        throw new Error(`AI service error: ${error.message}`);
      }

      console.log('OpenRouter AI response:', data);
      
      const aiResponse = data?.response || "I'm here to help with your relationship management. Could you be more specific about what you'd like assistance with?";
      
      addMessage({
        role: 'assistant',
        content: aiResponse
      });

    } catch (error) {
      console.error('Error getting AI response:', error);
      addMessage({
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try asking about specific contacts, relationship advice, or networking strategies."
      });
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Message copied!");
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  const quickSuggestions = [
    "Who should I reach out to this week?",
    "Help me prioritize my contacts",
    "What's the best way to reconnect with someone?",
    "How can I build my professional network?"
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Relationship Assistant
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Ask me about managing your {contacts.length} contacts and building relationships
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  } rounded-lg p-3 relative group`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyMessage(message.content)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Try asking:</div>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(suggestion)}
                  className="text-xs h-8"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your contacts and relationships..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputMessage.trim()}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
