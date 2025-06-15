
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

  // Show loading state while conversations are loading
  if (conversationsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/20 dark:from-gray-900 dark:to-blue-900/20">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 mx-auto">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/20 dark:from-gray-900 dark:to-blue-900/20 pb-20">
        {/* Mobile Header */}
        <div className="flex-shrink-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-white/20 dark:border-white/10 p-6 pt-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Arlo</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your relationship assistant</p>
            </div>
            <button
              onClick={refreshConversations}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              title="Refresh conversations"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6 pb-32">
              {!activeConversation || activeConversation.messages.length <= 1 ? (
                <ConversationStarters onSelectPrompt={handlePromptSelect} />
              ) : (
                <AnimatePres enter="fade-in" exit="fade-out">
                  {activeConversation.messages.slice(1).map((message) => (
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
                          message.role === 'user' ? "text-white/70" : "text-gray-500 dark:text-gray-400"
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
                  <div className="glass-card px-5 py-3 rounded-3xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Arlo is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Input Area */}
        <div className="fixed bottom-20 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-t border-white/20 dark:border-white/10 p-6">
          <div className="flex items-end gap-3">
            <AutoExpandingTextarea
              placeholder="Ask Arlo about your relationships..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
              maxHeight={120}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 min-w-[44px] h-[44px]"
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
    <div className="h-screen flex bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/30 pb-20">
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
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex-shrink-0 bg-white/80 dark:bg-black/20 backdrop-blur-sm border-b border-white/20 dark:border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {activeConversation ? activeConversation.title : 'Arlo'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your relationship assistant</p>
              </div>
            </div>
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
        <div className="flex-1 min-h-0 relative">
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto">
              {!activeConversation || activeConversation.messages.length <= 1 ? (
                <ConversationStarters onSelectPrompt={handlePromptSelect} />
              ) : (
                <div className="p-6 space-y-6 pb-32">
                  {activeConversation.messages.slice(1).map((message) => (
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
                          message.role === 'user' ? "text-white/70" : "text-gray-500 dark:text-gray-400"
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
                      <div className="glass-card rounded-2xl p-4">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Arlo is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Input Area */}
        <div className="flex-shrink-0 bg-white/80 dark:bg-black/20 backdrop-blur-sm border-t border-white/20 dark:border-white/10 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <AutoExpandingTextarea
                placeholder="Ask Arlo about your relationships..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1"
                maxHeight={120}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-500 hover:bg-blue-600 min-w-[44px] h-[44px]"
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
    </div>
  );
}
