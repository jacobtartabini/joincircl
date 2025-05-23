
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
    { platform: "instagram", connected: false },
    { platform: "gmail", connected: false },
    { platform: "calendar", connected: false }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchIntegrationStatus = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      // Check if user is logged in
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        setLoadError("Authentication error: " + sessionError.message);
        setIsLoading(false);
        return;
      }
      
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
        { platform: "instagram", connected: false },
        { platform: "gmail", connected: false },
        { platform: "calendar", connected: false }
      ];
      
      // Fetch social integrations with better error handling
      try {
        console.log("Fetching social integrations from database...");
        
        // Fetch social integrations
        const { data: socialIntegrations, error: socialError } = await supabase
          .from('user_social_integrations')
          .select('platform, username, last_synced, created_at');
        
        if (socialError) {
          console.error("Error fetching social integrations:", socialError);
          // Continue with the other fetches instead of throwing
        } else if (socialIntegrations) {
          console.log("Social integrations data received:", socialIntegrations);
          
          // Update with social platform integrations
          socialIntegrations.forEach((integration) => {
            const platformIndex = status.findIndex(s => s.platform === integration.platform);
            if (platformIndex >= 0) {
              status[platformIndex] = {
                platform: integration.platform as SocialPlatform,
                connected: true,
                username: integration.username,
                last_synced: integration.last_synced || integration.created_at
              };
            } else {
              // If the platform is not in our initial list, add it
              status.push({
                platform: integration.platform as SocialPlatform,
                connected: true,
                username: integration.username,
                last_synced: integration.last_synced || integration.created_at
              });
            }
          });
        }
        
        // Fetch email integrations (Gmail) - handle independently
        const { data: emailIntegrations, error: emailError } = await supabase
          .from('user_email_tokens')
          .select('provider, email, updated_at')
          .eq('provider', 'gmail');
          
        if (emailError) {
          console.error("Error fetching email integrations:", emailError);
        } else if (emailIntegrations && emailIntegrations.length > 0) {
          // Find or add Gmail to status
          const gmailIndex = status.findIndex(s => s.platform === 'gmail');
          if (gmailIndex >= 0) {
            status[gmailIndex] = {
              platform: 'gmail' as SocialPlatform,
              connected: true,
              username: emailIntegrations[0].email || "Gmail User",
              last_synced: emailIntegrations[0].updated_at || new Date().toISOString()
            };
          } else {
            status.push({
              platform: 'gmail' as SocialPlatform,
              connected: true,
              username: emailIntegrations[0].email || "Gmail User",
              last_synced: emailIntegrations[0].updated_at || new Date().toISOString()
            });
          }
        }
        
        // Fetch calendar integrations (Google Calendar) - handle independently
        const { data: calendarIntegrations, error: calendarError } = await supabase
          .from('user_calendar_tokens')
          .select('provider, updated_at')
          .eq('provider', 'google');
          
        if (calendarError) {
          console.error("Error fetching calendar integrations:", calendarError);
        } else if (calendarIntegrations && calendarIntegrations.length > 0) {
          // Find or add Calendar to status
          const calendarIndex = status.findIndex(s => s.platform === 'calendar');
          if (calendarIndex >= 0) {
            status[calendarIndex] = {
              platform: 'calendar' as SocialPlatform,
              connected: true,
              username: 'Google Calendar',
              last_synced: calendarIntegrations[0].updated_at || new Date().toISOString()
            };
          } else {
            status.push({
              platform: 'calendar' as SocialPlatform,
              connected: true,
              username: 'Google Calendar',
              last_synced: calendarIntegrations[0].updated_at || new Date().toISOString()
            });
          }
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
      
      // Retry logic for transient errors
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying fetch attempt ${retryCount + 1} of ${MAX_RETRIES}...`);
        setRetryCount(prev => prev + 1);
        // Retry with exponential backoff
        setTimeout(() => {
          fetchIntegrationStatus();
        }, Math.pow(2, retryCount) * 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load integration statuses on mount and when retry count changes
  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  // Allow manual refresh
  const refreshStatus = async () => {
    setRetryCount(0); // Reset retry count on manual refresh
    return fetchIntegrationStatus();
  };

  return { 
    integrationStatus, 
    isLoading,
    loadError, 
    refreshStatus 
  };
}
