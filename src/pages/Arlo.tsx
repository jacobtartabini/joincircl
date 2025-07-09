
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Send, 
  Mic, 
  MicOff, 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Calendar,
  User,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronRight,
  Star,
  Lightbulb
} from 'lucide-react';
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'arlo';
  timestamp: Date;
  type?: 'text' | 'insight' | 'action';
}

interface InsightCard {
  id: string;
  title: string;
  content: string;
  category: 'networking' | 'career' | 'productivity';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

const Arlo = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Arlo, your AI career companion. I'm here to help you navigate your professional journey, optimize your networking, and achieve your career goals. What would you like to work on today?",
      sender: 'arlo',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const [insights, setInsights] = useState<InsightCard[]>([
    {
      id: '1',
      title: 'Networking Opportunity',
      content: 'You haven\'t connected with Sarah Chen in 3 weeks. Consider reaching out about her recent promotion.',
      category: 'networking',
      priority: 'high',
      actionable: true
    },
    {
      id: '2',
      title: 'Career Progress',
      content: 'Your application to TechCorp is in the interview stage. Prepare for potential technical questions.',
      category: 'career',
      priority: 'high',
      actionable: true
    },
    {
      id: '3',
      title: 'Skill Development',
      content: 'Based on your goals, consider taking a course in machine learning fundamentals.',
      category: 'productivity',
      priority: 'medium',
      actionable: true
    }
  ]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const arloResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand you'd like help with that. Let me analyze your situation and provide some tailored recommendations...",
        sender: 'arlo',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, arloResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast.success("Voice input activated");
    } else {
      toast.info("Voice input deactivated");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="flex-1 flex flex-col shadow-xl border-0 bg-card/95 backdrop-blur-xl">
              <div className="flex items-center justify-between p-6 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      <Brain className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-xl font-semibold text-foreground">Arlo</h1>
                    <p className="text-sm text-muted-foreground">Your AI Career Companion</p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1.5">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  Online
                </Badge>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground ml-4'
                            : 'bg-muted/80 text-foreground mr-4'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted/80 text-foreground rounded-2xl px-4 py-3 mr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-xs text-muted-foreground">Arlo is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-6 border-t border-border/30 bg-background/50">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask Arlo anything about your career, networking, or professional goals..."
                      className="min-h-[44px] max-h-32 resize-none border-border/50 bg-background/80 focus:bg-background transition-colors"
                      rows={1}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleListening}
                      className={`h-11 w-11 ${isListening ? 'bg-red-500 hover:bg-red-600 text-white' : 'hover:bg-muted'}`}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button 
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="h-11 px-6"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar with Insights and Analytics */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-xl">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Smart Insights</h2>
                </div>
                
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                          {insight.title}
                        </h3>
                        <Badge variant={getPriorityColor(insight.priority)} className="text-xs">
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {insight.content}
                      </p>
                      {insight.actionable && (
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Take Action
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-xl">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Progress Overview</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Networking Goals</span>
                      <span className="text-sm text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Job Applications</span>
                      <span className="text-sm text-muted-foreground">60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Skill Development</span>
                      <span className="text-sm text-muted-foreground">40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">23</div>
                    <div className="text-xs text-muted-foreground">Active Connections</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">8</div>
                    <div className="text-xs text-muted-foreground">Applications</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Arlo;
