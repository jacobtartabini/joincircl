
import React, { useEffect } from "react";
import { SocialPlatform } from "@/types/socialIntegration";
import { useSocialIntegrations } from "@/hooks/useSocialIntegrations";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Facebook, Twitter, Instagram, Linkedin, AlertTriangle, Loader2, Mail, Calendar, RefreshCw } from "lucide-react";
import SocialPlatformCard from "./SocialPlatformCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
        return <Mail size={size} className="text-red-500" />;
      case "calendar":
        return <Calendar size={size} className="text-amber-500" />;
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

  const handleRefresh = () => {
    refreshStatus();
  };

  // Only show main social platforms in this component
  const platforms: SocialPlatform[] = ["twitter", "facebook", "linkedin", "instagram"];

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
          <div className="ml-2">
            <AlertDescription className="flex justify-between items-center">
              <span>{loadError}</span>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-4">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Retry
              </Button>
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
      
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
