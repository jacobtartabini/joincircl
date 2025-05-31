
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { googleService } from "@/services/googleService";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function UnifiedAuthCallbackHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('processing');
        
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const scope = searchParams.get('scope');
        const provider = searchParams.get('provider');

        // Handle OAuth errors first
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        // Determine the type of callback
        const isSupabaseAuth = !scope && !state;
        const isGoogleIntegration = scope && (scope.includes('gmail') || scope.includes('calendar'));
        const isTwitterIntegration = state && localStorage.getItem('twitter_auth_state') === state;

        if (isSupabaseAuth) {
          // Handle standard Supabase authentication
          setMessage('Completing sign in...');
          
          const { data, error: authError } = await supabase.auth.exchangeCodeForSession(window.location.href);
          
          if (authError) {
            throw authError;
          }

          if (data?.session) {
            setStatus('success');
            setMessage('Successfully signed in!');
            
            toast({
              title: "Welcome!",
              description: "Successfully signed in to your account.",
            });
            
            navigate("/", { replace: true });
          } else {
            throw new Error("No session established");
          }
        } else if (isGoogleIntegration) {
          // Handle Google service integration
          await handleGoogleIntegration(code!, scope!);
        } else if (isTwitterIntegration) {
          // Handle Twitter integration
          await handleTwitterIntegration(code!, state!);
        } else {
          throw new Error('Unknown callback type');
        }
        
      } catch (err) {
        console.error("Callback error:", err);
        const errorMessage = err instanceof Error ? err.message : "Authentication failed";
        
        setStatus('error');
        setMessage(errorMessage);
        
        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Redirect after error
        setTimeout(() => {
          navigate("/signin", { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, toast, searchParams]);

  const handleGoogleIntegration = async (code: string, scope: string) => {
    const isGmail = scope.includes('gmail');
    const serviceName = isGmail ? 'Gmail' : 'Google Calendar';
    
    setMessage(`Connecting to ${serviceName}...`);
    
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const tokenData = await googleService.exchangeCodeForToken(code, redirectUri, scope);
      
      if (!tokenData) {
        throw new Error('Failed to exchange authorization code for tokens');
      }

      setStatus('success');
      setMessage(`${serviceName} connected successfully!`);

      toast({
        title: "Success",
        description: `${serviceName} connected successfully`,
      });

      setTimeout(() => {
        navigate('/settings?tab=integrations');
      }, 2000);
    } catch (error) {
      throw new Error(`Failed to connect ${serviceName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleTwitterIntegration = async (code: string, state: string) => {
    setMessage('Connecting to Twitter...');
    
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

      setStatus('success');
      setMessage('Twitter account connected successfully!');

      toast({
        title: "Success",
        description: "Twitter account connected successfully",
      });

      setTimeout(() => {
        navigate('/settings?tab=integrations');
      }, 2000);
    } catch (error) {
      throw new Error(`Failed to connect Twitter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-6">
          {status === 'processing' && (
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          )}
          {status === 'success' && (
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
          )}
          {status === 'error' && (
            <XCircle className="h-12 w-12 text-red-600 mx-auto" />
          )}
        </div>
        
        <h2 className="text-xl font-semibold mb-4">
          {status === 'processing' && 'Processing Authentication'}
          {status === 'success' && 'Authentication Successful'}
          {status === 'error' && 'Authentication Failed'}
        </h2>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        {status === 'success' && (
          <p className="text-sm text-gray-500">
            Redirecting you...
          </p>
        )}
        
        {status === 'error' && (
          <p className="text-sm text-gray-500">
            Redirecting to sign in...
          </p>
        )}
      </div>
    </div>
  );
}
