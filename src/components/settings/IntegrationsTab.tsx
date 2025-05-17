import { useState, useEffect } from "react";
import { useSocialIntegrations } from "@/hooks/useSocialIntegrations";
import { SocialPlatform } from "@/types/socialIntegration";
import { useEmailProviders } from "@/hooks/useEmailProviders";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";
import { CalendarConnectionDialog } from "@/components/calendar/CalendarConnectionDialog";
import { EmailConnectionDialog } from "@/components/integrations/EmailConnectionDialog";
import { TwitterAuthDialog } from "@/components/integrations/TwitterAuthDialog";
import { Facebook, Twitter, Instagram, Linkedin, RefreshCw, Calendar, Bell, Mail, Phone, AlertTriangle } from "lucide-react";
import NotificationPreferences from "@/components/notifications/NotificationPreferences";

const IntegrationsTab = () => {
  const { toast } = useToast();
  // Email integration state
  const { isGmailConnected, isOutlookConnected } = useEmailProviders();
  const [isGmailDialogOpen, setIsGmailDialogOpen] = useState(false);
  const [isOutlookDialogOpen, setIsOutlookDialogOpen] = useState(false);
  
  // Calendar integration state
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
  
  // Twitter auth dialog state
  const [isTwitterDialogOpen, setIsTwitterDialogOpen] = useState(false);
  
  // Phone contacts state
  const [isPhoneContactsSynced, setIsPhoneContactsSynced] = useState(false);
  
  // Social integration state
  const {
    integrationStatus,
    isLoading,
    isSyncing,
    connectPlatform,
    disconnectPlatform,
    syncContacts,
    refreshStatus
  } = useSocialIntegrations();
  
  const [activeTab, setActiveTab] = useState<string>("social");

  // Check URL params for tab selection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "integrations") {
      // If we're coming back from an OAuth callback, refresh integration status
      refreshStatus();
    }
  }, [refreshStatus]);

  const handleConnect = (platform: SocialPlatform) => {
    if (platform === "twitter") {
      setIsTwitterDialogOpen(true);
    } else {
      connectPlatform(platform);
    }
  };

  const handleDisconnect = (platform: SocialPlatform) => {
    disconnectPlatform(platform);
  };

  const handleSync = (platform: SocialPlatform) => {
    syncContacts(platform);
  };
  
  const handleSyncPhoneContacts = () => {
    toast({
      title: "Phone Contacts",
      description: "Requesting permission to access your phone contacts...",
    });
    
    setTimeout(() => {
      setIsPhoneContactsSynced(true);
      toast({
        title: "Success",
        description: "Your phone contacts have been successfully synced.",
      });
    }, 2000);
  };

  const getPlatformIcon = (platform: string, size = 20) => {
    switch (platform) {
      case "facebook":
        return <Facebook size={size} className="text-blue-600" />;
      case "twitter":
        return <Twitter size={size} className="text-sky-500" />;
      case "linkedin":
        return <Linkedin size={size} className="text-blue-700" />;
      case "instagram":
        return <Instagram size={size} className="text-pink-600" />;
      default:
        return null;
    }
  };

  const formatLastSynced = (dateStr: string | undefined) => {
    if (!dateStr) return "Never";
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Integrations</h2>
        <p className="text-muted-foreground">
          Connect your accounts and services to enhance your Circl experience
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="social" className="flex items-center gap-2">
            Social Media
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail size={16} />
            Email
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar size={16} />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-4">
          {["twitter", "facebook", "linkedin", "instagram"].map((platform) => {
            const status = integrationStatus.find(s => s.platform === platform);
            const isConnected = status?.connected || false;

            return (
              <Card key={platform}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(platform)}
                    <CardTitle className="text-xl capitalize">{platform}</CardTitle>
                  </div>
                  {isConnected && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Connected
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {platform === "twitter" && "Connect to Twitter/X to import contacts and view tweets"}
                    {platform === "facebook" && "Import contacts and post summaries from Facebook"}
                    {platform === "linkedin" && "Import professional connections from LinkedIn"}
                    {platform === "instagram" && "Connect to view Instagram activity"}
                  </CardDescription>
                  
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-40" />
                      <Skeleton className="h-4 w-60" />
                      <Skeleton className="h-10 w-32 mt-4" />
                    </div>
                  ) : (
                    <>
                      {isConnected ? (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium">Username:</span>
                              <span className="text-sm">{status?.username || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium">Last synced:</span>
                              <span className="text-sm">
                                {formatLastSynced(status?.last_synced)}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-3 mt-4">
                            <Button
                              variant="default"
                              onClick={() => handleSync(platform as SocialPlatform)}
                              disabled={isSyncing}
                            >
                              <RefreshCw className={`h-4 w-4 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
                              Sync Contacts
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDisconnect(platform as SocialPlatform)}
                            >
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {platform === "linkedin" || platform === "instagram" ? (
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start gap-2 mb-4">
                              <AlertTriangle className="text-amber-500 h-5 w-5 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-amber-800">
                                  Limited Availability
                                </p>
                                <p className="text-sm text-amber-700">
                                  {platform === "linkedin" 
                                    ? "LinkedIn integration is available with Business tier subscriptions only."
                                    : "Instagram integration is currently in beta."}
                                </p>
                              </div>
                            </div>
                          ) : null}

                          <Button
                            onClick={() => handleConnect(platform as SocialPlatform)}
                            className={platform === "linkedin" || platform === "instagram" ? "opacity-50" : ""}
                            disabled={platform === "linkedin" || platform === "instagram"}
                          >
                            {getPlatformIcon(platform, 16)}
                            <span className="ml-1.5">Connect {platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {/* Info card remains the same */}
          <Card>
            <CardHeader>
              <CardTitle>About Social Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  Connect your social media accounts to enhance your contact management:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Import contacts from social platforms directly into your circles</li>
                  <li>View recent posts and activity from your contacts in one place</li>
                  <li>Get summaries of what your contacts are posting about</li>
                  <li>Keep contact information synced between platforms</li>
                </ul>
                <p className="text-muted-foreground">
                  All integrations respect privacy settings and only access data that you and your contacts have made public.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Integrations Tab */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Providers</CardTitle>
              <CardDescription>
                Connect your email providers to sync contacts and interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-500 font-bold">G</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Gmail</h3>
                    <p className="text-sm text-muted-foreground">
                      {isGmailConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <Button onClick={() => setIsGmailDialogOpen(true)}>
                  {isGmailConnected ? "Reconfigure" : "Connect"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-500 font-bold">O</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Outlook</h3>
                    <p className="text-sm text-muted-foreground">
                      {isOutlookConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <Button onClick={() => setIsOutlookDialogOpen(true)}>
                  {isOutlookConnected ? "Reconfigure" : "Connect"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Integration Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Calendar Integration</CardTitle>
                <CardDescription>
                  Connect your calendar to sync events and interactions
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Connect your calendar to keep track of your connections and important events.
              </p>
              <Button onClick={() => setIsCalendarDialogOpen(true)}>
                Connect Calendar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <NotificationPreferences />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CalendarConnectionDialog 
        isOpen={isCalendarDialogOpen}
        onOpenChange={setIsCalendarDialogOpen}
      />
      
      <EmailConnectionDialog
        isOpen={isGmailDialogOpen}
        onOpenChange={setIsGmailDialogOpen}
        provider="gmail"
        onSuccess={() => {}}
      />
      
      <EmailConnectionDialog
        isOpen={isOutlookDialogOpen}
        onOpenChange={setIsOutlookDialogOpen}
        provider="outlook"
        onSuccess={() => {}}
      />
      
      <TwitterAuthDialog 
        isOpen={isTwitterDialogOpen}
        onOpenChange={setIsTwitterDialogOpen}
      />
    </div>
  );
};

export default IntegrationsTab;
