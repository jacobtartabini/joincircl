
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Brain, 
  MessageSquare, 
  Settings, 
  Send, 
  Sparkles,
  Users,
  Calendar,
  TrendingUp
} from "lucide-react";
import { useContacts } from "@/hooks/use-contacts";
import AIRelationshipDashboard from "@/components/ai/AIRelationshipDashboard";
import { UserPreferences } from "@/services/aiRelationshipAssistant";

export default function AIAssistant() {
  const { contacts } = useContacts();
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', message: string}>>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    communicationStyle: 'mixed',
    frequency: 'weekly',
    focusAreas: ['personal', 'professional'],
    messageLength: 'medium'
  });

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', message: chatMessage }]);
    
    // Simulate AI response (you can integrate with your AI service here)
    const responses = [
      "I'd be happy to help you strengthen your relationships! Let me analyze your network and provide some personalized suggestions.",
      "Based on your recent activity, I notice you haven't connected with Sarah in a while. She's in your inner circle - might be worth reaching out!",
      "Looking at your network, I see some great opportunities for professional growth. Would you like me to suggest some strategic connections to nurture?",
      "I can help you craft a message for any of your contacts. Just let me know who you'd like to reach out to and the context!"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'assistant', message: randomResponse }]);
    }, 1000);
    
    setChatMessage("");
  };

  const quickActions = [
    { icon: Users, label: "Analyze My Network", description: "Get insights on relationship patterns" },
    { icon: MessageSquare, label: "Suggest Reconnections", description: "Find people to reach out to" },
    { icon: Calendar, label: "Upcoming Birthdays", description: "Never miss important dates" },
    { icon: TrendingUp, label: "Relationship Goals", description: "Set and track connection goals" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-purple-500" />
          AI Relationship Assistant
        </h1>
        <p className="text-muted-foreground">
          Your intelligent companion for building and maintaining meaningful connections
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main AI Dashboard */}
        <div className="lg:col-span-2">
          <AIRelationshipDashboard contacts={contacts} />
        </div>

        {/* Chat Interface and Settings */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => {
                    setChatHistory(prev => [...prev, 
                      { role: 'user', message: action.label },
                      { role: 'assistant', message: `I'll help you with ${action.description.toLowerCase()}. Let me analyze your data...` }
                    ]);
                  }}
                >
                  <action.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat with Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chat History */}
                <div className="h-64 border rounded-lg p-3 overflow-y-auto space-y-3">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Brain className="h-8 w-8 mx-auto mb-2" />
                      <p>Start a conversation! Ask me about your relationships, get suggestions, or request help with outreach.</p>
                    </div>
                  ) : (
                    chatHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-2 rounded-lg text-sm ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything about your relationships..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Communication Style</Label>
                <Select
                  value={userPreferences.communicationStyle}
                  onValueChange={(value: 'casual' | 'professional' | 'mixed') =>
                    setUserPreferences(prev => ({ ...prev, communicationStyle: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Suggestion Frequency</Label>
                <Select
                  value={userPreferences.frequency}
                  onValueChange={(value: 'daily' | 'weekly' | 'biweekly' | 'monthly') =>
                    setUserPreferences(prev => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Message Length</Label>
                <Select
                  value={userPreferences.messageLength}
                  onValueChange={(value: 'short' | 'medium' | 'long') =>
                    setUserPreferences(prev => ({ ...prev, messageLength: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
