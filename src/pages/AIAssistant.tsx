
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Users,
  Target,
  TrendingUp,
  MessageSquare
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
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-6 w-6 text-purple-500" />
          AI Relationship Assistant
        </h1>
        <p className="text-muted-foreground">
          Get personalized insights and advice for managing your network
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">Personalized Advice</Badge>
          <Badge variant="outline" className="text-xs">Contact Insights</Badge>
          <Badge variant="outline" className="text-xs">Relationship Management</Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-3 text-center">
              <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 min-h-0">
        <SimplifiedAIChat contacts={contacts} />
      </div>
    </div>
  );
}
