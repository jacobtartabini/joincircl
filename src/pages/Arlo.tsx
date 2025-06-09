
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, MessageCircle } from "lucide-react";
import { useContacts } from "@/hooks/use-contacts";
import { useChatHistory } from "@/hooks/use-chat-history";
import { PureMultimodalInput } from "@/components/ui/multimodal-ai-chat-input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface Attachment {
  url: string;
  name: string;
  contentType: string;
  size: number;
}

export default function Arlo() {
  const { contacts } = useContacts();
  const { messages, addMessage } = useChatHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async ({ input, attachments: messageAttachments }: { input: string; attachments: Attachment[] }) => {
    if (!input.trim() || isLoading) return;

    const userMessageContent = input;
    addMessage({
      role: 'user',
      content: userMessageContent
    });

    setIsLoading(true);

    try {
      const networkSummary = `Network: ${contacts.length} contacts (${contacts.filter(c => c.circle === 'inner').length} inner, ${contacts.filter(c => c.circle === 'middle').length} middle, ${contacts.filter(c => c.circle === 'outer').length} outer)`;
      
      const recentContacts = contacts.slice(0, 5);
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
          maxTokens: 400,
          temperature: 0.7
        }
      });

      if (error) {
        throw new Error(`AI service error: ${error.message}`);
      }
      
      const aiResponse = data?.response || "**How can I help?** Ask me about:\n\n• Your relationship network\n• Networking strategies\n• Follow-up timing\n• Communication best practices";
      
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
      toast.error("Arlo is temporarily unavailable");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopGenerating = () => {
    setIsLoading(false);
  };

  const formatMessage = (content: string) => {
    const sections = content.split('\n\n');
    return sections.map((section, index) => {
      if (section.includes('**') && section.includes('**')) {
        const parts = section.split('**');
        return (
          <div key={index} className="mb-4">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <strong key={partIndex} className="text-gray-900 font-semibold text-base">{part}</strong>
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
          <div key={index} className="mb-4">
            {lines.map((line, lineIndex) => {
              if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                return (
                  <div key={lineIndex} className="flex items-start gap-3 mb-2">
                    <span className="text-blue-500 mt-1.5 text-sm">•</span>
                    <span className="text-gray-700 leading-relaxed">{line.replace(/^[•-]\s*/, '')}</span>
                  </div>
                );
              }
              return <div key={lineIndex} className="text-gray-700 leading-relaxed mb-2">{line}</div>;
            })}
          </div>
        );
      }
      
      return <div key={index} className="mb-4 text-gray-700 leading-relaxed">{section}</div>;
    });
  };

  const MobileChatBubble = ({ message, isUser }: { message: any; isUser: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-3xl px-5 py-3 relative group",
          isUser
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
            : "bg-white border border-gray-100 text-gray-900 shadow-sm"
        )}
      >
        {isUser ? (
          <p className="text-base leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-gray-900">
            {formatMessage(message.content)}
          </div>
        )}
        
        <div className={cn(
          "text-xs mt-2 opacity-70",
          isUser ? "text-white/70" : "text-gray-500"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );

  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/20">
        {/* Mobile Header */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 p-6 pt-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Arlo</h1>
              <p className="text-sm text-gray-600">Your relationship assistant</p>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6 pb-24">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Hi! I'm Arlo 👋
                  </h3>
                  <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
                    I'm here to help you manage relationships and grow your network. What would you like to explore?
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {messages.map((message) => (
                    <MobileChatBubble
                      key={message.id}
                      message={message}
                      isUser={message.role === 'user'}
                    />
                  ))}
                </AnimatePresence>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Input Area */}
        <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 p-6 pb-8">
          <PureMultimodalInput
            chatId="arlo-mobile"
            messages={messages}
            attachments={attachments}
            setAttachments={setAttachments}
            onSendMessage={handleSendMessage}
            onStopGenerating={handleStopGenerating}
            isGenerating={isLoading}
            canSend={true}
            selectedVisibilityType="private"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col">
        {/* Header */}
        <div className="text-center py-8 flex-shrink-0">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">Arlo</h1>
              <p className="text-lg text-gray-600">Your intelligent relationship companion</p>
            </div>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col min-h-0">
          <Card className="flex-1 border-0 shadow-lg bg-white/90 backdrop-blur-sm flex flex-col min-h-0">
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              {/* Scrollable Messages Area */}
              <div className="flex-1 min-h-0 p-6">
                <ScrollArea className="h-full">
                  <div className="space-y-6 pr-4">
                    {messages.length === 0 && (
                      <div className="text-center py-12">
                        <MessageCircle className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Welcome to Arlo
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                          I'm here to help you manage relationships, plan networking activities, 
                          and make the most of your connections. What would you like to explore?
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
                            "max-w-[85%] rounded-2xl p-4 relative group",
                            message.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-50 border border-gray-200'
                          )}
                        >
                          {message.role === 'user' ? (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          ) : (
                            <div className="prose prose-sm max-w-none">
                              {formatMessage(message.content)}
                            </div>
                          )}
                          
                          <div className="text-xs opacity-70 mt-3">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Fixed Input Area */}
              <div className="flex-shrink-0 p-6 border-t border-gray-100 bg-white rounded-b-lg">
                <PureMultimodalInput
                  chatId="arlo-desktop"
                  messages={messages}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  onSendMessage={handleSendMessage}
                  onStopGenerating={handleStopGenerating}
                  isGenerating={isLoading}
                  canSend={true}
                  selectedVisibilityType="private"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
