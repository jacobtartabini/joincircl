
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, MessageSquare, Loader2, RefreshCw } from "lucide-react";
import { Contact, Interaction } from "@/types/contact";
import { aiService, ConnectionSuggestion } from "@/services/aiService";
import { toast } from "sonner";

interface AIConnectionInsightsProps {
  contact: Contact;
  interactions: Interaction[];
}

export default function AIConnectionInsights({ contact, interactions }: AIConnectionInsightsProps) {
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const newSuggestions = await aiService.generateConnectionSuggestions(contact, interactions);
      setSuggestions(newSuggestions);
      setLastUpdated(new Date());
      toast.success("AI insights updated!");
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      toast.error("Failed to generate AI insights");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-generate suggestions on component mount
    generateSuggestions();
  }, [contact.id]);

  const getPriorityColor = (priority: ConnectionSuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: ConnectionSuggestion['type']) => {
    switch (type) {
      case 'reach_out': return '📞';
      case 'follow_up': return '🔄';
      case 'strengthen': return '💪';
      case 'reconnect': return '🤝';
      default: return '💡';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Relationship Insights
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
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
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && suggestions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Generating AI insights...</p>
            </div>
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <div key={index} className="p-3 rounded-lg border bg-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                  <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                    {suggestion.priority} priority
                  </Badge>
                </div>
              </div>
              
              <h4 className="font-medium mb-1">{suggestion.suggestion}</h4>
              <p className="text-sm text-muted-foreground mb-2">{suggestion.reasoning}</p>
              
              {suggestion.suggestedAction && (
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Suggested action:</span>
                  <span>{suggestion.suggestedAction}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Lightbulb className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click refresh to generate AI insights for this connection
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
