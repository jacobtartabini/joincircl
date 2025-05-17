
import React, { useEffect } from "react";
import { SocialPlatform } from "@/types/socialIntegration";
import { useSocialIntegrations } from "@/hooks/useSocialIntegrations";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Facebook, Twitter, Instagram, Linkedin, AlertTriangle, Loader2 } from "lucide-react";
import SocialPlatformCard from "./SocialPlatformCard";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SocialIntegrationsSectionProps {
  onConnectTwitter?: () => void;
}

const SocialIntegrationsSection: React.FC<SocialIntegrationsSectionProps> = ({ onConnectTwitter }) => {
  const {
    integrationStatus,
    isLoading,
    loadError,
    isSyncing,
    connectPlatform,
    disconnectPlatform,
    syncContacts,
    refreshStatus
  } = useSocialIntegrations();

  // Refresh integration status when component mounts
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

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
      case "gmail":
        return <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Gmail" className="h-5 w-5" />;
      case "calendar":
        return <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const handleConnect = (platform: SocialPlatform) => {
    if (platform === 'twitter' && onConnectTwitter) {
      onConnectTwitter();
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

  // Only show main social platforms in this component
  const platforms: SocialPlatform[] = ["twitter", "facebook", "linkedin", "instagram"];

  // Check if we have any connected platforms
  const hasConnectedPlatforms = integrationStatus.some(status => status.connected);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading integration status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Show error if present */}
      {loadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      {/* No connected platforms message */}
      {!isLoading && !hasConnectedPlatforms && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You need to connect at least one social platform to see your integrations.
          </AlertDescription>
        </Alert>
      )}

      {platforms.map((platform) => {
        const status = integrationStatus.find(s => s.platform === platform);
        
        return (
          <SocialPlatformCard
            key={platform}
            platform={platform}
            status={status}
            isLoading={isLoading}
            isSyncing={isSyncing}
            getPlatformIcon={getPlatformIcon}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onSync={handleSync}
          />
        );
      })}
      
      {/* Info card */}
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
    </div>
  );
};

export default SocialIntegrationsSection;
