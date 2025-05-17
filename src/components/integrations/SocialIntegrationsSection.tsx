
import React from "react";
import { SocialPlatform } from "@/types/socialIntegration";
import { useSocialIntegrations } from "@/hooks/useSocialIntegrations";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import SocialPlatformCard from "./SocialPlatformCard";

interface SocialIntegrationsSectionProps {
  onConnectTwitter?: () => void;
}

const SocialIntegrationsSection: React.FC<SocialIntegrationsSectionProps> = ({ onConnectTwitter }) => {
  const {
    integrationStatus,
    isLoading,
    isSyncing,
    connectPlatform,
    disconnectPlatform,
    syncContacts,
  } = useSocialIntegrations();

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

  const platforms: SocialPlatform[] = ["twitter", "facebook", "linkedin", "instagram"];

  return (
    <div className="space-y-4">
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
