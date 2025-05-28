
import { useState, useEffect } from "react";
import { Mail, Calendar, Twitter, Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useGoogleIntegrations } from "@/hooks/useGoogleIntegrations";
import { useSocialIntegrations } from "@/hooks/useSocialIntegrations";
import { TwitterAuthDialog } from "@/components/integrations/TwitterAuthDialog";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  connected: boolean;
  username?: string;
  lastSynced?: string;
  provider: 'gmail' | 'calendar' | 'twitter';
}

const IntegrationsTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showTwitterDialog, setShowTwitterDialog] = useState(false);

  // Google integrations hook
  const {
    isGmailConnected,
    isCalendarConnected,
    isLoading: googleLoading,
    error: googleError,
    connectGmail,
    connectCalendar,
    disconnectGmail,
    disconnectCalendar,
    refreshIntegrationStatus
  } = useGoogleIntegrations();

  // Social integrations hook for Twitter
  const {
    integrationStatus,
    connectPlatform,
    disconnectPlatform,
    refreshStatus
  } = useSocialIntegrations();

  // Get Twitter status from social integrations
  const twitterStatus = integrationStatus.find(s => s.platform === 'twitter');

  useEffect(() => {
    const loadIntegrations = async () => {
      setLoading(true);
      try {
        // Refresh both Google and social integration statuses
        await Promise.all([
          refreshIntegrationStatus(),
          refreshStatus()
        ]);
      } catch (error) {
        console.error('Error loading integrations:', error);
        toast({
          title: "Error",
          description: "Failed to load integration status",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadIntegrations();
  }, [refreshIntegrationStatus, refreshStatus, toast]);

  // Update integrations state when hooks update
  useEffect(() => {
    const updatedIntegrations: Integration[] = [
      {
        id: 'gmail',
        name: 'Gmail',
        description: 'Connect Gmail to sync emails and contacts',
        icon: Mail,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        connected: isGmailConnected,
        provider: 'gmail'
      },
      {
        id: 'calendar',
        name: 'Google Calendar',
        description: 'Sync calendar events and meetings',
        icon: Calendar,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        connected: isCalendarConnected,
        provider: 'calendar'
      },
      {
        id: 'twitter',
        name: 'Twitter',
        description: 'Connect Twitter to track social interactions',
        icon: Twitter,
        color: 'text-sky-600',
        bgColor: 'bg-sky-100',
        connected: twitterStatus?.connected || false,
        username: twitterStatus?.username,
        lastSynced: twitterStatus?.last_synced,
        provider: 'twitter'
      }
    ];

    setIntegrations(updatedIntegrations);
  }, [isGmailConnected, isCalendarConnected, twitterStatus]);

  const handleConnect = async (integration: Integration) => {
    try {
      switch (integration.provider) {
        case 'gmail':
          await connectGmail();
          break;
        case 'calendar':
          await connectCalendar();
          break;
        case 'twitter':
          setShowTwitterDialog(true);
          break;
      }
    } catch (error) {
      console.error(`Error connecting to ${integration.name}:`, error);
      toast({
        title: "Connection Error",
        description: `Failed to connect to ${integration.name}`,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    try {
      switch (integration.provider) {
        case 'gmail':
          await disconnectGmail();
          break;
        case 'calendar':
          await disconnectCalendar();
          break;
        case 'twitter':
          await disconnectPlatform('twitter');
          break;
      }
      
      toast({
        title: "Disconnected",
        description: `Successfully disconnected from ${integration.name}`,
      });
    } catch (error) {
      console.error(`Error disconnecting from ${integration.name}:`, error);
      toast({
        title: "Error",
        description: `Failed to disconnect from ${integration.name}`,
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([
        refreshIntegrationStatus(),
        refreshStatus()
      ]);
      toast({
        title: "Refreshed",
        description: "Integration status updated",
      });
    } catch (error) {
      console.error('Error refreshing integrations:', error);
      toast({
        title: "Error",
        description: "Failed to refresh integration status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatLastSynced = (dateStr?: string) => {
    if (!dateStr) return "Never";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  if (loading || googleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading integrations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">External Services</h3>
          <p className="text-sm text-muted-foreground">
            Connect your accounts to enhance functionality
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {googleError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{googleError}</AlertDescription>
        </Alert>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id} className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${integration.bgColor} rounded-lg flex items-center justify-center`}>
                    <integration.icon className={`h-5 w-5 ${integration.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                {integration.connected ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {integration.connected && (
                <div className="space-y-2 mb-4">
                  {integration.username && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Account:</span>
                      <span className="font-medium">{integration.username}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last synced:</span>
                    <span className="font-medium">{formatLastSynced(integration.lastSynced)}</span>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                {integration.connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(integration)}
                    className="flex-1"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(integration)}
                    className="flex-1"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Twitter Auth Dialog */}
      {showTwitterDialog && (
        <TwitterAuthDialog
          isOpen={showTwitterDialog}
          onClose={() => setShowTwitterDialog(false)}
          onSuccess={() => {
            setShowTwitterDialog(false);
            refreshStatus();
            toast({
              title: "Success",
              description: "Twitter account connected successfully",
            });
          }}
        />
      )}

      {/* Integration Info */}
      <Card className="border-0 shadow-sm bg-blue-50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h4 className="font-medium text-blue-900">About Integrations</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>Connect your external accounts to unlock powerful features:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Gmail:</strong> Import contacts and sync email communications</li>
                <li><strong>Google Calendar:</strong> View and create calendar events from contacts</li>
                <li><strong>Twitter:</strong> Track social interactions and import connections</li>
              </ul>
              <p className="text-blue-700 mt-3">
                All integrations use secure OAuth authentication and respect your privacy settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsTab;
