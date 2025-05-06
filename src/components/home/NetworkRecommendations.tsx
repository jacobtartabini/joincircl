import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Contact, Interaction } from "@/types/contact";
import { format, differenceInDays, differenceInMonths } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, AlertCircle, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { contactService } from "@/services/contactService";
type RecommendationType = "reconnect" | "circle-upgrade" | "circle-downgrade" | "birthday-coming";
interface Recommendation {
  type: RecommendationType;
  contact: Contact;
  reason: string;
  priority: number; // 1-10, 10 being highest
  actionLabel: string;
}
export default function NetworkRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const generateRecommendations = async () => {
      setLoading(true);
      try {
        // Load all contacts
        const contacts = await contactService.getContacts();
        const allRecommendations: Recommendation[] = [];

        // Process each contact
        for (const contact of contacts) {
          // Get interactions for this contact
          const interactions = await contactService.getInteractionsByContactId(contact.id);

          // Generate recommendations for this contact
          const contactRecommendations = analyzeContact(contact, interactions);
          allRecommendations.push(...contactRecommendations);
        }

        // Sort by priority (highest first)
        allRecommendations.sort((a, b) => b.priority - a.priority);

        // Take the top 3 recommendations
        setRecommendations(allRecommendations.slice(0, 3));
      } catch (error) {
        console.error("Error generating recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    generateRecommendations();
  }, []);
  const analyzeContact = (contact: Contact, interactions: Interaction[]): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const today = new Date();

    // Sort interactions by date descending
    const sortedInteractions = [...interactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastInteraction = sortedInteractions[0];
    const lastInteractionDate = lastInteraction ? new Date(lastInteraction.date) : null;

    // Check for reconnect recommendations
    if (lastInteractionDate) {
      const daysSinceLastInteraction = differenceInDays(today, lastInteractionDate);
      let reconnectThreshold = 0;

      // Inner circle: reach out every 7 days
      if (contact.circle === "inner") {
        reconnectThreshold = 7;
      }
      // Middle circle: reach out every 30 days
      else if (contact.circle === "middle") {
        reconnectThreshold = 30;
      }
      // Outer circle: reach out every 90 days
      else {
        reconnectThreshold = 90;
      }
      if (daysSinceLastInteraction > reconnectThreshold) {
        recommendations.push({
          type: "reconnect",
          contact,
          reason: `It's been ${daysSinceLastInteraction} days since you last connected with ${contact.name}`,
          priority: 10 - Math.min(9, Math.floor(daysSinceLastInteraction / reconnectThreshold)),
          actionLabel: "Reconnect"
        });
      }
    } else if (contact.circle !== "outer") {
      // No interactions but in inner or middle circle
      recommendations.push({
        type: "reconnect",
        contact,
        reason: `You haven't logged any interactions with ${contact.name} who is in your ${contact.circle} circle`,
        priority: contact.circle === "inner" ? 9 : 7,
        actionLabel: "Reach Out"
      });
    }

    // Circle upgrade recommendations
    if (contact.circle === "outer" && sortedInteractions.length >= 3) {
      // Check if interactions are frequent (3+ in the last 2 months)
      const recentInteractions = sortedInteractions.filter(i => differenceInMonths(today, new Date(i.date)) <= 2);
      if (recentInteractions.length >= 3) {
        recommendations.push({
          type: "circle-upgrade",
          contact,
          reason: `You've interacted with ${contact.name} ${recentInteractions.length} times recently. Consider upgrading to Middle Circle.`,
          priority: 7,
          actionLabel: "Review"
        });
      }
    }

    // Circle downgrade recommendations
    if (contact.circle === "inner" && lastInteractionDate) {
      // If inner circle but no interaction in 3 months
      const monthsSinceLastInteraction = differenceInMonths(today, lastInteractionDate);
      if (monthsSinceLastInteraction >= 3) {
        recommendations.push({
          type: "circle-downgrade",
          contact,
          reason: `${contact.name} is in your Inner Circle but you haven't connected in ${monthsSinceLastInteraction} months`,
          priority: 8,
          actionLabel: "Review"
        });
      }
    }

    // Birthday recommendations
    if (contact.birthday) {
      const birthday = new Date(contact.birthday);
      const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

      // If birthday has passed this year, set to next year
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }
      const daysToBirthday = differenceInDays(nextBirthday, today);
      if (daysToBirthday <= 14) {
        recommendations.push({
          type: "birthday-coming",
          contact,
          reason: `${contact.name}'s birthday is ${daysToBirthday === 0 ? "today" : `in ${daysToBirthday} day${daysToBirthday > 1 ? 's' : ''}`}`,
          priority: daysToBirthday <= 7 ? 9 : 6,
          actionLabel: "Plan"
        });
      }
    }
    return recommendations;
  };
  const getIconForRecommendation = (type: RecommendationType) => {
    switch (type) {
      case "reconnect":
        return <RefreshCcw size={18} className="text-blue-500" />;
      case "circle-upgrade":
        return <ArrowUpCircle size={18} className="text-green-500" />;
      case "circle-downgrade":
        return <ArrowDownCircle size={18} className="text-orange-500" />;
      case "birthday-coming":
        return <AlertCircle size={18} className="text-purple-500" />;
      default:
        return null;
    }
  };
  const getBackgroundForRecommendation = (type: RecommendationType) => {
    switch (type) {
      case "reconnect":
        return "bg-blue-50";
      case "circle-upgrade":
        return "bg-green-50";
      case "circle-downgrade":
        return "bg-orange-50";
      case "birthday-coming":
        return "bg-purple-50";
      default:
        return "bg-muted";
    }
  };
  const handleActionClick = (contact: Contact) => {
    navigate(`/contacts/${contact.id}`);
  };
  return <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Network Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div> : recommendations.length > 0 ? <div className="space-y-4">
            {recommendations.map((rec, index) => <div key={`${rec.contact.id}-${index}`} className={`p-3 rounded-lg ${getBackgroundForRecommendation(rec.type)}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getIconForRecommendation(rec.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{rec.contact.name}</p>
                      <Badge variant="outline" className="text-xxs">
                        {rec.contact.circle} circle
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                    <div className="flex justify-end mt-2">
                      <Button size="sm" variant="outline" onClick={() => handleActionClick(rec.contact)}>
                        {rec.actionLabel}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>)}
          </div> : <div className="text-center py-8 text-muted-foreground">
            <p>No recommendations right now.</p>
            <p className="text-sm mt-1">Add more contacts and log interactions to get personalized suggestions.</p>
          </div>}
      </CardContent>
    </Card>;
}