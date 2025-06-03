
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Send, 
  Loader2,
  Trash2,
  Copy
} from "lucide-react";
import { Contact } from "@/types/contact";
import { toast } from "sonner";
import { useChatHistory } from "@/hooks/use-chat-history";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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

  const formatMessage = (content: string) => {
    const sections = content.split('\n\n');
    return sections.map((section, index) => {
      if (section.includes('**') && section.includes('**')) {
        const parts = section.split('**');
        return (
          <div key={index} className="mb-3">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <strong key={partIndex} className="text-gray-900 font-semibold">{part}</strong>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
          </div>
        );
      }
      
      if (section.includes('•') || section.includes('-')) {
        const lines = section.split('\n');
        return (
          <div key={index} className="mb-3">
            {lines.map((line, lineIndex) => {
              if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                return (
                  <div key={lineIndex} className="flex items-start gap-2 mb-1">
                    <span className="text-blue-500 mt-1 text-xs">•</span>
                    <span className="text-sm">{line.replace(/^[•-]\s*/, '')}</span>
                  </div>
                );
              }
              return <div key={lineIndex} className="text-sm mb-1">{line}</div>;
            })}
          </div>
        );
      }
      
      return <div key={index} className="mb-3 text-sm leading-relaxed">{section}</div>;
    });
  };

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
      const networkSummary = `Network: ${contacts.length} contacts (${contacts.filter(c => c.circle === 'inner').length} inner, ${contacts.filter(c => c.circle === 'middle').length} middle, ${contacts.filter(c => c.circle === 'outer').length} outer)`;
      
      const recentContacts = contacts.slice(0, 3);
      const contactContext = recentContacts.length > 0 
        ? `Recent contacts: ${recentContacts.map(c => 
            `${c.name} (${c.circle}${c.last_contact ? `, last: ${new Date(c.last_contact).toLocaleDateString()}` : ''})`
          ).join(', ')}`
        : 'No contacts yet';

      const systemPrompt = `You're Circl's relationship advisor. Provide helpful, structured responses.

      **Formatting Guidelines:**
      - Use **bold headers** for main topics
      - Break information into bullet points or numbered lists
      - Keep paragraphs short (2-3 sentences max)
      - Use clear sections for different aspects
      - Be concise but comprehensive
      - Adapt length to question complexity

      **Tone Guidelines:**
      - Be friendly and professional
      - Use "you" and "your" - be personal
      - Give specific, actionable advice
      - Sound like a knowledgeable assistant

      Focus areas: relationship maintenance, networking strategies, follow-up timing, communication best practices.

      ${networkSummary}
      ${contactContext}`;

      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: {
          prompt: userMessageContent,
          systemPrompt: systemPrompt,
          model: 'mistralai/mistral-7b-instruct',
          maxTokens: 250,
          temperature: 0.7
        }
      });

      if (error) {
        throw new Error(`AI service error: ${error.message}`);
      }
      
      const aiResponse = data?.response || "**How can I help?** Ask me about:\n\n• Networking strategies\n• Follow-up timing\n• Relationship building\n• Communication tips";
      
      addMessage({
        role: 'assistant',
        content: aiResponse
      });

    } catch (error) {
      console.error('Error getting AI response:', error);
      addMessage({
        role: 'assistant',
        content: "**Sorry!** I'm having trouble right now. Try asking about:\n\n• Specific contacts or relationships\n• Networking strategies\n• Follow-up timing\n• Communication tips"
      });
      toast.error("AI temporarily unavailable");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied!");
    } catch (error) {
      toast.error("Copy failed");
    }
  };

  const quickSuggestions = [
    "Who should I reach out to this week?",
    "How do I reconnect with old contacts?",
    "Best follow-up timing?",
    "Strengthen my inner circle"
  ];

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
      <Card className="flex flex-col h-full border-0 shadow-none">
        <CardContent className="flex-1 flex flex-col p-4 min-h-0">
          {/* Messages */}
          <div className="flex-1 min-h-0 mb-4">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-blue-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      **Welcome!** I'm your relationship assistant.
                    </p>
                    <p className="text-xs text-gray-500">
                      Ask me about networking, follow-ups, or relationship strategies.
                    </p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg p-3 relative group",
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-50 border border-gray-200'
                      )}
                    >
                      {message.role === 'user' ? (
                        <p className="text-sm">{message.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          {formatMessage(message.content)}
                        </div>
                      )}
                      
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyMessage(message.content)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-gray-200"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="mb-4 flex-shrink-0">
              <div className="text-sm font-medium mb-2 text-gray-700">Quick questions:</div>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage(suggestion)}
                    className="text-xs h-8 border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 flex-shrink-0">
            <Input
              placeholder="Ask about your network..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              disabled={isLoading}
              className="flex-1 border-gray-200 focus:border-blue-300"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputMessage.trim()}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
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
    </div>
  );
}
