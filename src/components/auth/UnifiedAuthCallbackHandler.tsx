
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { googleService } from "@/services/googleService";

export default function UnifiedAuthCallbackHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Processing auth callback...');
        
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const scope = searchParams.get('scope');
        const type = searchParams.get('type'); // Magic link includes type=magiclink

        // Handle OAuth errors
        if (error) {
          console.warn(`OAuth error detected: ${error}`);
          toast({
            title: "Authentication Error",
            description: `Authentication failed: ${error}`,
            variant: "destructive",
          });
          navigate("/signin", { replace: true });
          return;
        }

        // Determine the type of callback
        const isMagicLink = type === 'magiclink' || searchParams.has('token_hash');
        const isSupabaseAuth = !scope && !state && !isMagicLink;
        const isGoogleIntegration = scope && (scope.includes('gmail') || scope.includes('calendar'));
        const isTwitterIntegration = state && localStorage.getItem('twitter_auth_state') === state;

        if (isMagicLink) {
          // Handle magic link authentication
          console.log('Processing magic link authentication...');
          
          try {
            // For magic links, Supabase automatically handles the session exchange
            // We just need to verify the session was established
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
              console.error('Magic link session error:', sessionError);
              toast({
                title: "Authentication Failed",
                description: "Failed to complete magic link sign in. Please try again.",
                variant: "destructive",
              });
              navigate("/signin", { replace: true });
              return;
            }

            if (session?.user) {
              console.log('Magic link authentication successful:', session.user.email);
              
              toast({
                title: "Welcome!",
                description: "You have been signed in successfully via magic link.",
              });

              // Navigate to home page after successful magic link authentication
              setTimeout(() => {
                navigate("/", { replace: true });
              }, 1000);
            } else {
              console.warn('No session found after magic link');
              toast({
                title: "Authentication Failed", 
                description: "Magic link authentication failed. Please try again.",
                variant: "destructive",
              });
              navigate("/signin", { replace: true });
            }
          } catch (magicLinkError) {
            console.error('Magic link callback error:', magicLinkError);
            toast({
              title: "Authentication Error",
              description: "Failed to complete magic link authentication. Please try again.",
              variant: "destructive",
            });
            navigate("/signin", { replace: true });
          }
        } else if (isSupabaseAuth) {
          // Handle standard Supabase authentication (OAuth providers like Google)
          if (!code) {
            console.warn('No auth code found for Supabase auth');
            navigate("/signin", { replace: true });
            return;
          }

          try {
            console.log('Processing Supabase OAuth callback...');
            
            const { data, error: authError } = await supabase.auth.exchangeCodeForSession(window.location.href);

            if (authError) {
              console.error('Auth exchange error:', authError);
              toast({
                title: "Authentication Failed",
                description: authError.message || "Failed to complete sign in",
                variant: "destructive",
              });
              navigate("/signin", { replace: true });
              return;
            }

            if (data?.session?.user) {
              console.log('OAuth authentication successful, user:', data.session.user.email);
              
              toast({
                title: "Welcome!",
                description: "You have been signed in successfully.",
              });

              // Navigate to home page after successful authentication
              setTimeout(() => {
                navigate("/", { replace: true });
              }, 1000);
            } else {
              console.warn('No session established after auth exchange');
              navigate("/signin", { replace: true });
            }
          } catch (authError) {
            console.error('Supabase auth callback error:', authError);
            toast({
              title: "Authentication Error",
              description: "Failed to complete authentication. Please try again.",
              variant: "destructive",
            });
            navigate("/signin", { replace: true });
          }
        } else if (isGoogleIntegration) {
          // Handle Google service integration
          await handleGoogleIntegration(code!, scope!);
        } else if (isTwitterIntegration) {
          // Handle Twitter integration
          await handleTwitterIntegration(code!, state!);
        } else {
          console.warn('Unknown callback type');
          navigate("/signin", { replace: true });
        }
        
      } catch (err) {
        console.error("Callback handler error:", err);
        toast({
          title: "Error",
          description: "An unexpected error occurred during authentication.",
          variant: "destructive",
        });
        navigate("/signin", { replace: true });
      } finally {
        setIsProcessing(false);
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
      console.error(`Failed to connect ${serviceName}:`, error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect ${serviceName}. Please try again.`,
        variant: "destructive",
      });
      navigate("/settings?tab=integrations", { replace: true });
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
      console.error('Failed to connect Twitter:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect Twitter. Please try again.",
        variant: "destructive",
      });
      navigate("/settings?tab=integrations", { replace: true });
    }
  };

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing your sign in...</p>
        </div>
      </div>
    );
  }

  return null;
}
