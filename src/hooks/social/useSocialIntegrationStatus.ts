
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SocialPlatform, SocialIntegrationStatus } from '@/types/socialIntegration';

export function useSocialIntegrationStatus() {
  const { toast } = useToast();
  const [integrationStatus, setIntegrationStatus] = useState<SocialIntegrationStatus[]>([
    { platform: "twitter", connected: false },
    { platform: "facebook", connected: false },
    { platform: "linkedin", connected: false },
    { platform: "instagram", connected: false }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIntegrationStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is logged in
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.log("No session found, user not logged in");
        setIsLoading(false);
        return;
      }

      // Define initial status for all platforms - we set this early to prevent UI flickering
      let status: SocialIntegrationStatus[] = [
        { platform: "twitter", connected: false },
        { platform: "facebook", connected: false },
        { platform: "linkedin", connected: false },
        { platform: "instagram", connected: false }
      ];
      
      // Get actual integration status from the database
      try {
        console.log("Fetching social integrations from database...");
        const { data: integrations, error } = await supabase
          .from('user_social_integrations')
          .select('platform, username, last_synced, created_at');
        
        if (error) {
          console.error("Error fetching integrations:", error);
          toast({
            title: "Data Loading Error",
            description: "Could not load your social integrations.",
            variant: "destructive",
          });
          throw error;
        } else {
          console.log("Received integration data:", integrations);
          
          if (integrations && integrations.length > 0) {
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
          } else {
            console.log("No social integrations found in database");
          }
          
          // Update the state with actual data
          setIntegrationStatus([...status]);
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
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

  // Load integration statuses on mount
  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  return { 
    integrationStatus, 
    isLoading, 
    refreshStatus: fetchIntegrationStatus 
  };
}
