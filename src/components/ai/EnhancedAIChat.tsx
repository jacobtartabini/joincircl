
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Send, 
  Sparkles, 
  MessageCircle,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Loader2
} from "lucide-react";
import { Contact } from "@/types/contact";
import { advancedAiAssistant, UserPersonality, MessageDraft } from "@/services/advancedAiAssistant";
import { contactService } from "@/services/contactService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  messageDrafts?: MessageDraft[];
  actionItems?: string[];
  isTyping?: boolean;
}

interface EnhancedAIChatProps {
  contacts: Contact[];
  userPersonality?: UserPersonality;
}

export default function EnhancedAIChat({ contacts, userPersonality }: EnhancedAIChatProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your relationship assistant. I can help you decide who to reach out to, craft personalized messages, or analyze your network. What would you like assistance with today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const defaultPersonality: UserPersonality = {
    communicationStyle: 'mixed',
    preferredPlatforms: ['text', 'email'],
    messageLength: 'medium',
    frequency: 'weekly',
    focusAreas: ['personal', 'professional'],
    proactivityLevel: 'medium',
    relationshipGoals: ['stay connected', 'grow network'],
    voiceTone: 'warm and genuine'
  };

  const personality = userPersonality || defaultPersonality;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Get interactions for all contacts
      const interactions: Record<string, any[]> = {};
      for (const contact of contacts) {
        try {
          const contactInteractions = await contactService.getInteractionsByContactId(contact.id);
          interactions[contact.id] = contactInteractions;
        } catch (error) {
          interactions[contact.id] = [];
        }
      }

      const response = await advancedAiAssistant.processNaturalLanguageQuery(
        inputMessage,
        contacts,
        interactions,
        personality
      );

      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        messageDrafts: response.messageDrafts,
        actionItems: response.actionItems
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Failed to process message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Message copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    toast.success(`Thank you for your feedback! This helps me improve.`);
  };

  const quickPrompts = [
    "Who should I reach out to this week?",
    "Help me reconnect with someone I haven't spoken to in a while",
    "Draft a message to check in with a colleague",
    "Analyze my networking patterns",
    "Suggest contacts for professional growth"
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          AI Relationship Assistant
        </CardTitle>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {personality.communicationStyle} style
          </Badge>
          <Badge variant="outline" className="text-xs">
            {personality.preferredPlatforms.join(', ')}
          </Badge>
        </div>
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
                  } rounded-lg p-3`}
                >
                  {message.isTyping ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Message Drafts */}
                      {message.messageDrafts && message.messageDrafts.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium">Suggested Messages:</div>
                          {message.messageDrafts.map((draft, index) => (
                            <div key={index} className="bg-background/50 rounded p-2 text-xs">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {draft.platform}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {draft.tone}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyMessage(draft.content)}
                                  className="h-6 px-2"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              {draft.subject && (
                                <div className="font-medium mb-1">Subject: {draft.subject}</div>
                              )}
                              <div className="whitespace-pre-wrap">{draft.content}</div>
                              <div className="mt-1 text-muted-foreground">
                                Reasoning: {draft.reasoning}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Action Items */}
                      {message.actionItems && message.actionItems.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-medium mb-1">Recommended Actions:</div>
                          <ul className="text-xs space-y-1">
                            {message.actionItems.map((action, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-green-500 mt-0.5">•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Feedback buttons for assistant messages */}
                      {message.role === 'assistant' && !message.isTyping && (
                        <div className="flex items-center gap-1 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(message.id, true)}
                            className="h-6 px-2"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(message.id, false)}
                            className="h-6 px-2"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Try asking:</div>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(prompt)}
                  className="text-xs h-8"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything about your relationships..."
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
