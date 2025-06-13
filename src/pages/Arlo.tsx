
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, MessageCircle } from "lucide-react";
import { useContacts } from "@/hooks/use-contacts";
import { useConversations } from "@/hooks/use-conversations";
import { PureMultimodalInput } from "@/components/ui/multimodal-ai-chat-input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import ConversationSidebar from "@/components/ai/ConversationSidebar";
import ConversationStarters from "@/components/ai/ConversationStarters";

interface Attachment {
  url: string;
  name: string;
  contentType: string;
  size: number;
}

export default function Arlo() {
  const { contacts } = useContacts();
  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createNewConversation,
    deleteConversation,
    renameConversation,
    addMessage
  } = useConversations();
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const handleSendMessage = async ({
    input,
    attachments: messageAttachments
  }: {
    input: string;
    attachments: Attachment[];
  }) => {
    if (!input.trim() || isLoading) return;

    // Create conversation if this is the first message
    let conversationId = activeConversationId;
    if (!conversationId || conversations.length === 0) {
      conversationId = createNewConversation();
      setHasStartedConversation(true);
    }

    if (!conversationId) return;

    const userMessageContent = input;
    addMessage(conversationId, {
      role: 'user',
      content: userMessageContent
    });

    setInputValue("");
    setIsLoading(true);

    try {
      const networkSummary = `Network: ${contacts.length} contacts (${contacts.filter(c => c.circle === 'inner').length} inner, ${contacts.filter(c => c.circle === 'middle').length} middle, ${contacts.filter(c => c.circle === 'outer').length} outer)`;
      const recentContacts = contacts.slice(0, 5);
      const contactContext = recentContacts.length > 0 ? `Recent contacts: ${recentContacts.map(c => `${c.name} (${c.circle}${c.last_contact ? `, last: ${new Date(c.last_contact).toLocaleDateString()}` : ''})`).join(', ')}` : 'No contacts yet';

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

      addMessage(conversationId, {
        role: 'assistant',
        content: aiResponse
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      addMessage(conversationId, {
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

  const handlePromptSelect = (prompt: string) => {
    setInputValue(prompt);
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
                <strong key={partIndex} className="text-gray-900 dark:text-white font-semibold text-base">
                  {part}
                </strong>
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
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {line.replace(/^[•-]\s*/, '')}
                    </span>
                  </div>
                );
              }
              return (
                <div key={lineIndex} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  {line}
                </div>
              );
            })}
          </div>
        );
      }

      return (
        <div key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
          {section}
        </div>
      );
    });
  };

  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/20 dark:from-gray-900 dark:to-blue-900/20 pb-20">
        {/* Mobile Header */}
        <div className="flex-shrink-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-white/20 dark:border-white/10 p-6 pt-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Arlo</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your relationship assistant</p>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6 pb-32">
              {!activeConversation || activeConversation.messages.length <= 1 ? (
                <ConversationStarters onSelectPrompt={handlePromptSelect} />
              ) : (
                <AnimatePresence>
                  {activeConversation.messages.slice(1).map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={cn(
                        "flex mb-4",
                        message.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[85%] rounded-3xl px-5 py-3 relative group",
                        message.role === 'user' 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                          : "glass-card text-gray-900 dark:text-white"
                      )}>
                        {message.role === 'user' ? (
                          <p className="text-base leading-relaxed">{message.content}</p>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            {formatMessage(message.content)}
                          </div>
                        )}
                        
                        <div className={cn(
                          "text-xs mt-2 opacity-70",
                          message.role === 'user' 
                            ? "text-white/70" 
                            : "text-gray-500 dark:text-gray-400"
                        )}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Input Area */}
        <div className="fixed bottom-20 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-t border-white/20 dark:border-white/10 p-6">
          <PureMultimodalInput
            chatId={`arlo-mobile-${activeConversationId || 'new'}`}
            messages={activeConversation?.messages || []}
            attachments={attachments}
            setAttachments={setAttachments}
            onSendMessage={handleSendMessage}
            onStopGenerating={handleStopGenerating}
            isGenerating={isLoading}
            canSend={true}
            selectedVisibilityType="private"
            value={inputValue}
            onChange={setInputValue}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/30 pb-20">
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onCreateConversation={() => {
          const newId = createNewConversation();
          setHasStartedConversation(true);
          return newId;
        }}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex-shrink-0 bg-white/60 dark:bg-black/20 backdrop-blur-sm border-b border-white/20 dark:border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {activeConversation?.title || 'Arlo'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Arlo, your intelligent relationship companion
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto">
              {!activeConversation || activeConversation.messages.length <= 1 ? (
                <ConversationStarters onSelectPrompt={handlePromptSelect} />
              ) : (
                <div className="p-6 space-y-6 pb-32">
                  {activeConversation.messages.slice(1).map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "flex",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div className={cn(
                        "max-w-[80%] rounded-2xl p-4 relative",
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'glass-card text-gray-900 dark:text-white'
                      )}>
                        {message.role === 'user' ? (
                          <p className="leading-relaxed">{message.content}</p>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            {formatMessage(message.content)}
                          </div>
                        )}
                        
                        <div className={cn(
                          "text-xs mt-3 opacity-70",
                          message.role === 'user' 
                            ? "text-white/70" 
                            : "text-gray-500 dark:text-gray-400"
                        )}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Input Area */}
        <div className="fixed bottom-20 left-80 right-0 bg-white/80 dark:bg-black/20 backdrop-blur-sm border-t border-white/20 dark:border-white/10 p-6">
          <div className="max-w-4xl mx-auto">
            <PureMultimodalInput
              chatId={`arlo-desktop-${activeConversationId || 'new'}`}
              messages={activeConversation?.messages || []}
              attachments={attachments}
              setAttachments={setAttachments}
              onSendMessage={handleSendMessage}
              onStopGenerating={handleStopGenerating}
              isGenerating={isLoading}
              canSend={true}
              selectedVisibilityType="private"
              value={inputValue}
              onChange={setInputValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
