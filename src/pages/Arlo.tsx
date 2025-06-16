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
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Header with refresh button in top right */}
        <div className="flex-shrink-0 glass-nav border-b px-6 py-4">
          <div className="flex items-center justify-end">
            <Button
              onClick={refreshConversations}
              variant="ghost"
              size="sm"
              className="glass-button"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <div 
            className="h-full overflow-y-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingBottom: '120px'
            }}
          >
            <div className="max-w-3xl mx-auto px-6">
              {!activeConversation || activeConversation.messages.length <= 1 ? (
                <div className="py-8">
                  <ConversationStarters onSelectPrompt={handlePromptSelect} />
                </div>
              ) : (
                <div className="py-6 space-y-4">
                  {activeConversation.messages.slice(1).map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-3",
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'glass-card'
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
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="glass-card rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Fixed Input Area - adapts to sidebar width and positioned closer to nav */}
        <div 
          className="absolute bottom-28 glass-nav border-t px-6 py-4"
          style={{
            left: sidebarOpen ? '224px' : '48px',
            right: 0,
            transition: 'left 0.2s ease-in-out'
          }}
        >
          <div className="max-w-3xl mx-auto">
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
