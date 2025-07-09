import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { 
  Send, 
  Plus, 
  Settings, 
  Brain, 
  MessageSquare, 
  Sparkles, 
  History,
  Trash2,
  Edit3,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  BookOpen,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Star,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Shield,
  Lock,
  Globe,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Bookmark,
  Flag,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  X,
  Menu,
  Home,
  User,
  Mail,
  Phone,
  MapPin,
  Link,
  Tag,
  Folder,
  File,
  Image,
  Video,
  Music,
  Archive,
  Database,
  Server,
  Cloud,
  Wifi,
  Bluetooth,
  Battery,
  Signal,
  Volume,
  Brightness,
  Contrast,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Watch,
  Headphones,
  Speaker,
  Camera,
  Microphone,
  Keyboard,
  Mouse,
  Printer,
  Scanner,
  Router,
  Modem,
  Hard Drive
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  user_id: string;
  messages?: Message[];
}

interface Message {
  id: string;
  created_at: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp?: string;
}

interface SettingsData {
  openAiApiKey: string | null;
  modelPreference: string;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

const Arlo = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  // Fetch settings
  const settingsQuery = useQuery<SettingsData>({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) {
        console.error("Error fetching settings:", error);
        throw error;
      }

      return data as SettingsData;
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<SettingsData>) => {
      const { data, error } = await supabase
        .from('settings')
        .update(updates)
        .eq('id', 'default')
        .select('*')
        .single();

      if (error) {
        console.error("Error updating settings:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: "Settings Updated",
        description: "Your settings have been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    },
  });

  // Fetch conversations
  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        throw error;
      }

