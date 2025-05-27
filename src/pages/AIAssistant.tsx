
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Users,
  MessageSquare,
  TrendingUp,
  Target
} from "lucide-react";
import { useContacts } from "@/hooks/use-contacts";
import SimplifiedAIChat from "@/components/ai/SimplifiedAIChat";

export default function AIAssistant() {
  const { contacts } = useContacts();

  const stats = [
    { 
      icon: Users, 
      label: "Total Contacts", 
      value: contacts.length,
      color: "text-blue-500"
    },
    { 
      icon: Target, 
      label: "Inner Circle", 
      value: contacts.filter(c => c.circle === 'inner').length,
      color: "text-green-500"
    },
    { 
      icon: TrendingUp, 
      label: "Middle Circle", 
      value: contacts.filter(c => c.circle === 'middle').length,
      color: "text-yellow-500"
    },
    { 
      icon: MessageSquare, 
      label: "Outer Circle", 
      value: contacts.filter(c => c.circle === 'outer').length,
      color: "text-gray-500"
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
          Get personalized insights and advice for managing your network
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="outline">Personalized Advice</Badge>
          <Badge variant="outline">Contact Insights</Badge>
          <Badge variant="outline">Relationship Management</Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Chat Interface */}
      <SimplifiedAIChat contacts={contacts} />

      {/* Help Text */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to get the best results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Ask about specific contacts:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• "When should I reach out to John?"</li>
                <li>• "Help me reconnect with my college friends"</li>
                <li>• "Who in my network works at Google?"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Get relationship advice:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• "How can I strengthen my professional network?"</li>
                <li>• "What's the best way to follow up after meeting someone?"</li>
                <li>• "Help me prioritize my outreach this week"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
