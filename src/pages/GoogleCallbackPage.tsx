
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { googleService } from '@/services/googleService';

const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing Google authentication...');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const scope = searchParams.get('scope');

        // Handle OAuth errors
        if (error) {
          throw new Error(`Google OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Google');
        }

        if (!scope) {
          throw new Error('No scope information received');
        }

        // Determine which Google service based on scope
        const isGmail = scope.includes('gmail');
        const isCalendar = scope.includes('calendar');
        const serviceName = isGmail ? 'Gmail' : isCalendar ? 'Google Calendar' : 'Google';

        setMessage(`Connecting to ${serviceName}...`);

        // Validate state if it exists
        if (state) {
          const [provider, storedState] = state.split('_');
          const expectedState = localStorage.getItem(`google_${provider}_state`);
          
          if (expectedState && storedState !== expectedState) {
            throw new Error('Invalid state parameter - possible CSRF attack');
          }
          
          // Clean up stored state
          localStorage.removeItem(`google_${provider}_state`);
        }

        // Use fixed production redirect URI
        const redirectUri = 'https://app.joincircl.com/auth/callback/google';
        
        // Exchange code for token using Google service
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

        // Redirect to settings after a short delay
        setTimeout(() => {
          navigate('/settings?tab=integrations');
        }, 2000);

      } catch (error) {
        console.error('Google OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Google authentication failed');
        
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

    handleGoogleCallback();
  }, [searchParams, navigate, toast]);

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
            {status === 'processing' && 'Connecting Google Account'}
            {status === 'success' && 'Google Connection Successful'}
            {status === 'error' && 'Google Connection Failed'}
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

export default GoogleCallbackPage;
