
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
  Globe,
  Plus,
  Calendar,
  UserPlus,
  BarChart3
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

  const quickActions = [
    {
      icon: UserPlus,
      title: "Add New Contact",
      prompt: "Help me add a new contact to my network",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100"
    },
    {
      icon: Calendar,
      title: "Schedule Follow-ups",
      prompt: "Who should I follow up with this week?",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100"
    },
    {
      icon: BarChart3,
      title: "Network Analysis",
      prompt: "Analyze my network and suggest improvements",
      color: "bg-green-50 border-green-200 hover:bg-green-100"
    },
    {
      icon: Target,
      title: "Relationship Goals",
      prompt: "Help me set relationship goals for this month",
      color: "bg-amber-50 border-amber-200 hover:bg-amber-100"
    }
  ];

  const smartSuggestions = [
    "Who haven't I contacted in the last month?",
    "Suggest networking opportunities for this week",
    "How can I strengthen my inner circle?",
    "What follow-up actions do I need to take?",
    "Help me organize a networking event",
    "Analyze my contact engagement patterns"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Modern Header */}
        <div className="text-center space-y-6 py-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 rounded-3xl flex items-center justify-center shadow-xl">
              <Brain className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              AI Relationship Assistant
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your intelligent companion for managing relationships, growing your network, and staying connected with what matters most.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar with Stats & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Network Overview */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Network Overview</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className={`text-center p-4 ${stat.bg} rounded-2xl border border-gray-100/50`}>
                      <stat.icon className={`h-6 w-6 mx-auto mb-3 ${stat.color}`} />
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`w-full justify-start text-left h-auto p-4 ${action.color} border transition-all duration-200`}
                      onClick={() => {
                        // This would trigger the AI chat with the prompt
                        console.log('Quick action:', action.prompt);
                      }}
                    >
                      <action.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{action.title}</div>
                        <div className="text-sm text-gray-600 truncate">{action.prompt}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 ml-2 flex-shrink-0 opacity-60" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Interface */}
          <div className="lg:col-span-8">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm h-[700px] flex flex-col">
              <CardContent className="p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">AI Chat</h2>
                      <p className="text-gray-600">Ask anything about your relationships and network</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 px-4 py-2">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enhanced
                  </Badge>
                </div>

                {/* Smart Suggestions Header */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Smart Suggestions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {smartSuggestions.slice(0, 3).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                        onClick={() => {
                          // This would populate the chat input
                          console.log('Suggestion clicked:', suggestion);
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
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
