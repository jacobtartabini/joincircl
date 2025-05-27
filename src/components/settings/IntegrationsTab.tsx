
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, Linkedin, Twitter, Github, Slack, Plus } from "lucide-react";

const IntegrationsTab = () => {
  const [integrations, setIntegrations] = useState({
    google: true,
    outlook: false,
    linkedin: true,
    twitter: false,
    github: false,
    slack: false
  });

  const handleToggle = (integration: string, enabled: boolean) => {
    setIntegrations(prev => ({ ...prev, [integration]: enabled }));
  };

  const availableIntegrations = [
    {
      id: 'google',
      name: 'Google Workspace',
      description: 'Sync contacts and calendar events',
      icon: Mail,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      enabled: integrations.google
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      description: 'Import contacts and meetings',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      enabled: integrations.outlook
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Import professional connections',
      icon: Linkedin,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      enabled: integrations.linkedin
    },
    {
      id: 'twitter',
      name: 'Twitter',
      description: 'Track social interactions',
      icon: Twitter,
      color: 'text-sky-600',
      bgColor: 'bg-sky-100',
      enabled: integrations.twitter
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect with developer contacts',
      icon: Github,
      color: 'text-gray-800',
      bgColor: 'bg-gray-100',
      enabled: integrations.github
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Import team members and conversations',
      icon: Slack,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      enabled: integrations.slack
    }
  ];

  return (
    <div className="space-y-8">
      {/* Connected Integrations */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Connected Services</CardTitle>
            <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50">
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableIntegrations.map((integration) => (
            <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 ${integration.bgColor} rounded-lg flex items-center justify-center`}>
                  <integration.icon className={`h-5 w-5 ${integration.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{integration.name}</h4>
                    {integration.enabled && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{integration.description}</p>
                </div>
              </div>
              <Switch
                checked={integration.enabled}
                onCheckedChange={(checked) => handleToggle(integration.id, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* API Access */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold text-gray-900">API Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Developer Access</h4>
            <p className="text-sm text-blue-700 mb-4">
              Generate API keys to integrate Circl with your own applications and workflows.
            </p>
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              Generate API Key
            </Button>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Existing API Keys</h4>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Development Key</h5>
                  <p className="text-sm text-gray-600">Created on March 15, 2024</p>
                  <p className="text-xs text-gray-500 mt-1">Last used: 2 days ago</p>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  Revoke
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold text-gray-900">Webhooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Event Notifications</h4>
            <p className="text-sm text-gray-600 mb-4">
              Configure webhook endpoints to receive real-time notifications about contact updates and interactions.
            </p>
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
              Add Webhook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsTab;
