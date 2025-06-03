
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Users,
  Target,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Zap,
  Globe
} from "lucide-react";
import { useContacts } from "@/hooks/use-contacts";
import SimplifiedAIChat from "@/components/ai/SimplifiedAIChat";

export default function AIAssistant() {
  const { contacts } = useContacts();

  const stats = [
    { 
      icon: Users, 
      label: "Total", 
      value: contacts.length,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      icon: Target, 
      label: "Inner", 
      value: contacts.filter(c => c.circle === 'inner').length,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    { 
      icon: TrendingUp, 
      label: "Middle", 
      value: contacts.filter(c => c.circle === 'middle').length,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    { 
      icon: MessageSquare, 
      label: "Outer", 
      value: contacts.filter(c => c.circle === 'outer').length,
      color: "text-green-600",
      bg: "bg-green-50"
    }
  ];

  const suggestions = [
    {
      title: "Follow up with Sarah",
      description: "You haven't connected in 3 weeks",
      action: "Send message",
      priority: "high"
    },
    {
      title: "Catch up with the design team",
      description: "Schedule a team coffee this week",
      action: "Schedule",
      priority: "medium"
    },
    {
      title: "Connect Mike and Jessica",
      description: "They both work in fintech",
      action: "Introduce",
      priority: "low"
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "Smart Insights",
      description: "Get AI-powered relationship analysis"
    },
    {
      icon: Target,
      title: "Follow-up Reminders",
      description: "Never miss important connections"
    },
    {
      icon: Users,
      title: "Network Growth",
      description: "Strategic relationship building advice"
    },
    {
      icon: Globe,
      title: "Communication Tips",
      description: "Improve your outreach effectiveness"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-6 py-8">
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-lg text-gray-600">Your intelligent relationship management companion</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-3 flex-wrap">
            {features.map((feature, index) => (
              <Badge key={index} variant="outline" className="bg-white/80 border-gray-200 px-4 py-2">
                <feature.icon className="h-4 w-4 mr-2 text-blue-500" />
                {feature.title}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Network Overview */}
            <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Network Overview
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {stats.map((stat, index) => (
                    <div key={index} className={`text-center p-4 ${stat.bg} rounded-xl border border-gray-100`}>
                      <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Smart Suggestions */}
            <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Smart Suggestions</h3>
                </div>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm">{suggestion.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                          suggestion.priority === 'high' ? 'bg-red-400' :
                          suggestion.priority === 'medium' ? 'bg-amber-400' : 'bg-blue-400'
                        }`} />
                      </div>
                      <Button size="sm" variant="outline" className="w-full text-xs border-gray-200 hover:bg-white hover:border-blue-200 hover:text-blue-600">
                        {suggestion.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm h-[700px] flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Chat</h3>
                      <p className="text-sm text-gray-600">Get instant help with your relationships</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                    Enhanced
                  </Badge>
                </div>
                <div className="flex-1 min-h-0">
                  <SimplifiedAIChat contacts={contacts} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
