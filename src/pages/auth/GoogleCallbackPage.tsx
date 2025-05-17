
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { GMAIL_SCOPE, CALENDAR_SCOPE, googleService } from "@/services/googleService";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Process Google OAuth callback
  useEffect(() => {
    const processCallback = async () => {
      setProcessing(true);
      setError(null);

      try {
        // Get the authorization code from URL
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        // Check for errors from OAuth provider
        if (errorParam) {
          console.error(`OAuth error: ${errorParam} - ${errorDescription}`);
          
          // Handle specific error types with user-friendly messages
          if (errorParam === 'redirect_uri_mismatch') {
            setError("Authentication failed: The redirect URI doesn't match what's configured in the Google Cloud Console. Please contact support.");
            toast({
              title: "Connection Failed",
              description: "The redirect URI doesn't match what's configured in Google Cloud Console.",
              variant: "destructive",
            });
          } else {
            setError(`Authentication error: ${errorDescription || errorParam}`);
            toast({
              title: "Authentication Failed",
              description: errorDescription || "Could not complete authentication",
              variant: "destructive",
            });
          }
          return;
        }

        if (!code) {
          console.error("No code found in URL parameters");
          setError("Authentication failed: No authorization code received");
          return;
        }

        if (!state) {
          console.error("No state found in URL parameters");
          setError("Authentication failed: No state parameter received");
          return;
        }

        // Determine which service (Gmail or Calendar) based on state
        let scope = '';
        let providerType = '';
        let stateValue = '';

        if (state.includes("_")) {
          [providerType, stateValue] = state.split("_");
          
          // Validate state to prevent CSRF attacks
          if (providerType === "gmail" && localStorage.getItem(`google_gmail_state`) === stateValue) {
            scope = GMAIL_SCOPE;
          } else if (providerType === "calendar" && localStorage.getItem(`google_calendar_state`) === stateValue) {
            scope = CALENDAR_SCOPE;
          } else {
            throw new Error("Invalid state parameter");
          }
        } else {
          throw new Error("Invalid state format");
        }

        // Use the production redirect URI
        const redirectUri = `https://app.joincircl.com/auth/callback/google`;

        // Exchange code for tokens
        const tokenData = await googleService.exchangeCodeForToken(code, redirectUri, scope);
        if (!tokenData) {
          throw new Error(`Failed to exchange authorization code for ${providerType}`);
        }
        
        // Clean up state
        localStorage.removeItem(`google_${providerType}_state`);
        
        // Show success message
        toast({
          title: "Connected",
          description: `${providerType === 'gmail' ? 'Gmail' : 'Google Calendar'} connected successfully`,
        });
        
        // Redirect based on the service type
        if (providerType === 'gmail') {
          navigate("/settings?tab=integrations&provider=gmail");
        } else if (providerType === 'calendar') {
          navigate("/settings?tab=integrations&provider=calendar");
        } else {
          navigate("/settings?tab=integrations");
        }
        
      } catch (err) {
        console.error("Google OAuth error:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        
        // Check for redirect URI mismatch error
        if (errorMessage.includes('redirect_uri_mismatch') || errorMessage.includes('redirect')) {
          toast({
            title: "Connection Failed",
            description: "The redirect URI doesn't match what's configured in Google Cloud Console.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Connection Failed",
            description: "Could not complete Google authentication",
            variant: "destructive",
          });
        }
        navigate("/settings?tab=integrations");
      } finally {
        setProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, toast, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {error ? "Authentication Error" : "Processing Google Authentication"}
          </h1>
          
          <div className="mt-4">
            {processing ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-gray-500">Please wait while we verify your account...</p>
              </div>
            ) : error ? (
              <div className="text-red-500">
                <p>{error}</p>
                <button
                  onClick={() => navigate("/settings?tab=integrations")}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
                >
                  Return to Settings
                </button>
              </div>
            ) : (
              <div>
                <p className="text-green-500 mb-4">Authentication successful! Redirecting...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
