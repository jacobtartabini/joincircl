import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Brain, Send, RefreshCw, Loader2 } from "lucide-react";
import { useContacts } from "@/hooks/use-contacts";
import { useConversations } from "@/hooks/use-conversations";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { AutoExpandingTextarea } from "@/components/ui/auto-expanding-textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import ConversationSidebar from "@/components/ai/ConversationSidebar";
import ConversationStarters from "@/components/ai/ConversationStarters";

export default function Arlo() {
  const { contacts } = useContacts();
  const {
    conversations,
    activeConversation,
    activeConversationId,
    isLoading: conversationsLoading,
    setActiveConversationId,
    createNewConversation,
    deleteConversation,
    renameConversation,
    addMessage,
    refreshConversations
  } = useConversations();
  
  const { isOpen: sidebarOpen, toggleSidebar } = useSidebarState();
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    console.log('[Arlo] Sending message', { input: inputValue, hasActiveConversation: !!activeConversationId });

    // Create conversation if this is the first message
    let conversationId = activeConversationId;
    if (!conversationId || conversations.length === 0) {
      console.log('[Arlo] Creating new conversation');
      conversationId = createNewConversation();
    }
    
    if (!conversationId) {
      console.error('[Arlo] Failed to create or get conversation ID');
      toast.error("Failed to create conversation");
      return;
    }

    const userMessageContent = inputValue;
    console.log('[Arlo] Adding user message to conversation', { conversationId });
    
    const messageId = await addMessage(conversationId, {
      role: 'user',
      content: userMessageContent
    });

    if (!messageId) {
      console.error('[Arlo] Failed to add user message');
      toast.error("Failed to send message");
      return;
    }

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

      console.log('[Arlo] Calling AI service');

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
        console.error('[Arlo] AI service error', error);
        throw new Error(`AI service error: ${error.message}`);
      }

      const aiResponse = data?.response || "**How can I help?** Ask me about:\n\n• Your relationship network\n• Networking strategies\n• Follow-up timing\n• Communication best practices";

      console.log('[Arlo] Adding AI response to conversation');
      
      const aiMessageId = await addMessage(conversationId, {
        role: 'assistant',
        content: aiResponse
      });

      if (!aiMessageId) {
        console.error('[Arlo] Failed to add AI message');
        toast.error("Failed to save AI response");
      }

    } catch (error) {
      console.error('[Arlo] Error getting AI response:', error);
      
      const errorMessage = "**Sorry!** I'm having trouble right now. Please try asking about:\n\n• Specific contacts or relationships\n• Networking strategies\n• Follow-up timing\n• Communication tips";
      
      await addMessage(conversationId, {
        role: 'assistant',
        content: errorMessage
      });
      
      toast.error("Arlo is temporarily unavailable");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
                <strong key={partIndex} className="text-foreground font-medium">
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
          <div key={index} className="mb-3">
            {lines.map((line, lineIndex) => {
              if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                return (
                  <div key={lineIndex} className="flex items-start gap-2 mb-1.5">
                    <span className="text-primary mt-1 text-xs">•</span>
                    <span className="text-muted-foreground text-sm leading-relaxed">
                      {line.replace(/^[•-]\s*/, '')}
                    </span>
                  </div>
                );
              }
              return (
                <div key={lineIndex} className="text-muted-foreground text-sm leading-relaxed mb-1.5">
                  {line}
                </div>
              );
            })}
          </div>
        );
      }
      return (
        <div key={index} className="mb-3 text-muted-foreground text-sm leading-relaxed">
          {section}
        </div>
      );
    });
  };

  // Show loading state while conversations are loading
  if (conversationsLoading) {
    return (
      <div className="h-screen flex items-center justify-center refined-web-theme">
        <div className="text-center">
          <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-full flex flex-col refined-web-theme pb-20">
        {/* Mobile Header */}
        <div className="flex-shrink-0 glass-nav border-b p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              {/* Mobile header content removed as requested */}
            </div>
            <Button
              onClick={refreshConversations}
              variant="ghost"
              size="sm"
              className="glass-button p-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 pb-32">
              {!activeConversation || activeConversation.messages.length <= 1 ? (
                <ConversationStarters onSelectPrompt={handlePromptSelect} />
              ) : (
                <AnimatePresence>
                  {activeConversation.messages.slice(1).map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex mb-4",
                        message.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3",
                        message.role === 'user'
                          ? "bg-primary text-primary-foreground"
                          : "glass-card"
                      )}>
                        {message.role === 'user' ? (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        ) : (
                          <div className="prose-sm">
                            {formatMessage(message.content)}
                          </div>
                        )}
                        
                        <div className={cn(
                          "text-xs mt-2 opacity-60",
                          message.role === 'user' ? "text-primary-foreground" : "text-muted-foreground"
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
              
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="glass-card px-4 py-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Input Area */}
        <div className="fixed bottom-32 left-0 right-0 glass-nav border-t p-4">
          <div className="flex items-end gap-3">
            <AutoExpandingTextarea
              placeholder="Ask Arlo about your relationships..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 glass-input"
              maxHeight={120}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="sm"
              className="min-w-[44px] h-[44px] rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex refined-web-theme overflow-hidden">
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onCreateConversation={() => {
          const newId = createNewConversation();
          return newId;
        }}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
        isCollapsed={!sidebarOpen}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Messages Area - Scrollable */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto px-6 py-8">
              {!activeConversation || activeConversation.messages.length <= 1 ? (
                <motion.div 
                  className="min-h-[calc(100vh-200px)] flex items-center justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <ConversationStarters onSelectPrompt={handlePromptSelect} />
                </motion.div>
              ) : (
                <div className="space-y-6 pb-32">
                  <AnimatePresence>
                    {activeConversation.messages.slice(1).map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 300,
                          damping: 30
                        }}
                        className={cn(
                          "flex",
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <motion.div 
                          className={cn(
                            "max-w-[75%] rounded-2xl px-5 py-4 shadow-sm",
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground shadow-primary/20'
                              : 'bg-card/90 backdrop-blur-sm border border-border/50 shadow-lg'
                          )}
                          style={message.role !== 'user' ? {
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0, 0, 0, 0.08)'
                          } : {}}
                          whileHover={{ 
                            scale: 1.02,
                            transition: { duration: 0.2 }
                          }}
                        >
                          {message.role === 'user' ? (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          ) : (
                            <div className="prose-sm">
                              {formatMessage(message.content)}
                            </div>
                          )}
                          
                          <div className={cn(
                            "text-xs mt-2 opacity-60",
                            message.role === 'user' ? "text-primary-foreground" : "text-muted-foreground"
                          )}>
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isLoading && (
                    <motion.div 
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl px-5 py-4 shadow-lg"
                        style={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Input Area */}
        <motion.div 
          className="flex-shrink-0 p-6 border-t border-border/30"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)'
          }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="max-w-3xl mx-auto">
            <motion.div 
              className="flex items-end gap-3"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <AutoExpandingTextarea
                placeholder="Ask Arlo about your relationships..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 glass-input rounded-2xl border-border/50 resize-none min-h-[48px] px-4 py-3 transition-all focus:scale-[1.01] focus:shadow-lg"
                maxHeight={120}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  size="lg"
                  className="min-w-[48px] h-[48px] rounded-2xl bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style>
        {`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}
      </style>
    </div>
  );
}