      return data as Conversation[];
    },
    onSuccess: (data: Conversation[]) => {
      if (data && data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
    },
  });

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedConversation) {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedConversation.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          return;
        }

        setMessages(data as Message[]);
        // Scroll to bottom after messages load
        setTimeout(() => {
          scrollAreaRef.current?.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      } else {
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  // Realtime message subscription
  useEffect(() => {
    if (!selectedConversation) return;

    const messagesSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async (payload) => {
        if (payload.new && payload.new.conversation_id === selectedConversation.id) {
          const newMessage = payload.new as Message;
          setMessages((prevMessages) => [...prevMessages, newMessage]);

          // Scroll to bottom after new message
          setTimeout(() => {
            scrollAreaRef.current?.scrollTo({
              top: scrollAreaRef.current.scrollHeight,
              behavior: 'smooth'
            });
          }, 100);
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(messagesSubscription)
    }
  }, [selectedConversation]);

  // Mutation to create a new conversation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .insert([{}])
        .select('*')
        .single();

      if (error) {
        console.error("Error creating conversation:", error);
        throw error;
      }

      return data as Conversation;
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedConversation(newConversation);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    },
  });

  // Mutation to send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      if (!selectedConversation) {
        throw new Error("No conversation selected.");
      }

      const settings = settingsQuery.data;

      const { data, error } = await supabase.functions.invoke('generate', {
        body: {
          message: messageContent,
          conversationId: selectedConversation.id,
          openAiApiKey: settings?.openAiApiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
          modelPreference: settings?.modelPreference || "gpt-3.5-turbo",
          temperature: settings?.temperature || 0.7,
          topP: settings?.topP || 0.9,
          frequencyPenalty: settings?.frequencyPenalty || 0.0,
          presencePenalty: settings?.presencePenalty || 0.0,
        }
      })

      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      setInputMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  // Mutation to delete a conversation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { data, error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) {
        console.error("Error deleting conversation:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedConversation(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    },
  });

  const startNewConversation = () => {
    createConversationMutation.mutate();
  };

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;
    setIsLoading(true);
    await sendMessageMutation.mutateAsync(inputMessage);
  };

  const deleteConversation = (conversationId: string) => {
    deleteConversationMutation.mutate(conversationId);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background/95 to-muted/50">
      {/* Sidebar */}
      <motion.div 
        className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 ease-in-out bg-card/50 backdrop-blur-xl border-r border-border/50 flex flex-col relative z-10`}
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          {!sidebarCollapsed && (
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Arlo AI
                </h1>
                <p className="text-xs text-muted-foreground">Your Career Assistant</p>
              </div>
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-accent/50"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* New Conversation Button */}
        {!sidebarCollapsed && (
          <div className="p-4">
            <Button 
              onClick={startNewConversation} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
          </div>
        )}

        {/* Conversations List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-2 p-2">
            <AnimatePresence>
              {conversationsQuery.data?.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                    selectedConversation?.id === conversation.id 
                      ? 'bg-accent/70 border border-primary/20' 
                      : 'hover:bg-accent/30'
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  {!sidebarCollapsed ? (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate mb-1">
                            {conversation.title}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.messages && conversation.messages.length > 0 
                              ? `${conversation.messages.length} messages`
                              : 'No messages yet'
                            }
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(conversation.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {conversationsQuery.isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-accent/30 rounded-lg"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Settings Button */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-border/30">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto space-y-6">
            {!selectedConversation ? (
              <motion.div 
                className="flex flex-col items-center justify-center h-96 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6 bg-primary/10 rounded-full mb-6">
                  <Brain className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Arlo AI</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Your intelligent career assistant is ready to help you with job applications, 
                  interview preparation, networking strategies, and career planning.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  {[
                    { icon: Target, title: "Career Planning", desc: "Get personalized career roadmaps" },
                    { icon: Users, title: "Networking", desc: "Build meaningful professional connections" },
                    { icon: BookOpen, title: "Interview Prep", desc: "Practice with AI-powered mock interviews" },
                    { icon: TrendingUp, title: "Skill Development", desc: "Identify and develop key skills" }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 rounded-lg bg-card/50 border border-border/50 hover:bg-card/70 transition-colors"
                    >
                      <feature.icon className="w-8 h-8 text-primary mb-2" />
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {messages.map((message, index) => (
                  <motion.div
                    key={`${selectedConversation.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8 bg-primary/10">
                        <AvatarFallback>
                          <Brain className="w-4 h-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
                      <Card className={`p-4 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-card/50 backdrop-blur-sm border-border/50'
                      }`}>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {message.content.split('\n').map((line, lineIndex) => (
                            <p key={lineIndex} className={`mb-2 last:mb-0 ${
                              message.role === 'user' ? 'text-primary-foreground' : 'text-foreground'
                            }`}>
                              {line}
                            </p>
                          ))}
                        </div>
                      </Card>
                      <div className={`text-xs text-muted-foreground mt-1 ${
                        message.role === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'Now'}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8 bg-accent">
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 justify-start"
              >
                <Avatar className="w-8 h-8 bg-primary/10">
                  <AvatarFallback>
                    <Brain className="w-4 h-4 text-primary animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">Arlo is thinking...</span>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-border/30 p-6 bg-background/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask Arlo about your career, job applications, interviews, or networking..."
                  className="min-h-[60px] max-h-32 resize-none bg-background/50 border-border/50 focus:border-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Press Enter to send, Shift+Enter for new line</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Arlo AI Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="openAiApiKey" className="text-right">
                OpenAI API Key
              </Label>
              <Input
                id="openAiApiKey"
                defaultValue={settingsQuery.data?.openAiApiKey || ""}
                className="col-span-3"
                onChange={(e) => {
                  updateSettingsMutation.mutate({ openAiApiKey: e.target.value });
                }}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="modelPreference" className="text-right">
                Model Preference
              </Label>
              <Select
                onValueChange={(value) => {
                  updateSettingsMutation.mutate({ modelPreference: value });
                }}
                defaultValue={settingsQuery.data?.modelPreference || "gpt-3.5-turbo"}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT 3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="temperature" className="text-right">
                Temperature
              </Label>
              <Input
                id="temperature"
                type="number"
                defaultValue={settingsQuery.data?.temperature?.toString() || "0.7"}
                className="col-span-3"
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    updateSettingsMutation.mutate({ temperature: value });
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="topP" className="text-right">
                Top P
              </Label>
              <Input
                id="topP"
                type="number"
                defaultValue={settingsQuery.data?.topP?.toString() || "0.9"}
                className="col-span-3"
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    updateSettingsMutation.mutate({ topP: value });
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequencyPenalty" className="text-right">
                Frequency Penalty
              </Label>
              <Input
                id="frequencyPenalty"
                type="number"
                defaultValue={settingsQuery.data?.frequencyPenalty?.toString() || "0.0"}
                className="col-span-3"
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    updateSettingsMutation.mutate({ frequencyPenalty: value });
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="presencePenalty" className="text-right">
                Presence Penalty
              </Label>
              <Input
                id="presencePenalty"
                type="number"
                defaultValue={settingsQuery.data?.presencePenalty?.toString() || "0.0"}
                className="col-span-3"
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    updateSettingsMutation.mutate({ presencePenalty: value });
                  }
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Arlo;
