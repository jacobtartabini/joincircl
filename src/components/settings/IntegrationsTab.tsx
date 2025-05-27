
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Calendar, 
  MessageSquare, 
  Twitter, 
  Linkedin, 
  Github,
  Slack,
  Chrome,
  CheckCircle,
  Plus,
  Settings,
  ExternalLink
} from "lucide-react";

const IntegrationsTab = () => {
  const [integrations, setIntegrations] = useState({
    gmail: { connected: true, enabled: true },
    outlook: { connected: false, enabled: false },
    calendar: { connected: true, enabled: true },
    twitter: { connected: false, enabled: false },
    linkedin: { connected: true, enabled: true },
    slack: { connected: false, enabled: false }
  });

  const availableIntegrations = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Sync contacts and track email interactions',
      icon: Mail,
      category: 'Email',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'outlook',
      name: 'Outlook',
      description: 'Connect your Microsoft email account',
      icon: Mail,
      category: 'Email', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      description: 'Track meetings and schedule follow-ups',
      icon: Calendar,
      category: 'Calendar',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      description: 'Monitor social interactions and mentions',
      icon: Twitter,
      category: 'Social',
      color: 'text-blue-400',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Import professional connections',
      icon: Linkedin,
      category: 'Social',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Track team communications',
      icon: Slack,
      category: 'Communication',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const categories = ['All', 'Email', 'Calendar', 'Social', 'Communication'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredIntegrations = availableIntegrations.filter(integration => 
    selectedCategory === 'All' || integration.category === selectedCategory
  );

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        enabled: !prev[id].enabled
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Connected Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {Object.values(integrations).filter(i => i.connected).length}
              </div>
              <div className="text-sm text-green-600">Connected</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">
                {Object.values(integrations).filter(i => i.enabled).length}
              </div>
              <div className="text-sm text-blue-600">Active</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-700">
                {availableIntegrations.length}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4">
        {filteredIntegrations.map((integration) => {
          const status = integrations[integration.id];
          
          return (
            <Card key={integration.id} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${integration.bgColor}`}>
                      <integration.icon className={`h-6 w-6 ${integration.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {integration.category}
                        </Badge>
                        {status?.connected && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {status?.connected ? (
                      <>
                        <Switch
                          checked={status.enabled}
                          onCheckedChange={() => toggleIntegration(integration.id)}
                        />
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* API Access */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Developer Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Chrome className="h-5 w-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">API Access</h4>
                <p className="text-sm text-gray-600">Generate API keys for custom integrations</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Manage Keys
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsTab;
