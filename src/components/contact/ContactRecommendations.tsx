
import { useState, useEffect } from 'react';
import { Contact } from '@/types/contact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, MessageSquare, Calendar, Users, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ContactRecommendation {
  id: string;
  type: 'conversation' | 'collaboration' | 'reminder' | 'connection';
  title: string;
  description: string;
  actionText: string;
  icon: React.ReactNode;
}

interface ContactRecommendationsProps {
  contact: Contact;
}

export function ContactRecommendations({ contact }: ContactRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ContactRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, [contact.id]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-contact-recommendations', {
        body: {
          contact: {
            name: contact.name,
            company: contact.company_name,
            industry: contact.industry,
            jobTitle: contact.job_title,
            notes: contact.notes,
            tags: contact.tags,
            location: contact.location
          }
        }
      });

      if (error) throw error;

      const aiRecommendations = data.recommendations || [];
      
      // Map AI recommendations to our format
      const formattedRecommendations: ContactRecommendation[] = aiRecommendations.slice(0, 3).map((rec: any, index: number) => ({
        id: `${contact.id}-${index}`,
        type: rec.type || 'conversation',
        title: rec.title,
        description: rec.description,
        actionText: rec.actionText || 'Take Action',
        icon: getIconForType(rec.type || 'conversation')
      }));

      setRecommendations(formattedRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback recommendations
      setRecommendations(getFallbackRecommendations());
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'conversation':
        return <MessageSquare className="h-4 w-4" />;
      case 'collaboration':
        return <Users className="h-4 w-4" />;
      case 'reminder':
        return <Calendar className="h-4 w-4" />;
      case 'connection':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getFallbackRecommendations = (): ContactRecommendation[] => {
    const fallbacks = [
      {
        id: `${contact.id}-fallback-1`,
        type: 'conversation' as const,
        title: 'Follow up conversation',
        description: `Reach out to ${contact.name} about recent industry developments`,
        actionText: 'Start conversation',
        icon: <MessageSquare className="h-4 w-4" />
      },
      {
        id: `${contact.id}-fallback-2`,
        type: 'collaboration' as const,
        title: 'Explore collaboration',
        description: 'Consider potential partnership opportunities',
        actionText: 'Schedule meeting',
        icon: <Users className="h-4 w-4" />
      }
    ];

    return fallbacks.slice(0, 2);
  };

  const handleRecommendationAction = (recommendation: ContactRecommendation) => {
    // Handle different recommendation actions
    switch (recommendation.type) {
      case 'conversation':
        if (contact.personal_email) {
          window.open(`mailto:${contact.personal_email}`);
        }
        break;
      case 'collaboration':
        // Could open a new interaction form or calendar invite
        console.log('Collaboration action for:', contact.name);
        break;
      case 'reminder':
        // Could create a new keystone
        console.log('Reminder action for:', contact.name);
        break;
      case 'connection':
        // Could suggest mutual connections
        console.log('Connection action for:', contact.name);
        break;
    }
  };

  if (loading) {
    return (
      <Card className="unified-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="unified-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Insights for {contact.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="unified-container space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {recommendation.icon}
                    <h4 className="font-medium text-foreground">{recommendation.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {recommendation.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {recommendation.description}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRecommendationAction(recommendation)}
                className="unified-button w-full"
              >
                {recommendation.actionText}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
