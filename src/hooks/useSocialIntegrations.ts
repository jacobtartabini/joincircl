import { useState, useEffect } from 'react';
import { socialIntegrationService } from '@/services/socialIntegrationService';
import { SocialPlatform, SocialIntegrationStatus, SocialSyncResult } from '@/types/socialIntegration';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useSocialIntegrations() {
  const { toast } = useToast();
  const [integrationStatus, setIntegrationStatus] = useState<SocialIntegrationStatus[]>([
    { platform: "twitter", connected: false },
    { platform: "facebook", connected: false },
    { platform: "linkedin", connected: false },
    { platform: "instagram", connected: false }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SocialSyncResult | null>(null);

  // Load integration statuses on mount
  useEffect(() => {
    fetchIntegrationStatus();
    
    // Check for Twitter OAuth callback
    const handleTwitterCallback = async () => {
      if (window.location.pathname === "/auth/callback" && window.location.search.includes("code=")) {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const savedState = localStorage.getItem("twitter_auth_state");
        const codeVerifier = localStorage.getItem("twitter_code_verifier");
        
        if (code && state && state === savedState && codeVerifier) {
          // Clear the saved state and code verifier
          localStorage.removeItem("twitter_auth_state");
          localStorage.removeItem("twitter_code_verifier");
          
          try {
            // Call the Twitter OAuth edge function to exchange code for token
            const { data, error } = await supabase.functions.invoke('twitter-oauth', {
              body: { code, codeVerifier }
            });
            
            if (error) {
              throw new Error(`Edge function error: ${error.message}`);
            }
            
            if (data && data.success) {
              toast({
                title: "Twitter Connected",
                description: `Successfully connected as @${data.profile.username}`,
              });
              
              // Update the integration status
              fetchIntegrationStatus();
            } else {
              throw new Error("Failed to connect Twitter account");
            }
          } catch (error) {
            console.error("Error processing Twitter callback:", error);
            toast({
              title: "Connection Failed",
              description: "Could not complete the Twitter connection",
              variant: "destructive",
            });
          }
        }
      }
    };
    
    handleTwitterCallback();
  }, [toast]);

  const fetchIntegrationStatus = async () => {
    try {
      setIsLoading(true);
      
      // Define initial status for all platforms - we set this early to prevent UI flickering
      let status: SocialIntegrationStatus[] = [
        { platform: "twitter", connected: false },
        { platform: "facebook", connected: false },
        { platform: "linkedin", connected: false },
        { platform: "instagram", connected: false }
      ];
      
      setIntegrationStatus(status); // Set default status right away to prevent flickering
      
      // Get actual integration status from the database
      try {
        const { data: integrations, error } = await supabase
          .from('user_social_integrations')
          .select('platform, username, last_synced, created_at');
        
        if (error) {
          console.error("Error fetching integrations:", error);
        } else if (integrations && integrations.length > 0) {
          // Update with actual connected platforms
          integrations.forEach((integration) => {
            const platformIndex = status.findIndex(s => s.platform === integration.platform);
            if (platformIndex >= 0) {
              status[platformIndex] = {
                platform: integration.platform as SocialPlatform,
                connected: true,
                username: integration.username,
                last_synced: integration.last_synced || integration.created_at
              };
            }
          });
          
          // Update the state with actual data
          setIntegrationStatus([...status]);
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Even if there's a DB error, we'll keep the default status set above
      }
    } catch (error) {
      console.error("Error in fetchIntegrationStatus:", error);
      toast({
        title: "Error",
        description: "Failed to load social integration status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectPlatform = async (platform: SocialPlatform) => {
    try {
      // In a real implementation, this would redirect to OAuth flow
      const result = await socialIntegrationService.connectSocialPlatform(platform);
      
      if (result.connected) {
        toast({
          title: "Connected",
          description: `Successfully connected to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        });
        
        // Update the status in state
        setIntegrationStatus(prev => 
          prev.map(s => s.platform === platform ? result : s)
        );
      } else {
        toast({
          title: "Connection Failed",
          description: result.error || `Could not connect to ${platform}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      toast({
        title: "Connection Error",
        description: `Failed to connect to ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const disconnectPlatform = async (platform: SocialPlatform) => {
    try {
      await socialIntegrationService.disconnectSocialPlatform(platform);
      
      toast({
        title: "Disconnected",
        description: `Successfully disconnected from ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
      });
      
      // Update the status in state
      setIntegrationStatus(prev => 
        prev.map(s => s.platform === platform ? { ...s, connected: false, username: undefined, last_synced: undefined } : s)
      );
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
      toast({
        title: "Disconnection Error",
        description: `Failed to disconnect from ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const syncContacts = async (platform: SocialPlatform) => {
    try {
      setIsSyncing(true);
      setSyncResults(null);
      
      const result = await socialIntegrationService.syncContactsFromPlatform(platform);
      setSyncResults(result);
      
      if (result.errors.length === 0) {
        toast({
          title: "Sync Complete",
          description: `Imported ${result.contacts_imported} contacts from ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        });
        
        // Refresh the integration status
        await fetchIntegrationStatus();
      } else {
        toast({
          title: "Sync Completed with Errors",
          description: `Some errors occurred during sync: ${result.errors.join(', ')}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error syncing contacts from ${platform}:`, error);
      toast({
        title: "Sync Error",
        description: `Failed to sync contacts from ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    integrationStatus,
    isLoading,
    isSyncing,
    syncResults,
    connectPlatform,
    disconnectPlatform,
    syncContacts,
    refreshStatus: fetchIntegrationStatus
  };
}
