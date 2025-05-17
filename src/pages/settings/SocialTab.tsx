
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSocialIntegrations } from "@/hooks/useSocialIntegrations";
import { SocialPlatform } from "@/types/socialIntegration";
import { Facebook, Twitter, Linkedin, Instagram, RefreshCw, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function SocialTab() {
  const {
    integrationStatus,
    isLoading,
    isSyncing,
    connectPlatform,
    disconnectPlatform,
    syncContacts,
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
        <h2 className="text-xl font-semibold mb-2">Social Media Integrations</h2>
        <p className="text-muted-foreground">
          Connect your social media accounts to import contacts and latest activity
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="facebook" className="flex items-center gap-2">
            <Facebook size={16} className="text-blue-600" />
            Facebook
          </TabsTrigger>
          <TabsTrigger value="twitter" className="flex items-center gap-2">
            <Twitter size={16} className="text-sky-500" />
            Twitter/X
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="flex items-center gap-2">
            <Linkedin size={16} className="text-blue-700" />
            LinkedIn
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex items-center gap-2">
            <Instagram size={16} className="text-pink-600" />
            Instagram
          </TabsTrigger>
        </TabsList>

        {["facebook", "twitter", "linkedin", "instagram"].map((platform) => {
          const status = integrationStatus.find(s => s.platform === platform);
          const isConnected = status?.connected || false;

          return (
            <TabsContent key={platform} value={platform}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(platform)}
                      <CardTitle className="capitalize">{platform}</CardTitle>
                    </div>
                    {isConnected && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {platform === "facebook" && "Import contacts and post summaries from Facebook"}
                    {platform === "twitter" && "Connect to Twitter/X to import contacts and view tweets"}
                    {platform === "linkedin" && "Import professional connections from LinkedIn"}
                    {platform === "instagram" && "Connect to view Instagram activity"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
            </TabsContent>
          );
        })}
      </Tabs>
      
      <Card className="mt-6">
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
