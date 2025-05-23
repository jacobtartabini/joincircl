
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSocialIntegrations } from "@/hooks/useSocialIntegrations";
import { SocialPlatform } from "@/types/socialIntegration";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  RefreshCw, 
  AlertTriangle, 
  Mail, 
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function SocialTab() {
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

  const [activeTab, setActiveTab] = useState<string>("facebook");

  const handleConnect = (platform: SocialPlatform) => {
    connectPlatform(platform);
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

  const formatLastSynced = (dateStr: string | undefined) => {
    if (!dateStr) return "Never";
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-full mt-1" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-28 mt-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 rounded-lg border border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-500 h-5 w-5 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Error Loading Integrations</h3>
            <p className="text-sm text-red-700 mt-1">{loadError}</p>
            <div className="flex justify-end mt-3">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced interface with better layout and modularity
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Social Media Integrations</h2>
          <p className="text-muted-foreground mt-1">
            Connect your accounts to sync contacts and activity
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading ? "animate-spin" : "")} />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Social Media Integrations */}
        {["twitter", "facebook", "linkedin", "instagram", "gmail", "calendar"].map((platform: string) => {
          const status = integrationStatus.find(s => s.platform === platform as SocialPlatform);
          const isConnected = status?.connected || false;
          
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
                  {platform === "twitter" && "Import contacts and view tweets"}
                  {platform === "facebook" && "Connect with Facebook friends and pages"}
                  {platform === "linkedin" && "Import professional connections"}
                  {platform === "instagram" && "View Instagram activity"}
                  {platform === "gmail" && "Sync contacts from your emails"}
                  {platform === "calendar" && "Connect with your calendar events"}
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
                      onClick={() => handleDisconnect(platform as SocialPlatform)}
                    >
                      Disconnect
                    </Button>
                    <Button 
                      variant="default"
                      size="sm"
                      onClick={() => handleSync(platform as SocialPlatform)}
                      disabled={isSyncing}
                    >
                      <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isSyncing ? "animate-spin" : "")} />
                      Sync
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm"
                    onClick={() => handleConnect(platform as SocialPlatform)}
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
        })}
      </div>
      
      <Card className="mt-8">
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
}
