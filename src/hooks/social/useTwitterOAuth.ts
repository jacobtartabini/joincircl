
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useTwitterOAuth(refreshCallback: () => Promise<void>) {
  const { toast } = useToast();

  useEffect(() => {
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
              await refreshCallback();
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
  }, [toast, refreshCallback]);
}
