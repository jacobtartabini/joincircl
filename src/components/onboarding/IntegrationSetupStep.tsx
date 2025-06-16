
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Mail, Linkedin, Twitter, Bell, Shield, Zap } from 'lucide-react';

interface IntegrationSetupStepProps {
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function IntegrationSetupStep({ onNext, onSkip }: IntegrationSetupStepProps) {
  const [selectedIntegrations, setSelectedIntegrations] = useState<Record<string, boolean>>({
    calendar: false,
    email: false,
    linkedin: false,
    twitter: false,
    notifications: true,
  });

  const integrations = [
    {
      id: 'calendar',
      title: 'Calendar Integration',
      description: 'Sync your calendar to track meetings and events with contacts',
      icon: Calendar,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      comingSoon: true,
    },
    {
      id: 'email',
      title: 'Email Integration',
      description: 'Connect your email to track communications',
      icon: Mail,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      comingSoon: true,
    },
    {
      id: 'linkedin',
      title: 'LinkedIn',
      description: 'Import professional contacts and stay updated',
      icon: Linkedin,
      iconColor: 'text-[#0077B5]',
      bgColor: 'bg-blue-50',
      comingSoon: true,
    },
    {
      id: 'twitter',
      title: 'Twitter/X',
      description: 'Track social interactions with your network',
      icon: Twitter,
      iconColor: 'text-gray-900',
      bgColor: 'bg-gray-50',
      comingSoon: true,
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      description: 'Get reminded about important relationship moments',
      icon: Bell,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      comingSoon: false,
    },
  ];

  const handleIntegrationToggle = (integrationId: string) => {
    setSelectedIntegrations(prev => ({
      ...prev,
      [integrationId]: !prev[integrationId]
    }));
  };

  const handleContinue = () => {
    onNext({ integrations: selectedIntegrations });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Zap className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Connect Your Tools</h1>
        <p className="text-lg text-muted-foreground">Integrate with your favorite apps to make relationship management effortless</p>
      </div>

      <div className="space-y-4 mb-8">
        {integrations.map((integration) => {
          const IconComponent = integration.icon;
          const isEnabled = selectedIntegrations[integration.id];
          
          return (
            <Card 
              key={integration.id}
              className={`border-2 transition-all duration-200 ${
                isEnabled && !integration.comingSoon
                  ? 'border-blue-500 bg-blue-50/50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              } ${integration.comingSoon ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`flex-shrink-0 p-3 rounded-full ${integration.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${integration.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{integration.title}</h3>
                        {integration.comingSoon && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={integration.id}
                      checked={isEnabled}
                      onCheckedChange={() => !integration.comingSoon && handleIntegrationToggle(integration.id)}
                      disabled={integration.comingSoon}
                    />
                    <Label htmlFor={integration.id} className="sr-only">
                      Toggle {integration.title}
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-blue-200 bg-blue-50/50 mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Your Privacy is Protected</h4>
              <p className="text-sm text-blue-700">
                We only access the minimum data needed for features you enable. You can disconnect any integration at any time from Settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip for now
        </Button>
        
        <Button 
          onClick={handleContinue}
          className="bg-purple-600 hover:bg-purple-700 px-8 rounded-full min-w-[120px]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
