
import { useState, useEffect } from 'react';
import { socialIntegrationService } from '@/services/socialIntegrationService';
import { SocialPlatform, SocialIntegrationStatus, SocialSyncResult } from '@/types/socialIntegration';
import { useToast } from '@/hooks/use-toast';

export function useSocialIntegrations() {
  const { toast } = useToast();
  const [integrationStatus, setIntegrationStatus] = useState<SocialIntegrationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SocialSyncResult | null>(null);

  // Load integration statuses on mount
  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  const fetchIntegrationStatus = async () => {
    try {
      setIsLoading(true);
      const status = await socialIntegrationService.getUserSocialIntegrations();
      setIntegrationStatus(status);
    } catch (error) {
      console.error("Error fetching social integration status:", error);
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
      // For demo purposes, we're simulating a successful connection
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
