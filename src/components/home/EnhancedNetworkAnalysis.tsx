
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Users, TrendingUp, AlertTriangle, Calendar, MessageCircle } from "lucide-react";
import { Contact, Interaction } from "@/types/contact";
import { contactService } from "@/services/contactService";
import { differenceInDays, differenceInMonths, format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface NetworkAnalysisProps {
  contacts: Contact[];
  isLoading: boolean;
}

interface NetworkInsight {
  type: 'frequent' | 'growing' | 'neglected' | 'new' | 'influential';
  title: string;
  description: string;
  contacts: Contact[];
  severity: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export function EnhancedNetworkAnalysis({ contacts, isLoading }: NetworkAnalysisProps) {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<NetworkInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [allInteractions, setAllInteractions] = useState<Record<string, Interaction[]>>({});

  // Load interactions for analysis
  useEffect(() => {
    const loadInteractions = async () => {
      if (contacts.length === 0) return;
      
      setLoadingInsights(true);
      try {
        const interactionPromises = contacts.slice(0, 50).map(async (contact) => {
          try {
            const interactions = await contactService.getInteractionsByContactId(contact.id);
            return { contactId: contact.id, interactions };
          } catch (error) {
            console.error(`Error loading interactions for ${contact.name}:`, error);
            return { contactId: contact.id, interactions: [] };
          }
        });

        const results = await Promise.all(interactionPromises);
        const interactionMap: Record<string, Interaction[]> = {};
        results.forEach(({ contactId, interactions }) => {
          interactionMap[contactId] = interactions;
        });

        setAllInteractions(interactionMap);
      } catch (error) {
        console.error("Error loading interactions:", error);
      } finally {
        setLoadingInsights(false);
      }
    };

    loadInteractions();
  }, [contacts]);

  // Generate network insights
  const networkInsights = useMemo(() => {
    if (contacts.length === 0 || loadingInsights) return [];

    const insights: NetworkInsight[] = [];
    const today = new Date();

    // 1. Most Frequently Interacted Contacts
    const contactsWithInteractionCount = contacts.map(contact => {
      const interactions = allInteractions[contact.id] || [];
      const recentInteractions = interactions.filter(i => 
        differenceInDays(today, new Date(i.date)) <= 90
      );
      return {
        contact,
        totalInteractions: interactions.length,
        recentInteractions: recentInteractions.length,
        lastInteraction: interactions.length > 0 ? new Date(Math.max(...interactions.map(i => new Date(i.date).getTime()))) : null
      };
    });

    const frequentContacts = contactsWithInteractionCount
      .filter(c => c.recentInteractions >= 3)
      .sort((a, b) => b.recentInteractions - a.recentInteractions)
      .slice(0, 3);

    if (frequentContacts.length > 0) {
      insights.push({
        type: 'frequent',
        title: 'Most Active Connections',
        description: `You've had ${frequentContacts[0].recentInteractions}+ interactions with these contacts in the last 90 days`,
        contacts: frequentContacts.map(c => c.contact),
        severity: 'low',
        actionable: false
      });
    }

    // 2. Growing Connections (New contacts with multiple interactions)
    const growingConnections = contactsWithInteractionCount
      .filter(c => {
        const contactAge = differenceInDays(today, new Date(c.contact.created_at!));
        return contactAge <= 60 && c.totalInteractions >= 2; // New contact with multiple interactions
      })
      .sort((a, b) => b.totalInteractions - a.totalInteractions)
      .slice(0, 3);

    if (growingConnections.length > 0) {
      insights.push({
        type: 'growing',
        title: 'Growing Connections',
        description: 'New contacts you\'re building strong relationships with',
        contacts: growingConnections.map(c => c.contact),
        severity: 'low',
        actionable: false
      });
    }

    // 3. Neglected Inner/Middle Circle Contacts
    const neglectedContacts = contactsWithInteractionCount
      .filter(c => {
        if (c.contact.circle === 'outer') return false;
        const daysSinceLastContact = c.lastInteraction ? 
          differenceInDays(today, c.lastInteraction) : 999;
        
        const threshold = c.contact.circle === 'inner' ? 30 : 60;
        return daysSinceLastContact > threshold;
      })
      .sort((a, b) => {
        const daysA = a.lastInteraction ? differenceInDays(today, a.lastInteraction) : 999;
        const daysB = b.lastInteraction ? differenceInDays(today, b.lastInteraction) : 999;
        return daysB - daysA;
      })
      .slice(0, 4);

    if (neglectedContacts.length > 0) {
      insights.push({
        type: 'neglected',
        title: 'Connections Needing Attention',
        description: `${neglectedContacts.length} important contacts haven't been reached out to recently`,
        contacts: neglectedContacts.map(c => c.contact),
        severity: 'high',
        actionable: true
      });
    }

    // 4. Recently Added Contacts (potential for development)
    const recentContacts = contacts
      .filter(c => differenceInDays(today, new Date(c.created_at!)) <= 14)
      .filter(c => (allInteractions[c.id] || []).length === 0)
      .slice(0, 3);

    if (recentContacts.length > 0) {
      insights.push({
        type: 'new',
        title: 'New Connections to Develop',
        description: 'Recently added contacts with no recorded interactions yet',
        contacts: recentContacts,
        severity: 'medium',
        actionable: true
      });
    }

    // 5. Potential Influential Contacts (many connections in same industry/company)
    const industryGroups = contacts.reduce((acc, contact) => {
      const key = contact.industry || contact.company_name || 'other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(contact);
      return acc;
    }, {} as Record<string, Contact[]>);

    const influentialContacts = Object.entries(industryGroups)
      .filter(([_, groupContacts]) => groupContacts.length >= 3)
      .flatMap(([industry, groupContacts]) => 
        groupContacts.filter(c => c.circle === 'inner' || c.circle === 'middle')
      )
      .slice(0, 3);

    if (influentialContacts.length > 0) {
      insights.push({
        type: 'influential',
        title: 'Industry Connectors',
        description: 'Contacts who could introduce you to others in their field',
        contacts: influentialContacts,
        severity: 'medium',
        actionable: true
      });
    }

    return insights;
  }, [contacts, allInteractions, loadingInsights]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'frequent': return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'growing': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'neglected': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'new': return <Users className="h-4 w-4 text-purple-500" />;
      case 'influential': return <Brain className="h-4 w-4 text-indigo-500" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const handleContactClick = (contact: Contact) => {
    navigate(`/contacts/${contact.id}`);
  };

  const handleViewAllContacts = () => {
    navigate('/circles');
  };

  if (isLoading || loadingInsights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Arlo's Network Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Analyzing your network...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Arlo's Network Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-powered insights about your professional network
        </p>
      </CardHeader>
      <CardContent>
        {networkInsights.length > 0 ? (
          <div className="space-y-4">
            {networkInsights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      {insight.severity === 'high' && (
                        <Badge variant="destructive" className="text-xs">Action Needed</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {insight.contacts.slice(0, 3).map((contact) => (
                        <Button
                          key={contact.id}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleContactClick(contact)}
                        >
                          {contact.name}
                        </Button>
                      ))}
                      {insight.contacts.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={handleViewAllContacts}
                        >
                          +{insight.contacts.length - 3} more
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleViewAllContacts}
              >
                View All Contacts
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Building network insights...</p>
            <p className="text-sm mt-1">Add more contacts and interactions to get personalized analysis.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
