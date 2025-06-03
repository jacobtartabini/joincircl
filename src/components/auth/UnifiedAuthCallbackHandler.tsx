
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { googleService } from "@/services/googleService";

export default function UnifiedAuthCallbackHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const scope = searchParams.get('scope');

        // Handle OAuth errors - silently redirect to home
        if (error) {
          console.warn(`OAuth error detected: ${error}, redirecting to home`);
          navigate("/", { replace: true });
          return;
        }

        // Determine the type of callback
        const isSupabaseAuth = !scope && !state;
        const isGoogleIntegration = scope && (scope.includes('gmail') || scope.includes('calendar'));
        const isTwitterIntegration = state && localStorage.getItem('twitter_auth_state') === state;

        if (isSupabaseAuth) {
          // Handle standard Supabase authentication with error resilience
          if (!code) {
            console.warn('No auth code found for Supabase auth, redirecting to home');
            navigate("/", { replace: true });
            return;
          }

          try {
            // Set a timeout for the auth exchange
            const authPromise = supabase.auth.exchangeCodeForSession(window.location.href);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Authentication timeout')), 15000)
            );

            const { data, error: authError } = await Promise.race([
              authPromise,
              timeoutPromise
            ]) as any;

            if (authError) {
              throw authError;
            }

            if (data?.session) {
              console.log('Supabase auth successful');
              navigate("/", { replace: true });
            } else {
              throw new Error("No session established");
            }
          } catch (authError) {
            console.warn('Supabase auth failed, cleaning up and redirecting:', authError);
            // Clean up any partial state
            try {
              await supabase.auth.signOut();
            } catch (cleanupError) {
              console.warn('Cleanup error:', cleanupError);
            }
            navigate("/", { replace: true });
          }
        } else if (isGoogleIntegration) {
          // Handle Google service integration
          await handleGoogleIntegration(code!, scope!);
        } else if (isTwitterIntegration) {
          // Handle Twitter integration
          await handleTwitterIntegration(code!, state!);
        } else {
          console.warn('Unknown callback type, redirecting to home');
          navigate("/", { replace: true });
        }
        
      } catch (err) {
        console.warn("Callback handler error, redirecting to home:", err);
        navigate("/", { replace: true });
      }
    };

    handleCallback();
  }, [navigate, searchParams, toast]);

  const handleGoogleIntegration = async (code: string, scope: string) => {
    const isGmail = scope.includes('gmail');
    const serviceName = isGmail ? 'Gmail' : 'Google Calendar';
    
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const tokenData = await googleService.exchangeCodeForToken(code, redirectUri, scope);
      
      if (!tokenData) {
        throw new Error('Failed to exchange authorization code for tokens');
      }

      toast({
        title: "Success",
        description: `${serviceName} connected successfully`,
      });

      setTimeout(() => {
        navigate('/settings?tab=integrations');
      }, 2000);
    } catch (error) {
      console.warn(`Failed to connect ${serviceName}, redirecting to home:`, error);
      navigate("/", { replace: true });
    }
  };

  const handleTwitterIntegration = async (code: string, state: string) => {
    try {
      const storedState = localStorage.getItem('twitter_auth_state');
      const codeVerifier = localStorage.getItem('twitter_code_verifier');

      if (!storedState || storedState !== state) {
        throw new Error('Invalid state parameter');
      }

      if (!codeVerifier) {
        throw new Error('Missing code verifier');
      }

      const { data, error } = await supabase.functions.invoke('twitter-oauth', {
        body: { code, codeVerifier }
      });

      if (error) {
        throw new Error(`Twitter OAuth error: ${error.message}`);
      }

      // Clean up localStorage
      localStorage.removeItem('twitter_auth_state');
      localStorage.removeItem('twitter_code_verifier');

      toast({
        title: "Success",
        description: "Twitter account connected successfully",
      });

      setTimeout(() => {
        navigate('/settings?tab=integrations');
      }, 2000);
    } catch (error) {
      console.warn('Failed to connect Twitter, redirecting to home:', error);
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
}
