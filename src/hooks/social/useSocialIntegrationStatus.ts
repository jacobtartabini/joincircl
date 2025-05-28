
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

  const fetchIntegrationStatus = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      console.log("Fetching integration status from database...");
      
      // Check if user is logged in first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn("Session error:", sessionError);
        // Don't treat this as a critical error - user might not be logged in
        setIsLoading(false);
        return;
      }
      
      if (!sessionData?.session) {
        console.log("No active session found");
        setIsLoading(false);
        return;
      }

      // Initialize status with defaults
      let status: SocialIntegrationStatus[] = [
        { platform: "twitter", connected: false },
        { platform: "facebook", connected: false },
        { platform: "linkedin", connected: false },
        { platform: "instagram", connected: false },
        { platform: "gmail", connected: false },
        { platform: "calendar", connected: false }
      ];
      
      try {
        console.log("Attempting to fetch social integrations...");
        
        // Use timeout to prevent hanging requests
        const fetchWithTimeout = (promise: Promise<any>, timeout: number) => {
          return Promise.race([
            promise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
          ]);
        };

        // Fetch social integrations with timeout
        const socialQuery = supabase
          .from('user_social_integrations')
          .select('platform, username, last_synced, created_at');
          
        const { data: socialIntegrations, error: socialError } = await fetchWithTimeout(
          socialQuery,
          10000 // 10 second timeout
        ) as any;
        
        if (socialError) {
          console.warn("Social integrations query failed:", socialError);
          // Continue with other queries instead of failing completely
        } else if (socialIntegrations && Array.isArray(socialIntegrations)) {
          console.log("Successfully fetched social integrations:", socialIntegrations);
          
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
        
        // Fetch email integrations with timeout
        const emailQuery = supabase
          .from('user_email_tokens')
          .select('provider, updated_at')
          .eq('provider', 'gmail');
          
        const { data: emailIntegrations, error: emailError } = await fetchWithTimeout(
          emailQuery,
          10000
        ) as any;
          
        if (emailError) {
          console.warn("Email integrations query failed:", emailError);
        } else if (emailIntegrations && emailIntegrations.length > 0) {
          const gmailIndex = status.findIndex(s => s.platform === 'gmail');
          if (gmailIndex >= 0) {
            status[gmailIndex] = {
              platform: 'gmail' as SocialPlatform,
              connected: true,
              username: 'Gmail User',
              last_synced: emailIntegrations[0].updated_at || new Date().toISOString()
            };
          }
        }
        
        // Fetch calendar integrations with timeout
        const calendarQuery = supabase
          .from('user_calendar_tokens')
          .select('provider, updated_at')
          .eq('provider', 'google');
          
        const { data: calendarIntegrations, error: calendarError } = await fetchWithTimeout(
          calendarQuery,
          10000
        ) as any;
          
        if (calendarError) {
          console.warn("Calendar integrations query failed:", calendarError);
        } else if (calendarIntegrations && calendarIntegrations.length > 0) {
          const calendarIndex = status.findIndex(s => s.platform === 'calendar');
          if (calendarIndex >= 0) {
            status[calendarIndex] = {
              platform: 'calendar' as SocialPlatform,
              connected: true,
              username: 'Google Calendar',
              last_synced: calendarIntegrations[0].updated_at || new Date().toISOString()
            };
          }
        }
        
        // Update state with collected data
        setIntegrationStatus([...status]);
        console.log("Integration status updated successfully:", status);
        
      } catch (dbError: any) {
        console.warn("Database query failed, using fallback:", dbError);
        
        // Set fallback status and show non-blocking warning
        setIntegrationStatus(status);
        setLoadError("Could not load all integration data");
        
        // Only show toast for unexpected errors, not network issues
        if (!dbError.message?.includes('fetch') && !dbError.message?.includes('timeout')) {
          toast({
            title: "Data Loading Warning",
            description: "Some integration data may not be current",
            variant: "default",
          });
        }
      }
    } catch (error: any) {
      console.warn("Error in fetchIntegrationStatus:", error);
      setLoadError("Failed to check integration status");
      
      // Set minimal fallback state so UI can still render
      setIntegrationStatus([
        { platform: "twitter", connected: false },
        { platform: "facebook", connected: false },
        { platform: "linkedin", connected: false },
        { platform: "instagram", connected: false },
        { platform: "gmail", connected: false },
        { platform: "calendar", connected: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load integration statuses on mount
  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  // Allow manual refresh
  const refreshStatus = async () => {
    console.log("Manual refresh requested");
    return fetchIntegrationStatus();
  };

  return { 
    integrationStatus, 
    isLoading,
    loadError, 
    refreshStatus 
  };
}
