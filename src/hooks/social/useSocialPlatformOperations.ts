
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { socialIntegrationService } from '@/services/socialIntegrationService';
import { SocialPlatform, SocialSyncResult } from '@/types/socialIntegration';

export function useSocialPlatformOperations(refreshCallback: () => Promise<void>) {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SocialSyncResult | null>(null);

  const connectPlatform = async (platform: SocialPlatform) => {
    try {
      // In a real implementation, this would redirect to OAuth flow
      const result = await socialIntegrationService.connectSocialPlatform(platform);
      
      if (result.connected) {
        toast({
          title: "Connected",
          description: `Successfully connected to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        });
        
        // Refresh the integration status
        await refreshCallback();
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
      
      // Refresh the integration status
      await refreshCallback();
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
        await refreshCallback();
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
    isSyncing,
    syncResults,
    connectPlatform,
    disconnectPlatform,
    syncContacts
  };
}
