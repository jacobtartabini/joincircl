
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
import { LucideIcon } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  connected: boolean;
  username?: string;
  lastSynced?: string;
  provider: 'gmail' | 'calendar' | 'twitter' | 'facebook' | 'linkedin' | 'outlook';
}

const IntegrationsTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showTwitterDialog, setShowTwitterDialog] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);

  // Google integrations hook with error boundary
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

  // Social integrations hook with error handling
  const {
    integrationStatus,
    connectPlatform,
    disconnectPlatform,
    refreshStatus
  } = useSocialIntegrations();

  // Get Twitter status from social integrations with fallback
  const twitterStatus = integrationStatus?.find(s => s.platform === 'twitter') || { platform: 'twitter', connected: false };

  // Load integrations with comprehensive error handling
  useEffect(() => {
    const loadIntegrations = async () => {
      setLoading(true);
      try {
        console.log("Loading integrations data...");
        
        // Add retry logic with exponential backoff
        const maxRetries = 3;
        let currentRetry = 0;
        
        const tryRefresh = async () => {
          try {
            // Use Promise.allSettled to prevent one failure from blocking others
            const results = await Promise.allSettled([
              refreshIntegrationStatus().catch(err => {
                console.warn("Google integration refresh failed:", err);
                return { isGmailConnected: false, isCalendarConnected: false };
              }),
              refreshStatus().catch(err => {
                console.warn("Social integration refresh failed:", err);
                return [];
              })
            ]);
            
            console.log("Integration refresh results:", results);
            return true;
          } catch (error) {
            console.error("Refresh attempt failed:", error);
            
            if (currentRetry < maxRetries) {
              currentRetry++;
              console.log(`Retrying refresh attempt ${currentRetry}/${maxRetries}`);
              const delay = Math.pow(2, currentRetry) * 1000; // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, delay));
              return tryRefresh();
            }
            
            throw error;
          }
        };
        
        await tryRefresh();
        console.log("Successfully loaded integration data");
        
      } catch (error) {
        console.error('Critical error loading integrations:', error);
        
        // Show user-friendly error but don't block the UI
        toast({
          title: "Integration Status Warning",
          description: "Some integration data may not be current. You can still manage connections.",
          variant: "default",
        });
      } finally {
        setLoading(false);
      }
    };

    loadIntegrations();
  }, [refreshIntegrationStatus, refreshStatus, toast, retryAttempt]);

  // Update integrations state with fallbacks
  useEffect(() => {
    console.log("Updating integrations state with current data");
    
    const updatedIntegrations: Integration[] = [
      {
        id: 'gmail',
        name: 'Gmail',
        description: 'Connect Gmail to sync emails and contacts',
        icon: Mail,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        connected: isGmailConnected || false,
        provider: 'gmail'
      },
      {
        id: 'calendar',
        name: 'Google Calendar',
        description: 'Sync calendar events and meetings',
        icon: Calendar,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        connected: isCalendarConnected || false,
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
      },
      // Add placeholder integrations for Facebook, LinkedIn, Outlook
      {
        id: 'facebook',
        name: 'Facebook',
        description: 'Import contacts and posts from Facebook',
        icon: Mail, // Using Mail as placeholder - would need Facebook icon
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        connected: false,
        provider: 'facebook'
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        description: 'Connect professional network from LinkedIn',
        icon: Mail, // Using Mail as placeholder - would need LinkedIn icon
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        connected: false,
        provider: 'linkedin'
      },
      {
        id: 'outlook',
        name: 'Outlook',
        description: 'Sync emails and contacts from Outlook',
        icon: Mail,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
        connected: false,
        provider: 'outlook'
      }
    ];

    setIntegrations(updatedIntegrations);
    console.log("Integrations state updated:", updatedIntegrations);
  }, [isGmailConnected, isCalendarConnected, twitterStatus]);

  const handleConnect = async (integration: Integration) => {
    try {
      console.log(`Connecting to ${integration.name}...`);
      
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
        case 'facebook':
        case 'linkedin':
        case 'outlook':
          toast({
            title: "Coming Soon",
            description: `${integration.name} integration will be available soon.`,
          });
          break;
        default:
          throw new Error(`Unknown provider: ${integration.provider}`);
      }
    } catch (error) {
      console.error(`Error connecting to ${integration.name}:`, error);
      toast({
        title: "Connection Error",
        description: `Failed to connect to ${integration.name}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    try {
      console.log(`Disconnecting from ${integration.name}...`);
      
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
        default:
          throw new Error(`Unknown provider: ${integration.provider}`);
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
    console.log("Manual refresh triggered");
    setRetryAttempt(prev => prev + 1);
    
    toast({
      title: "Refreshing",
      description: "Updating integration status...",
    });
  };

  const formatLastSynced = (dateStr?: string) => {
    if (!dateStr) return "Never";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  // Show loading state
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
                    disabled={['facebook', 'linkedin', 'outlook'].includes(integration.provider)}
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
                <li><strong>Facebook:</strong> Import social connections and activity (coming soon)</li>
                <li><strong>LinkedIn:</strong> Professional network integration (coming soon)</li>
                <li><strong>Outlook:</strong> Email and calendar sync for Microsoft users (coming soon)</li>
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
