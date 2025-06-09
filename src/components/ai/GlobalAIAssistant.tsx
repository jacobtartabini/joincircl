import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Send, 
  X,
  Minimize2,
  Maximize2,
  MessageCircle,
  Loader2,
  Copy,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Contact } from "@/types/contact";
import { toast } from "sonner";
import { useChatHistory } from "@/hooks/use-chat-history";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface GlobalAIAssistantProps {
  contacts?: Contact[];
  isOpen: boolean;
  onToggle: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
}

export default function GlobalAIAssistant({ 
  contacts = [], 
  isOpen, 
  onToggle, 
  isMinimized = false, 
  onMinimize 
}: GlobalAIAssistantProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { messages, addMessage, clearHistory } = useChatHistory();
  const isMobile = useIsMobile();

  // On mobile, don't render the global assistant as it's integrated into navigation
  if (isMobile) {
    return null;
  }

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

      const systemPrompt = `You're Arlo, Circl's relationship advisor. Provide helpful, structured responses.

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
      - Always refer to yourself as "Arlo"

      Focus areas: relationship maintenance, networking strategies, follow-up timing, communication best practices.

      ${networkSummary}
      ${contactContext}`;

      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: {
          prompt: userMessageContent,
          systemPrompt: systemPrompt,
          model: 'mistralai/mistral-7b-instruct',
          maxTokens: 300,
          temperature: 0.7
        }
      });

      if (error) {
        throw new Error(`AI service error: ${error.message}`);
      }
      
      const aiResponse = data?.response || "I'm here to help with your relationship and networking questions. What would you like to know?";
      
      addMessage({
        role: 'assistant',
        content: aiResponse
      });

    } catch (error) {
      console.error('Error getting AI response:', error);
      addMessage({
        role: 'assistant',
        content: "**Sorry!** I'm having trouble right now. Please try asking about:\n\n• Specific contacts or relationships\n• Networking strategies\n• Follow-up timing\n• Communication tips"
      });
      toast.error("Arlo is temporarily unavailable", {
        description: "Please try again in a moment"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

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

  const quickSuggestions = [
    "Who should I follow up with?",
    "How to reconnect with old contacts?",
    "Networking tips for this week",
    "Strengthen my inner circle"
  ];

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed z-50 transition-all duration-300",
      isMinimized 
        ? "bottom-4 right-4 w-80 h-16" // Desktop minimized
        : "bottom-4 right-4 w-96 h-[600px]" // Desktop expanded
    )}>
      <Card className="h-full border-0 shadow-xl bg-white/95 backdrop-blur-sm flex flex-col">
        <CardHeader className={cn(
          "border-b border-gray-100 flex-shrink-0",
          isMobile ? "pb-2" : "pb-3"
        )}>
          <div className="flex items-center justify-between">
            <CardTitle className={cn(
              "flex items-center gap-2",
              isMobile ? "text-sm" : "text-base"
            )}>
              <div className={cn(
                "bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center",
                isMobile ? "w-6 h-6" : "w-8 h-8"
              )}>
                <Brain className={cn(
                  "text-white",
                  isMobile ? "h-3 w-3" : "h-4 w-4"
                )} />
              </div>
              <span className="text-gray-900">Arlo</span>
            </CardTitle>
            <div className="flex items-center gap-1">
              {onMinimize && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMinimize}
                  className={cn(
                    "p-0 hover:bg-gray-100",
                    isMobile ? "h-6 w-6" : "h-8 w-8"
                  )}
                >
                  {isMinimized ? (
                    <ChevronUp className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                  ) : (
                    <ChevronDown className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className={cn(
                  "p-0 hover:bg-gray-100",
                  isMobile ? "h-6 w-6" : "h-8 w-8"
                )}
              >
                <X className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
              </Button>
            </div>
          </div>
          {!isMinimized && (
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="small">
                {contacts.length} contacts
              </Badge>
              <Badge variant="secondary" size="small">
                Smart insights
              </Badge>
            </div>
          )}
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Scrollable Messages Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className={cn(
                  "space-y-4",
                  isMobile ? "p-3" : "p-4"
                )}>
                  {messages.length === 0 && (
                    <div className={cn(
                      "text-center",
                      isMobile ? "py-6" : "py-8"
                    )}>
                      <MessageCircle className={cn(
                        "text-gray-300 mx-auto mb-3",
                        isMobile ? "h-10 w-10" : "h-12 w-12"
                      )} />
                      <p className={cn(
                        "text-gray-600 mb-4",
                        isMobile ? "text-xs" : "text-sm"
                      )}>
                        **Welcome!** I'm Arlo, your relationship assistant.
                      </p>
                      <p className={cn(
                        "text-gray-500",
                        isMobile ? "text-xs" : "text-xs"
                      )}>
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
                          "max-w-[85%] rounded-lg relative group",
                          isMobile ? "p-2" : "p-3",
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-50 border border-gray-200'
                        )}
                      >
                        {message.role === 'user' ? (
                          <p className={cn(isMobile ? "text-xs" : "text-sm")}>{message.content}</p>
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
                            className={cn(
                              "absolute opacity-0 group-hover:opacity-100 transition-opacity p-0 hover:bg-gray-200",
                              isMobile 
                                ? "top-1 right-1 h-5 w-5" 
                                : "top-1 right-1 h-6 w-6"
                            )}
                          >
                            <Copy className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                          </Button>
                        )}
                        
                        <div className={cn(
                          "opacity-70 mt-2",
                          isMobile ? "text-xs" : "text-xs"
                        )}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className={cn(
                        "bg-gray-50 border border-gray-200 rounded-lg",
                        isMobile ? "p-2" : "p-3"
                      )}>
                        <div className="flex items-center gap-2">
                          <Loader2 className={cn(
                            "animate-spin text-blue-500",
                            isMobile ? "h-3 w-3" : "h-4 w-4"
                          )} />
                          <span className={cn(
                            "text-gray-600",
                            isMobile ? "text-xs" : "text-sm"
                          )}>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 1 && (
              <div className={cn(
                "flex-shrink-0 border-t border-gray-100",
                isMobile ? "px-3 pb-2" : "px-4 pb-2"
              )}>
                <div className={cn(
                  "font-medium text-gray-700 mb-2 mt-2",
                  isMobile ? "text-xs" : "text-xs"
                )}>Quick questions:</div>
                <div className="flex flex-wrap gap-1">
                  {quickSuggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      size="small"
                      onClick={() => setInputMessage(suggestion)}
                      className="cursor-pointer hover:ring-border/50"
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Fixed Input Area */}
            <div className={cn(
              "flex-shrink-0 border-t border-gray-100 bg-white rounded-b-lg",
              isMobile ? "p-3" : "p-4"
            )}>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask Arlo about your network..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 border-gray-200 focus:border-blue-300",
                    isMobile ? "text-sm h-9" : "text-sm"
                  )}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !inputMessage.trim()}
                  size="sm"
                  className={cn(
                    "bg-blue-500 hover:bg-blue-600",
                    isMobile ? "h-9 px-3" : ""
                  )}
                >
                  {isLoading ? (
                    <Loader2 className={cn(
                      "animate-spin",
                      isMobile ? "h-3 w-3" : "h-4 w-4"
                    )} />
                  ) : (
                    <Send className={cn(
                      isMobile ? "h-3 w-3" : "h-4 w-4"
                    )} />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
