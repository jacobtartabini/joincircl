
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Brain, 
  MessageSquare, 
  Settings, 
  Sparkles,
  Users,
  Calendar,
  TrendingUp,
  Zap,
  Target
} from "lucide-react";
import { useContacts } from "@/hooks/use-contacts";
import SmartRecommendationEngine from "@/components/ai/SmartRecommendationEngine";
import EnhancedAIChat from "@/components/ai/EnhancedAIChat";
import { UserPersonality } from "@/services/advancedAiAssistant";

export default function AIAssistant() {
  const { contacts } = useContacts();
  const [userPersonality, setUserPersonality] = useState<UserPersonality>({
    communicationStyle: 'mixed',
    preferredPlatforms: ['text', 'email'],
    messageLength: 'medium',
    frequency: 'weekly',
    focusAreas: ['personal', 'professional'],
    proactivityLevel: 'medium',
    relationshipGoals: ['stay connected', 'grow network'],
    voiceTone: 'warm and genuine'
  });

  const quickActions = [
    { 
      icon: Target, 
      label: "Priority Recommendations", 
      description: "See who needs your attention most",
      color: "text-red-500"
    },
    { 
      icon: MessageSquare, 
      label: "Smart Message Drafts", 
      description: "AI-crafted messages for every relationship",
      color: "text-blue-500"
    },
    { 
      icon: Calendar, 
      label: "Celebration Alerts", 
      description: "Never miss birthdays and milestones",
      color: "text-green-500"
    },
    { 
      icon: TrendingUp, 
      label: "Growth Opportunities", 
      description: "Expand your network strategically",
      color: "text-purple-500"
    }
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
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-purple-50">
            Context-Aware
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            Personalized
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            Proactive
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main AI Engine */}
        <div className="lg:col-span-2">
          <SmartRecommendationEngine 
            contacts={contacts} 
            userPersonality={userPersonality}
          />
        </div>

        {/* Chat and Settings */}
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
                >
                  <action.icon className={`h-4 w-4 mr-2 flex-shrink-0 ${action.color}`} />
                  <div className="text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* AI Personality Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AI Personality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Communication Style</Label>
                <Select
                  value={userPersonality.communicationStyle}
                  onValueChange={(value: UserPersonality['communicationStyle']) =>
                    setUserPersonality(prev => ({ ...prev, communicationStyle: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual & Relaxed</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="warm">Warm & Personal</SelectItem>
                    <SelectItem value="direct">Direct & Clear</SelectItem>
                    <SelectItem value="mixed">Adaptive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Proactivity Level</Label>
                <Select
                  value={userPersonality.proactivityLevel}
                  onValueChange={(value: UserPersonality['proactivityLevel']) =>
                    setUserPersonality(prev => ({ ...prev, proactivityLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Only when asked</SelectItem>
                    <SelectItem value="medium">Medium - Weekly insights</SelectItem>
                    <SelectItem value="high">High - Daily suggestions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Message Length</Label>
                <Select
                  value={userPersonality.messageLength}
                  onValueChange={(value: UserPersonality['messageLength']) =>
                    setUserPersonality(prev => ({ ...prev, messageLength: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short & Concise</SelectItem>
                    <SelectItem value="medium">Medium Length</SelectItem>
                    <SelectItem value="long">Detailed & Thoughtful</SelectItem>
                    <SelectItem value="adaptive">Adaptive to Context</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Chat Interface */}
      <div className="mt-8">
        <EnhancedAIChat 
          contacts={contacts} 
          userPersonality={userPersonality}
        />
      </div>
    </div>
  );
}
