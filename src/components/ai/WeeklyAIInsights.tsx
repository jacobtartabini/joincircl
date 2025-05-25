
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { Contact, Interaction } from "@/types/contact";
import { aiService } from "@/services/aiService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface WeeklyAIInsightsProps {
  contacts: Contact[];
  interactions: Interaction[];
}

export default function WeeklyAIInsights({ contacts, interactions }: WeeklyAIInsightsProps) {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<{
    priorityContacts: Contact[];
    insights: string[];
    actionItems: string[];
  }>({ priorityContacts: [], insights: [], actionItems: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const weeklyInsights = await aiService.generateWeeklyInsights(contacts, interactions);
      setInsights(weeklyInsights);
      setLastUpdated(new Date());
      toast.success("Weekly insights updated!");
    } catch (error) {
      console.error("Error generating weekly insights:", error);
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Weekly AI Insights
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={isLoading}
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
            Last updated: {lastUpdated.toLocaleDateString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && insights.priorityContacts.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Analyzing your network...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Priority Contacts */}
            {insights.priorityContacts.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  Priority Contacts
                </h4>
                <div className="space-y-2">
                  {insights.priorityContacts.slice(0, 3).map((contact) => (
                    <div 
                      key={contact.id} 
                      className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/contacts/${contact.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.circle} circle</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Reach out
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Insights */}
            {insights.insights.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Key Insights
                </h4>
                <ul className="space-y-1">
                  {insights.insights.slice(0, 3).map((insight, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {insights.actionItems.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">This Week's Actions</h4>
                <ul className="space-y-1">
                  {insights.actionItems.slice(0, 3).map((action, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
