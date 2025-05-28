
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { googleService } from '@/services/googleService';

const CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const scope = searchParams.get('scope');

        // Handle OAuth errors
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Determine the provider based on state or other parameters
        const isTwitterCallback = state && localStorage.getItem('twitter_auth_state') === state;
        const isGoogleCallback = scope && (scope.includes('gmail') || scope.includes('calendar'));

        if (isTwitterCallback) {
          await handleTwitterCallback(code, state);
        } else if (isGoogleCallback) {
          await handleGoogleCallback(code, scope);
        } else {
          throw new Error('Unknown OAuth provider');
        }

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
        
        toast({
          title: "Authentication Failed",
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          variant: "destructive",
        });

        // Redirect after error
        setTimeout(() => {
          navigate('/settings?tab=integrations');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  const handleTwitterCallback = async (code: string, state: string) => {
    const storedState = localStorage.getItem('twitter_auth_state');
    const codeVerifier = localStorage.getItem('twitter_code_verifier');

    if (!storedState || storedState !== state) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    if (!codeVerifier) {
      throw new Error('Missing code verifier');
    }

    setMessage('Exchanging Twitter authorization code...');

    // Call our edge function to complete the OAuth flow
    const { data, error } = await supabase.functions.invoke('twitter-oauth', {
      body: {
        code,
        codeVerifier
      }
    });

    if (error) {
      throw new Error(`Twitter OAuth error: ${error.message}`);
    }

    // Clean up localStorage
    localStorage.removeItem('twitter_auth_state');
    localStorage.removeItem('twitter_code_verifier');
    localStorage.setItem('twitter_auth_success', 'true');

    setStatus('success');
    setMessage('Twitter account connected successfully!');

    toast({
      title: "Success",
      description: "Twitter account connected successfully",
    });

    // Redirect to settings
    setTimeout(() => {
      window.close(); // Close popup window
    }, 2000);
  };

  const handleGoogleCallback = async (code: string, scope: string) => {
    const isGmail = scope.includes('gmail');
    const isCalendar = scope.includes('calendar');
    
    setMessage(`Connecting to ${isGmail ? 'Gmail' : 'Google Calendar'}...`);

    const redirectUri = 'https://app.joincircl.com/auth/callback/google';
    
    // Exchange code for token using Google service
    const tokenData = await googleService.exchangeCodeForToken(code, redirectUri, scope);
    
    if (!tokenData) {
      throw new Error('Failed to exchange authorization code for tokens');
    }

    setStatus('success');
    setMessage(`${isGmail ? 'Gmail' : 'Google Calendar'} connected successfully!`);

    toast({
      title: "Success",
      description: `${isGmail ? 'Gmail' : 'Google Calendar'} connected successfully`,
    });

    // Redirect to settings
    setTimeout(() => {
      navigate('/settings?tab=integrations');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
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
            {status === 'processing' && 'Connecting Account'}
            {status === 'success' && 'Connection Successful'}
            {status === 'error' && 'Connection Failed'}
          </h2>
          
          <p className="text-gray-600 mb-6">{message}</p>
          
          {status === 'success' && (
            <p className="text-sm text-gray-500">
              Redirecting you back to settings...
            </p>
          )}
          
          {status === 'error' && (
            <p className="text-sm text-gray-500">
              You will be redirected to settings in a few seconds.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallbackPage;
