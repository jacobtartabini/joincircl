
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
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchIntegrationStatus = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      // Check if user is logged in
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
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
      
      try {
        console.log("Fetching social integrations from database...");
        
        // Fetch social integrations
        const { data: socialIntegrations, error: socialError } = await supabase
          .from('user_social_integrations')
          .select('platform, username, last_synced, created_at');
        
        if (socialError) {
          console.error("Error fetching social integrations:", socialError);
          throw socialError;
        }
        
        // Fetch email integrations (Gmail)
        const { data: emailIntegrations, error: emailError } = await supabase
          .from('user_email_tokens')
          .select('provider, email, updated_at')
          .eq('provider', 'gmail');
          
        if (emailError) {
          console.error("Error fetching email integrations:", emailError);
          throw emailError;
        }
        
        // Fetch calendar integrations (Google Calendar)
        const { data: calendarIntegrations, error: calendarError } = await supabase
          .from('user_calendar_tokens')
          .select('provider, updated_at')
          .eq('provider', 'google');
          
        if (calendarError) {
          console.error("Error fetching calendar integrations:", calendarError);
          throw calendarError;
        }
        
        console.log("Received integration data:", {
          social: socialIntegrations,
          email: emailIntegrations, 
          calendar: calendarIntegrations
        });
        
        // Update with social platform integrations
        if (socialIntegrations && socialIntegrations.length > 0) {
          socialIntegrations.forEach((integration) => {
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
        }
        
        // Add Gmail as a connected platform if present
        // Ensure we have valid data before accessing properties
        if (emailIntegrations && !emailError && emailIntegrations.length > 0) {
          // Safely access the first integration
          const gmailIntegration = emailIntegrations[0];
          
          // Since the database schema might have changed, let's handle this defensively
          // TypeScript is reporting that these fields might not exist on the actual data
          const emailAddress = typeof gmailIntegration === 'object' && gmailIntegration !== null 
            ? (gmailIntegration.email as string || "Gmail User") 
            : "Gmail User";
            
          const lastUpdated = typeof gmailIntegration === 'object' && gmailIntegration !== null 
            ? (gmailIntegration.updated_at as string || new Date().toISOString()) 
            : new Date().toISOString();
          
          status.push({
            platform: 'gmail' as SocialPlatform,
            connected: true,
            username: emailAddress,
            last_synced: lastUpdated
          });
        }
        
        // Add Google Calendar as a connected platform if present
        if (calendarIntegrations && calendarIntegrations.length > 0) {
          const calendarIntegration = calendarIntegrations[0];
          const lastUpdated = typeof calendarIntegration === 'object' && calendarIntegration !== null 
            ? (calendarIntegration.updated_at as string || new Date().toISOString()) 
            : new Date().toISOString();
            
          status.push({
            platform: 'calendar' as SocialPlatform,
            connected: true,
            username: 'Google Calendar',
            last_synced: lastUpdated
          });
        }
        
        // Update the state with actual data
        setIntegrationStatus([...status]);
        
      } catch (dbError) {
        console.error("Database error:", dbError);
        setLoadError("Failed to load integration status. Please try again later.");
        
        // Still set the default statuses so the UI can render something
        setIntegrationStatus(status);
        
        // Don't show toast for every error - only show if there's genuinely an issue
        // and not just an empty result set
        if (!(dbError instanceof Error && dbError.message.includes("No rows returned"))) {
          toast({
            title: "Data Loading Error",
            description: "Could not load your social integrations.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error in fetchIntegrationStatus:", error);
      setLoadError("Failed to check integration status.");
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
    loadError, 
    refreshStatus: fetchIntegrationStatus 
  };
}
