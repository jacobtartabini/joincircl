import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Users, 
  MessageCircle, 
  Calendar, 
  TrendingUp, 
  RefreshCw,
  Copy,
  Send,
  Lightbulb,
  Clock,
  Star,
  Target,
  Zap
} from "lucide-react";
import { Contact } from "@/types/contact";
import { advancedAiAssistant, AdvancedRelationshipInsight, UserPersonality } from "@/services/advancedAiAssistant";
import { contactService } from "@/services/contactService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SmartRecommendationEngineProps {
  contacts: Contact[];
  userPersonality?: UserPersonality;
}

export default function SmartRecommendationEngine({ contacts, userPersonality }: SmartRecommendationEngineProps) {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<AdvancedRelationshipInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("priority");

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

  const generateInsights = async () => {
    if (contacts.length === 0) return;
    
    setIsLoading(true);
    try {
      const interactions: Record<string, any[]> = {};
      
      for (const contact of contacts) {
        try {
          const contactInteractions = await contactService.getInteractionsByContactId(contact.id);
          interactions[contact.id] = contactInteractions;
        } catch (error) {
          console.error(`Error loading interactions for ${contact.name}:`, error);
          interactions[contact.id] = [];
        }
      }

      const newInsights = await advancedAiAssistant.generateAdvancedInsights(contacts, interactions, personality);
      setInsights(newInsights);
      toast.success(`Generated ${newInsights.length} smart recommendations`);
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error("Failed to generate insights");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contacts.length > 0) {
      generateInsights();
    }
  }, [contacts.length]);

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Message copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  const handleContactAction = (contact: Contact) => {
    navigate(`/contacts/${contact.id}`);
  };

  const getPriorityColor = (priority: AdvancedRelationshipInsight['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getActionIcon = (actionType: AdvancedRelationshipInsight['actionType']) => {
    switch (actionType) {
      case 'reconnect': return <Users className="h-4 w-4" />;
      case 'follow_up': return <MessageCircle className="h-4 w-4" />;
      case 'celebrate': return <Calendar className="h-4 w-4" />;
      case 'check_in': return <Clock className="h-4 w-4" />;
      case 'nurture': return <TrendingUp className="h-4 w-4" />;
      case 'professional_touch': return <Target className="h-4 w-4" />;
    }
  };

  const groupedInsights = {
    priority: insights.filter(i => i.priority === 'urgent' || i.priority === 'high'),
    opportunities: insights.filter(i => i.actionType === 'professional_touch' || i.actionType === 'nurture'),
    celebrations: insights.filter(i => i.actionType === 'celebrate'),
    reconnections: insights.filter(i => i.actionType === 'reconnect')
  };

  const stats = {
    totalRecommendations: insights.length,
    urgentItems: insights.filter(i => i.priority === 'urgent').length,
    highConfidence: insights.filter(i => i.confidence > 0.8).length,
    messageDrafts: insights.reduce((acc, i) => acc + i.suggestedMessages.length, 0)
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Smart Recommendation Engine
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateInsights}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Refresh Insights
            </Button>
          </div>
        </div>
        
        {/* User Personality Indicators */}
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">{personality.communicationStyle} style</Badge>
          <Badge variant="outline">{personality.focusAreas.join(', ')}</Badge>
          <Badge variant="outline">{personality.proactivityLevel} proactivity</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Smart Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">{stats.totalRecommendations}</div>
            <div className="text-sm text-purple-600">Smart Insights</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{stats.urgentItems}</div>
            <div className="text-sm text-red-600">Urgent Actions</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{stats.highConfidence}</div>
            <div className="text-sm text-green-600">High Confidence</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{stats.messageDrafts}</div>
            <div className="text-sm text-blue-600">Message Drafts</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="priority">Priority Actions</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="celebrations">Celebrations</TabsTrigger>
            <TabsTrigger value="messages">Message Drafts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="priority" className="space-y-4">
            {groupedInsights.priority.length > 0 ? (
              groupedInsights.priority.map((insight, index) => (
                <InsightCard key={`priority-${index}`} insight={insight} onContactAction={handleContactAction} />
              ))
            ) : (
              <EmptyState 
                icon={<Target className="h-12 w-12" />}
                title="No urgent actions needed"
                description="Your priority relationships are well-maintained!"
              />
            )}
          </TabsContent>
          
          <TabsContent value="opportunities" className="space-y-4">
            {groupedInsights.opportunities.length > 0 ? (
              groupedInsights.opportunities.map((insight, index) => (
                <InsightCard key={`opportunity-${index}`} insight={insight} onContactAction={handleContactAction} />
              ))
            ) : (
              <EmptyState 
                icon={<Lightbulb className="h-12 w-12" />}
                title="No growth opportunities right now"
                description="Check back later for networking suggestions!"
              />
            )}
          </TabsContent>
          
          <TabsContent value="celebrations" className="space-y-4">
            {groupedInsights.celebrations.length > 0 ? (
              groupedInsights.celebrations.map((insight, index) => (
                <InsightCard key={`celebration-${index}`} insight={insight} onContactAction={handleContactAction} />
              ))
            ) : (
              <EmptyState 
                icon={<Calendar className="h-12 w-12" />}
                title="No celebrations coming up"
                description="We'll let you know about upcoming birthdays and milestones!"
              />
            )}
          </TabsContent>
          
          <TabsContent value="messages" className="space-y-4">
            {insights.some(i => i.suggestedMessages.length > 0) ? (
              insights.filter(i => i.suggestedMessages.length > 0).map((insight, index) => (
                <MessageDraftsCard 
                  key={`messages-${index}`} 
                  insight={insight} 
                  onCopyMessage={handleCopyMessage}
                  onContactAction={handleContactAction}
                />
              ))
            ) : (
              <EmptyState 
                icon={<MessageCircle className="h-12 w-12" />}
                title="No message drafts available"
                description="Generate insights first to see personalized message suggestions!"
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function InsightCard({ 
  insight, 
  onContactAction 
}: { 
  insight: AdvancedRelationshipInsight; 
  onContactAction: (contact: Contact) => void;
}) {
  const getPriorityColor = (priority: AdvancedRelationshipInsight['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getActionIcon = (actionType: AdvancedRelationshipInsight['actionType']) => {
    switch (actionType) {
      case 'reconnect': return <Users className="h-4 w-4" />;
      case 'follow_up': return <MessageCircle className="h-4 w-4" />;
      case 'celebrate': return <Calendar className="h-4 w-4" />;
      case 'check_in': return <Clock className="h-4 w-4" />;
      case 'nurture': return <TrendingUp className="h-4 w-4" />;
      case 'professional_touch': return <Target className="h-4 w-4" />;
    }
  };
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {getActionIcon(insight.actionType)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{insight.contact.name}</h3>
                <Badge variant="outline" className={`${getPriorityColor(insight.priority)} text-xs`}>
                  {insight.priority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {Math.round(insight.confidence * 100)}% confidence
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">{insight.reason}</p>
              <p className="text-xs text-muted-foreground mb-2">{insight.context}</p>
              
              {insight.personalizedFactors.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {insight.personalizedFactors.map((factor, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="text-xs font-medium text-primary">
                Next: {insight.nextBestAction}
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onContactAction(insight.contact)}
          >
            View Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MessageDraftsCard({ 
  insight, 
  onCopyMessage, 
  onContactAction 
}: { 
  insight: AdvancedRelationshipInsight; 
  onCopyMessage: (content: string) => void;
  onContactAction: (contact: Contact) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">{insight.contact.name}</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onContactAction(insight.contact)}
          >
            View Contact
          </Button>
        </div>
        
        <div className="space-y-3">
          {insight.suggestedMessages.map((message, index) => (
            <div key={index} className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {message.platform}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {message.tone}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {message.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopyMessage(message.content)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              {message.subject && (
                <div className="font-medium text-sm mb-1">
                  Subject: {message.subject}
                </div>
              )}
              
              <p className="text-sm whitespace-pre-wrap mb-2">{message.content}</p>
              
              <div className="text-xs text-muted-foreground">
                <div>Reasoning: {message.reasoning}</div>
                {message.contextUsed.length > 0 && (
                  <div>Context used: {message.contextUsed.join(', ')}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
