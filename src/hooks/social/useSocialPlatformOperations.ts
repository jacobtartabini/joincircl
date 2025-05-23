
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SocialPlatform, SocialSyncResult } from '@/types/socialIntegration';

export function useSocialPlatformOperations(refreshCallback: () => Promise<void>) {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SocialSyncResult | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);

  const connectPlatform = async (platform: SocialPlatform) => {
    try {
      setConnectingPlatform(platform);
      // Check if user is logged in
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to connect social accounts.",
          variant: "destructive",
        });
        return;
      }
      
      // Handle different platform connections
      if (platform === 'twitter') {
        // Twitter is handled by the TwitterAuthDialog component
        // which opens an OAuth flow in a new window
        return;
      }
      
      if (platform === 'gmail' || platform === 'calendar') {
        // These are handled in separate components
        toast({
          title: "Integration Available",
          description: `Please use the ${platform.charAt(0).toUpperCase() + platform.slice(1)} tab to connect this service.`,
        });
        return;
      }
      
      // For other platforms, use the social integration service
      // In a real implementation, this would redirect to OAuth flow for other platforms
      toast({
        title: "Coming Soon",
        description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} integration is coming soon.`,
      });
      
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      toast({
        title: "Connection Error",
        description: `Failed to connect to ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const disconnectPlatform = async (platform: SocialPlatform) => {
    try {
      // Check if user is logged in
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to disconnect social accounts.",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('user_social_integrations')
        .delete()
        .eq('platform', platform)
        .eq('user_id', sessionData.session.user.id);
      
      if (error) {
        throw error;
      }
      
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
      // Check if user is logged in
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to sync contacts.",
          variant: "destructive",
        });
        return;
      }
      
      setIsSyncing(true);
      setSyncResults(null);
      
      // In a real implementation, we would call an edge function to sync contacts
      // For this demo, we'll just simulate a successful sync
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result: SocialSyncResult = {
        contacts_imported: Math.floor(Math.random() * 5) + 1,
        contacts_updated: Math.floor(Math.random() * 3),
        posts_fetched: platform === 'twitter' ? Math.floor(Math.random() * 10) + 5 : 0,
        errors: []
      };
      
      setSyncResults(result);
      
      // Update last_synced timestamp in the database
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('user_social_integrations')
        .update({ last_synced: now, updated_at: now })
        .eq('platform', platform)
        .eq('user_id', sessionData.session.user.id);
      
      if (error) {
        console.error("Error updating last_synced:", error);
        throw error;
      }
      
      toast({
        title: "Sync Complete",
        description: `Imported ${result.contacts_imported} contacts from ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
      });
      
      // Refresh the integration status
      await refreshCallback();
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
    connectingPlatform,
    connectPlatform,
    disconnectPlatform,
    syncContacts
  };
}
