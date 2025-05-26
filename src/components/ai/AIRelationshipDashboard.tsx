
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Clock
} from "lucide-react";
import { Contact, Interaction } from "@/types/contact";
import { aiRelationshipAssistant, RelationshipInsight, UserPreferences } from "@/services/aiRelationshipAssistant";
import { contactService } from "@/services/contactService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AIRelationshipDashboardProps {
  contacts: Contact[];
  className?: string;
}

export default function AIRelationshipDashboard({ contacts, className }: AIRelationshipDashboardProps) {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<RelationshipInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("recommendations");
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    communicationStyle: 'mixed',
    frequency: 'weekly',
    focusAreas: ['personal', 'professional'],
    messageLength: 'medium'
  });

  const generateInsights = async (proactive = false) => {
    if (contacts.length === 0) return;
    
    setIsLoading(true);
    try {
      // Get interactions for all contacts
      const interactions: Record<string, Interaction[]> = {};
      
      for (const contact of contacts) {
        try {
          const contactInteractions = await contactService.getInteractionsByContactId(contact.id);
          interactions[contact.id] = contactInteractions;
        } catch (error) {
          console.error(`Error loading interactions for ${contact.name}:`, error);
          interactions[contact.id] = [];
        }
      }

      const newInsights = proactive 
        ? await aiRelationshipAssistant.generateProactiveRecommendations(contacts, interactions, userPreferences)
        : await aiRelationshipAssistant.analyzeRelationships(contacts, interactions, userPreferences);
      
      setInsights(newInsights);
      toast.success(`Generated ${newInsights.length} relationship insights`);
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

  const handleCopyMessage = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Message copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  const handleContactAction = (contact: Contact) => {
    navigate(`/contacts/${contact.id}`);
  };

  const getPriorityColor = (priority: RelationshipInsight['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getActionIcon = (actionType: RelationshipInsight['actionType']) => {
    switch (actionType) {
      case 'reconnect': return <Users className="h-4 w-4" />;
      case 'follow_up': return <MessageCircle className="h-4 w-4" />;
      case 'celebrate': return <Calendar className="h-4 w-4" />;
      case 'check_in': return <Clock className="h-4 w-4" />;
      case 'nurture': return <TrendingUp className="h-4 w-4" />;
    }
  };

  const stats = {
    totalRecommendations: insights.length,
    highPriority: insights.filter(i => i.priority === 'high').length,
    reconnections: insights.filter(i => i.actionType === 'reconnect').length,
    celebrations: insights.filter(i => i.actionType === 'celebrate').length
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI Relationship Assistant
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateInsights(true)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Lightbulb className="h-4 w-4" />
                )}
                Proactive Mode
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateInsights(false)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.totalRecommendations}</div>
              <div className="text-sm text-muted-foreground">Total Insights</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.reconnections}</div>
              <div className="text-sm text-muted-foreground">Reconnections</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.celebrations}</div>
              <div className="text-sm text-muted-foreground">Celebrations</div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="messages">Message Drafts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recommendations" className="space-y-4">
              {isLoading && insights.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Analyzing your relationships...</p>
                  </div>
                </div>
              ) : insights.length > 0 ? (
                insights.map((insight, index) => (
                  <Card key={`${insight.contact.id}-${index}`} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {getActionIcon(insight.actionType)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{insight.contact.name}</h3>
                              <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                                {insight.priority} priority
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {insight.contact.circle} circle
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">{insight.reason}</p>
                            <p className="text-xs text-muted-foreground">{insight.context}</p>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleContactAction(insight.contact)}
                        >
                          View Contact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No recommendations right now</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your relationships look well-maintained! Check back later or use proactive mode.
                  </p>
                  <Button onClick={() => generateInsights(true)} disabled={isLoading}>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Generate Proactive Suggestions
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="messages" className="space-y-4">
              {insights.length > 0 ? (
                insights.map((insight, index) => (
                  <Card key={`msg-${insight.contact.id}-${index}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{insight.contact.name}</h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyMessage(insight.suggestedMessage)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleContactAction(insight.contact)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{insight.suggestedMessage}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Generate recommendations first to see message drafts</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
