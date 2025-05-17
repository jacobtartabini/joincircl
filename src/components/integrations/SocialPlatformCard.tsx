
import React from "react";
import { SocialPlatform, SocialIntegrationStatus } from "@/types/socialIntegration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SocialPlatformCardProps {
  platform: SocialPlatform;
  status: SocialIntegrationStatus | undefined;
  isLoading: boolean;
  isSyncing: boolean;
  getPlatformIcon: (platform: string, size?: number) => React.ReactNode;
  onConnect: (platform: SocialPlatform) => void;
  onDisconnect: (platform: SocialPlatform) => void;
  onSync: (platform: SocialPlatform) => void;
}

const SocialPlatformCard: React.FC<SocialPlatformCardProps> = ({
  platform,
  status,
  isLoading,
  isSyncing,
  getPlatformIcon,
  onConnect,
  onDisconnect,
  onSync,
}) => {
  const isConnected = status?.connected || false;
  
  const formatLastSynced = (dateStr: string | undefined) => {
    if (!dateStr) return "Never";
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };
  
  const getCardDescription = () => {
    switch (platform) {
      case "twitter":
        return "Connect to Twitter/X to import contacts and view tweets";
      case "facebook":
        return "Import contacts and post summaries from Facebook";
      case "linkedin":
        return "Import professional connections from LinkedIn";
      case "instagram":
        return "Connect to view Instagram activity";
      default:
        return "";
    }
  };

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
          {getCardDescription()}
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
                    onClick={() => onSync(platform)}
                    disabled={isSyncing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
                    Sync Contacts
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onDisconnect(platform)}
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
                  onClick={() => onConnect(platform)}
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
};

export default SocialPlatformCard;
