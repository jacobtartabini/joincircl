
import { Mail, Calendar, Linkedin, Twitter, Facebook, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useUserIntegrations } from "@/hooks/useUserIntegrations";

const IntegrationsTab = () => {
  const { integrations, loading, toggleIntegration, isConnected } = useUserIntegrations();

  const availableIntegrations = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Sync emails and contacts from Gmail',
      icon: Mail,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      description: 'Import contacts and emails from Outlook',
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      description: 'Sync calendar events and meetings',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Import professional connections',
      icon: Linkedin,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
    },
    {
      id: 'twitter',
      name: 'Twitter',
      description: 'Track social interactions',
      icon: Twitter,
      color: 'text-sky-600',
      bgColor: 'bg-sky-100',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Connect with Facebook contacts',
      icon: Facebook,
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Connected Integrations */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold text-gray-900">Connected Services</CardTitle>
          <p className="text-sm text-gray-600">Manage your connected platforms and services</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableIntegrations.map((integration) => {
            const connected = isConnected(integration.id);
            return (
              <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${integration.bgColor} rounded-lg flex items-center justify-center`}>
                    <integration.icon className={`h-5 w-5 ${integration.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{integration.name}</h4>
                      {connected && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                </div>
                <Switch
                  checked={connected}
                  onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold text-gray-900">Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableIntegrations.map((integration) => {
              const connected = isConnected(integration.id);
              const connectedIntegration = integrations.find(i => i.provider === integration.id && i.is_active);
              
              return (
                <div key={integration.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 ${integration.bgColor} rounded-lg flex items-center justify-center`}>
                      <integration.icon className={`h-4 w-4 ${integration.color}`} />
                    </div>
                    <h4 className="font-medium text-gray-900">{integration.name}</h4>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={connected ? "text-green-600" : "text-gray-500"}>
                        {connected ? "Connected" : "Not connected"}
                      </span>
                    </div>
                    {connected && connectedIntegration && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Connected:</span>
                          <span className="text-gray-500">
                            {new Date(connectedIntegration.connected_at).toLocaleDateString()}
                          </span>
                        </div>
                        {connectedIntegration.last_synced && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Last sync:</span>
                            <span className="text-gray-500">
                              {new Date(connectedIntegration.last_synced).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsTab;
