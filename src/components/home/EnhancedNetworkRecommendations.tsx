import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, RefreshCw, Loader2, ArrowRight, MessageCircle, User, Calendar } from "lucide-react";
import { Contact } from "@/types/contact";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { contactService } from "@/services/contactService";

interface NetworkRecommendationsProps {
  contacts: Contact[];
}
interface Recommendation {
  id: string;
  type: 'reach_out' | 'follow_up' | 'strengthen' | 'birthday' | 'reconnect' | 'networking_opportunity';
  contact: Contact;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel: string;
  reasoning: string;
  createdAt: Date;
}

export default function EnhancedNetworkRecommendations({
  contacts
}: NetworkRecommendationsProps) {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadPersistedRecommendations();
  }, [contacts.length]);

  const loadPersistedRecommendations = () => {
    const stored = localStorage.getItem('networkRecommendations');
    const lastUpdate = localStorage.getItem('recommendationsLastUpdate');
    if (stored && lastUpdate) {
      const storedDate = new Date(lastUpdate);
      const daysSinceUpdate = (Date.now() - storedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 1) {
        setRecommendations(JSON.parse(stored).map((rec: any) => ({
          ...rec,
          createdAt: new Date(rec.createdAt)
        })));
        setLastUpdated(storedDate);
        return;
      }
    }
    if (contacts.length > 0) {
      generateEnhancedRecommendations();
    }
  };

  const generateEnhancedRecommendations = async () => {
    if (contacts.length === 0) return;
    setIsLoading(true);
    try {
      const networkAnalysis = await analyzeNetworkPatterns();
      const systemPrompt = `You are Circl's strategic networking advisor. Generate 4-5 highly personalized, actionable relationship recommendations.

      Focus on strategic value:
      - Who could introduce you to new opportunities
      - Relationships that need nurturing to prevent decay
      - People who could benefit from your connections
      - Strategic timing for outreach
      - Mutual value creation opportunities

      Return JSON array: [{"type": "reach_out|follow_up|strengthen|birthday|reconnect|networking_opportunity", "contactName": "exact name", "suggestion": "specific actionable insight", "priority": "high|medium|low", "reasoning": "strategic rationale", "actionType": "message|call|meetup|introduction"}]`;
      const prompt = `Network Analysis:
${networkAnalysis}

Generate strategic networking recommendations that:
1. Identify high-value relationship opportunities
2. Suggest specific actions with clear timing
3. Focus on mutual benefit and relationship building
4. Consider industry connections and career growth
5. Prioritize based on relationship strength and potential impact

Make each recommendation feel personal and strategic, not generic.`;
      console.log('Generating enhanced network recommendations');
      const {
        data,
        error
      } = await supabase.functions.invoke('openrouter-ai', {
        body: {
          prompt,
          systemPrompt,
          model: 'mistralai/mistral-7b-instruct',
          maxTokens: 600,
          temperature: 0.8
        }
      });
      if (error) {
        throw new Error(`AI service error: ${error.message}`);
      }
      let aiRecommendations = [];
      try {
        aiRecommendations = JSON.parse(data.response) || [];
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        aiRecommendations = [];
      }
      const enhancedRecommendations: Recommendation[] = [];
      for (const aiRec of aiRecommendations.slice(0, 5)) {
        const contact = findBestContactMatch(aiRec.contactName);
        if (contact) {
          enhancedRecommendations.push({
            id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: aiRec.type || 'reach_out',
            contact,
            suggestion: aiRec.suggestion || `Connect with ${contact.name}`,
            priority: aiRec.priority || 'medium',
            actionLabel: getActionLabel(aiRec.actionType || aiRec.type),
            reasoning: aiRec.reasoning || 'Strategic networking opportunity',
            createdAt: new Date()
          });
        }
      }
      if (enhancedRecommendations.length < 3) {
        const fallbackRecs = await generateRuleBasedRecommendations();
        enhancedRecommendations.push(...fallbackRecs.slice(0, 3 - enhancedRecommendations.length));
      }
      localStorage.setItem('networkRecommendations', JSON.stringify(enhancedRecommendations));
      localStorage.setItem('recommendationsLastUpdate', new Date().toISOString());
      setRecommendations(enhancedRecommendations);
      setLastUpdated(new Date());
      toast.success("Fresh strategic recommendations generated!");
    } catch (error) {
      console.error('Error generating recommendations:', error);
      const fallbackRecs = await generateRuleBasedRecommendations();
      setRecommendations(fallbackRecs.slice(0, 4));
      toast.error("Using basic recommendations - AI service unavailable");
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeNetworkPatterns = async (): Promise<string> => {
    const today = new Date();
    const circleBreakdown = {
      inner: contacts.filter(c => c.circle === 'inner').length,
      middle: contacts.filter(c => c.circle === 'middle').length,
      outer: contacts.filter(c => c.circle === 'outer').length
    };
    const staleContacts = contacts.filter(c => {
      if (!c.last_contact) return true;
      const daysSince = (today.getTime() - new Date(c.last_contact).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > (c.circle === 'inner' ? 14 : c.circle === 'middle' ? 30 : 90);
    });
    const industries = [...new Set(contacts.map(c => c.company_name).filter(Boolean))];
    const recentlyActive = contacts.filter(c => {
      if (!c.last_contact) return false;
      const daysSince = (today.getTime() - new Date(c.last_contact).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });
    return `Network Overview:
- Total contacts: ${contacts.length}
- Inner circle: ${circleBreakdown.inner}, Middle: ${circleBreakdown.middle}, Outer: ${circleBreakdown.outer}
- Stale relationships: ${staleContacts.length}
- Active industries: ${industries.slice(0, 5).join(', ')}
- Recent activity: ${recentlyActive.length} contacts contacted this week

Key Contacts Needing Attention:
${staleContacts.slice(0, 8).map(c => `- ${c.name} (${c.circle} circle, ${c.company_name || 'Unknown company'}, last contact: ${c.last_contact ? Math.floor((today.getTime() - new Date(c.last_contact).getTime()) / (1000 * 60 * 60 * 24)) + ' days ago' : 'never'})`).join('\n')}`;
  };

  const findBestContactMatch = (contactName: string): Contact | null => {
    if (!contactName) return null;
    let match = contacts.find(c => c.name.toLowerCase() === contactName.toLowerCase());
    if (!match) {
      match = contacts.find(c => c.name.toLowerCase().includes(contactName.toLowerCase()) || contactName.toLowerCase().includes(c.name.toLowerCase()));
    }
    if (!match) {
      const nameParts = contactName.toLowerCase().split(' ');
      match = contacts.find(c => {
        const contactParts = c.name.toLowerCase().split(' ');
        return nameParts.some(part => contactParts.some(contactPart => contactPart.includes(part) || part.includes(contactPart)));
      });
    }
    return match || null;
  };

  const generateRuleBasedRecommendations = async (): Promise<Recommendation[]> => {
    const recommendations: Recommendation[] = [];
    const today = new Date();
    for (const contact of contacts.slice(0, 10)) {
      if (recommendations.length >= 4) break;
      const lastContact = contact.last_contact ? new Date(contact.last_contact) : null;
      const daysSinceContact = lastContact ? Math.floor((today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)) : 999;
      let threshold = 90;
      if (contact.circle === 'inner') threshold = 14;else if (contact.circle === 'middle') threshold = 30;
      if (daysSinceContact > threshold) {
        recommendations.push({
          id: `rule_${Date.now()}_${contact.id}`,
          type: 'reconnect',
          contact,
          suggestion: `Reconnect with ${contact.name} - it's been ${daysSinceContact} days since your last interaction`,
          priority: contact.circle === 'inner' ? 'high' : 'medium',
          actionLabel: 'Message',
          reasoning: `${contact.circle} circle contact needs regular attention`,
          createdAt: new Date()
        });
      }
      if (contact.birthday) {
        const birthday = new Date(contact.birthday);
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        const daysUntilBirthday = Math.floor((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilBirthday <= 14 && daysUntilBirthday >= 0) {
          recommendations.push({
            id: `birthday_${Date.now()}_${contact.id}`,
            type: 'birthday',
            contact,
            suggestion: `${contact.name}'s birthday is ${daysUntilBirthday === 0 ? 'today' : `in ${daysUntilBirthday} days`} - reach out to celebrate!`,
            priority: daysUntilBirthday <= 3 ? 'high' : 'medium',
            actionLabel: 'Celebrate',
            reasoning: 'Birthday opportunity for personal connection',
            createdAt: new Date()
          });
        }
      }
    }
    return recommendations;
  };

  const getActionLabel = (actionType: string): string => {
    switch (actionType) {
      case 'message': return 'Message';
      case 'call': return 'Call';
      case 'meetup': return 'Meet Up';
      case 'introduction': return 'Introduce';
      case 'follow_up': return 'Follow Up';
      case 'strengthen': return 'Strengthen';
      case 'birthday': return 'Celebrate';
      case 'reconnect': return 'Reconnect';
      default: return 'Connect';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50/20 text-red-700 border-red-200/30 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/30 backdrop-blur-md';
      case 'medium': return 'bg-orange-50/20 text-orange-700 border-orange-200/30 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30 backdrop-blur-md';
      case 'low': return 'bg-blue-50/20 text-blue-700 border-blue-200/30 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30 backdrop-blur-md';
      default: return 'bg-gray-50/20 text-gray-700 border-gray-200/30 dark:bg-gray-800/20 dark:text-gray-300 dark:border-gray-700/30 backdrop-blur-md';
    }
  };

  const handleActionClick = async (recommendation: Recommendation) => {
    const {
      contact,
      actionLabel
    } = recommendation;
    switch (actionLabel.toLowerCase()) {
      case 'message':
        if (contact.personal_email) {
          window.open(`mailto:${contact.personal_email}?subject=Following up&body=Hi ${contact.name},%0D%0A%0D%0AHope you're doing well! I wanted to reach out and see how things are going.%0D%0A%0D%0ABest regards`);
        } else {
          navigate(`/contacts/${contact.id}`);
        }
        break;
      case 'call':
        if (contact.mobile_phone) {
          window.open(`tel:${contact.mobile_phone}`);
        } else {
          navigate(`/contacts/${contact.id}`);
        }
        break;
      case 'celebrate':
      case 'meet up':
      case 'strengthen':
      case 'reconnect':
      case 'connect':
      default:
        navigate(`/contacts/${contact.id}`);
        break;
    }
    toast.success(`Action initiated for ${contact.name}`);
  };

  const handleRefresh = () => {
    localStorage.removeItem('networkRecommendations');
    localStorage.removeItem('recommendationsLastUpdate');
    generateEnhancedRecommendations();
  };

  return <Card className="unified-card glass-float">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Strategic Network Insights
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading || contacts.length === 0} className="unified-button">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
        {lastUpdated && <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}
          </p>}
      </CardHeader>
      
      <CardContent>
        {isLoading && recommendations.length === 0 ? <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing your network...</p>
            </div>
          </div> : recommendations.length > 0 ? <div className="space-y-4">
            {recommendations.map(rec => <div key={rec.id} className="p-4 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer group backdrop-blur-md shadow-lg hover:shadow-xl" onClick={() => handleActionClick(rec)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{rec.contact.name}</p>
                      <p className="text-sm text-muted-foreground">{rec.contact.company_name || 'No company'}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(rec.priority)}`}>
                    {rec.priority} priority
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{rec.suggestion}</p>
                <p className="text-xs text-muted-foreground/80 mb-3 italic">{rec.reasoning}</p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs bg-white/20 backdrop-blur-md border border-white/20">
                    {rec.contact.circle} circle
                  </Badge>
                  <Button size="sm" onClick={e => {
              e.stopPropagation();
              handleActionClick(rec);
            }} className="unified-button group-hover:bg-primary/30 group-hover:text-primary-foreground rounded-2xl backdrop-blur-md">
                    {rec.actionLabel === 'Message' && <MessageCircle className="h-3 w-3 mr-1" />}
                    {rec.actionLabel === 'Celebrate' && <Calendar className="h-3 w-3 mr-1" />}
                    {rec.actionLabel} <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>)}
          </div> : <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No strategic insights available yet.</p>
            <p className="text-sm mt-1">Add more contacts and interactions to get personalized networking recommendations.</p>
          </div>}
      </CardContent>
    </Card>;
}
