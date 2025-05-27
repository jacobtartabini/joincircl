
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, RefreshCw, Loader2, ArrowRight } from "lucide-react";
import { Contact, Interaction } from "@/types/contact";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { contactService } from "@/services/contactService";

interface NetworkRecommendationsProps {
  contacts: Contact[];
}

interface Recommendation {
  type: 'reach_out' | 'follow_up' | 'strengthen' | 'birthday' | 'reconnect';
  contact: Contact;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel: string;
}

export default function UnifiedNetworkRecommendations({ contacts }: NetworkRecommendationsProps) {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const generateRecommendations = async () => {
    if (contacts.length === 0) return;
    
    setIsLoading(true);
    try {
      // Create context about the user's network
      const networkContext = `User has ${contacts.length} contacts across different circles:
      - Inner circle: ${contacts.filter(c => c.circle === 'inner').length}
      - Middle circle: ${contacts.filter(c => c.circle === 'middle').length}
      - Outer circle: ${contacts.filter(c => c.circle === 'outer').length}`;

      // Get sample contacts for AI analysis
      const recentContacts = contacts.slice(0, 5);
      const contactContext = recentContacts.map(c => 
        `${c.name} (${c.circle} circle${c.company_name ? `, ${c.company_name}` : ''}${c.last_contact ? `, last contact: ${new Date(c.last_contact).toLocaleDateString()}` : ', no recent contact'})`
      ).join(', ');

      const systemPrompt = `You are Circl's network advisor - sharp, insightful, and action-oriented. Generate 3-4 specific recommendations to strengthen relationships.

      Be concise and direct. Each suggestion should:
      - Target a specific person or action
      - Include clear reasoning (2-3 words max)
      - Suggest concrete next steps
      - Feel personal, not generic

      Return JSON array: [{"type": "reach_out|follow_up|strengthen|birthday|reconnect", "contactName": "name", "suggestion": "brief actionable text", "priority": "high|medium|low", "reasoning": "short reason"}]`;

      const prompt = `${networkContext}

      Sample contacts: ${contactContext}

      Generate specific network recommendations. Focus on:
      - Who needs attention based on last contact dates
      - Relationship strengthening opportunities
      - Upcoming important dates
      - Strategic follow-ups

      Keep suggestions actionable and personalized.`;

      console.log('Generating network recommendations with AI');

      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: {
          prompt,
          systemPrompt,
          model: 'mistralai/mistral-7b-instruct',
          maxTokens: 400,
          temperature: 0.7
        }
      });

      if (error) {
        throw new Error(`AI service error: ${error.message}`);
      }

      console.log('AI recommendation response:', data);

      // Parse AI response and match with actual contacts
      let aiRecommendations = [];
      try {
        aiRecommendations = JSON.parse(data.response) || [];
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        aiRecommendations = [];
      }

      // Convert AI recommendations to our format
      const formattedRecommendations: Recommendation[] = [];
      
      for (const aiRec of aiRecommendations.slice(0, 4)) {
        // Find matching contact
        const contact = contacts.find(c => 
          c.name.toLowerCase().includes(aiRec.contactName?.toLowerCase()) ||
          aiRec.contactName?.toLowerCase().includes(c.name.toLowerCase())
        );

        if (contact) {
          formattedRecommendations.push({
            type: aiRec.type || 'reach_out',
            contact,
            suggestion: aiRec.suggestion || `Connect with ${contact.name}`,
            priority: aiRec.priority || 'medium',
            actionLabel: getActionLabel(aiRec.type || 'reach_out')
          });
        }
      }

      // If AI didn't provide enough matches, add some rule-based recommendations
      if (formattedRecommendations.length < 3) {
        const additionalRecs = await generateFallbackRecommendations(contacts);
        formattedRecommendations.push(...additionalRecs.slice(0, 3 - formattedRecommendations.length));
      }

      setRecommendations(formattedRecommendations);
      setLastUpdated(new Date());
      toast.success("Fresh recommendations ready!");

    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to rule-based recommendations
      const fallbackRecs = await generateFallbackRecommendations(contacts);
      setRecommendations(fallbackRecs.slice(0, 3));
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackRecommendations = async (contacts: Contact[]): Promise<Recommendation[]> => {
    const recommendations: Recommendation[] = [];
    const today = new Date();

    // Find contacts that need attention
    for (const contact of contacts) {
      if (recommendations.length >= 4) break;

      const lastContact = contact.last_contact ? new Date(contact.last_contact) : null;
      const daysSinceContact = lastContact ? Math.floor((today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)) : 999;

      // Different thresholds based on circle
      let threshold = 90;
      if (contact.circle === 'inner') threshold = 14;
      else if (contact.circle === 'middle') threshold = 30;

      if (daysSinceContact > threshold) {
        recommendations.push({
          type: 'reconnect',
          contact,
          suggestion: `Reconnect with ${contact.name} - it's been ${daysSinceContact} days`,
          priority: contact.circle === 'inner' ? 'high' : 'medium',
          actionLabel: 'Reach Out'
        });
      }

      // Check for upcoming birthdays
      if (contact.birthday) {
        const birthday = new Date(contact.birthday);
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        const daysUntilBirthday = Math.floor((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilBirthday <= 14 && daysUntilBirthday >= 0) {
          recommendations.push({
            type: 'birthday',
            contact,
            suggestion: `${contact.name}'s birthday is ${daysUntilBirthday === 0 ? 'today' : `in ${daysUntilBirthday} days`}`,
            priority: daysUntilBirthday <= 3 ? 'high' : 'medium',
            actionLabel: 'Plan'
          });
        }
      }
    }

    return recommendations;
  };

  const getActionLabel = (type: string): string => {
    switch (type) {
      case 'reach_out': return 'Connect';
      case 'follow_up': return 'Follow Up';
      case 'strengthen': return 'Strengthen';
      case 'birthday': return 'Plan';
      case 'reconnect': return 'Reconnect';
      default: return 'View';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleContactClick = (contact: Contact) => {
    navigate(`/contacts/${contact.id}`);
  };

  useEffect(() => {
    if (contacts.length > 0) {
      generateRecommendations();
    }
  }, [contacts.length]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Network Recommendations
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateRecommendations}
            disabled={isLoading || contacts.length === 0}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Updated {lastUpdated.toLocaleDateString()}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        {isLoading && recommendations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Analyzing your network...</p>
            </div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div 
                key={`${rec.contact.id}-${index}`} 
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleContactClick(rec.contact)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{rec.contact.name}</p>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.suggestion}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {rec.contact.circle} circle
                      </Badge>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        {rec.actionLabel} <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recommendations yet.</p>
            <p className="text-sm mt-1">Add contacts and interactions to get personalized suggestions.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
