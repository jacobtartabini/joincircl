
import React from "react";
import { SocialPlatform, SocialIntegrationStatus } from "@/types/socialIntegration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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
  // Default to not connected if status is undefined
  const isConnected = status?.connected || false;
  
  const formatLastSynced = (dateStr: string | undefined) => {
    if (!dateStr) return "Never";
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Unknown";
    }
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
      case "gmail":
        return "Connect Gmail to sync contacts from your emails";
      case "calendar":
        return "Sync Google Calendar events with your contacts";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-60" />
            <Skeleton className="h-10 w-32 mt-4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card key={platform} className="overflow-hidden border-solid">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getPlatformIcon(platform)}
            <CardTitle className="capitalize">{platform}</CardTitle>
          </div>
          
          {isConnected ? (
            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-500">
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Not Connected
            </Badge>
          )}
        </div>
        
        <CardDescription className="mt-2">
          {getCardDescription()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3">
        {isConnected ? (
          <div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Username:</span>
                <p className="font-medium">{status?.username || "N/A"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last synced:</span>
                <p className="font-medium">{formatLastSynced(status?.last_synced)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {(platform === "linkedin" || platform === "instagram") && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start gap-2 mb-4">
                <AlertTriangle className="text-amber-500 h-5 w-5 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Limited Availability
                  </p>
                  <p className="text-sm text-amber-700">
                    {platform === "linkedin" 
                      ? "Available with Business tier subscriptions only."
                      : "Currently in beta testing."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-4 flex justify-end gap-2">
        {isConnected ? (
          <>
            <Button
              variant="outline" 
              size="sm"
              onClick={() => onDisconnect(platform)}
            >
              Disconnect
            </Button>
            <Button 
              variant="default"
              size="sm"
              onClick={() => onSync(platform)}
              disabled={isSyncing}
            >
              <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isSyncing ? "animate-spin" : "")} />
              Sync
            </Button>
          </>
        ) : (
          <Button 
            size="sm"
            onClick={() => onConnect(platform)}
            disabled={platform === "linkedin" || platform === "instagram"}
            className={platform === "linkedin" || platform === "instagram" ? "opacity-50" : ""}
          >
            {getPlatformIcon(platform, 16)}
            <span className="ml-1.5">Connect</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SocialPlatformCard;
