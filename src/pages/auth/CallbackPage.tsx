
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { googleService, GMAIL_SCOPE, CALENDAR_SCOPE } from "@/services/googleService";

export default function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Process OAuth callback
  useEffect(() => {
    const processCallback = async () => {
      setProcessing(true);
      setError(null);

      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const provider = searchParams.get("provider");
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

        // Handle Twitter callback
        if (state && localStorage.getItem("twitter_auth_state") === state) {
          await handleTwitterCallback(code);
          return;
        }
        
        // Handle Google callback
        if (state && state.includes("_")) {
          const [providerType, stateValue] = state.split("_");
          
          if (providerType === "gmail" && localStorage.getItem(`google_gmail_state`) === stateValue) {
            await handleGmailCallback(code);
            return;
          }
          
          if (providerType === "calendar" && localStorage.getItem(`google_calendar_state`) === stateValue) {
            await handleCalendarCallback(code);
            return;
          }
        }

        // Unknown callback type
        setError("Unknown authentication callback");
      } catch (err) {
        console.error("Error in callback processing:", err);
        setError(`Authentication error: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, toast, navigate]);

  // Handle Twitter callback
  const handleTwitterCallback = async (code: string) => {
    try {
      // Build the redirect URI
      const redirectUri = `${window.location.origin}/auth/callback`;

      // Exchange code for tokens via Edge Function
      const { data, error } = await supabase.functions.invoke("twitter-oauth", {
        body: { 
          action: "exchange",
          code: code, 
          redirectUri: redirectUri,
        },
      });

      if (error || !data?.access_token) {
        throw new Error(error?.message || "Failed to exchange authorization code");
      }

      // Clean up
      localStorage.removeItem("twitter_auth_state");
      
      toast({
        title: "Connected",
        description: "Twitter account connected successfully",
      });
      
      // Navigate to settings with integrations tab active
      navigate("/settings?tab=integrations");
    } catch (err) {
      console.error("Twitter OAuth error:", err);
      toast({
        title: "Connection Failed",
        description: "Could not connect Twitter account",
        variant: "destructive",
      });
      navigate("/settings?tab=integrations");
    }
  };
  
  // Handle Gmail callback
  const handleGmailCallback = async (code: string) => {
    try {
      // Use the production redirect URI
      const redirectUri = `https://app.joincircl.com/auth/callback/google`;

      // Exchange code for tokens
      const tokenData = await googleService.exchangeCodeForToken(code, redirectUri, GMAIL_SCOPE);
      if (!tokenData) {
        throw new Error("Failed to exchange authorization code for Gmail");
      }
      
      // Clean up
      localStorage.removeItem("google_gmail_state");
      
      toast({
        title: "Connected",
        description: "Gmail account connected successfully",
      });
      
      // Navigate back to the integrations tab
      navigate("/settings?tab=integrations&provider=gmail");
    } catch (err) {
      console.error("Gmail OAuth error:", err);
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
          description: "Could not connect Gmail account",
          variant: "destructive",
        });
      }
      navigate("/settings?tab=integrations");
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle Calendar callback
  const handleCalendarCallback = async (code: string) => {
    try {
      // Use the production redirect URI
      const redirectUri = `https://app.joincircl.com/auth/callback/google`;

      // Exchange code for tokens
      const tokenData = await googleService.exchangeCodeForToken(code, redirectUri, CALENDAR_SCOPE);
      if (!tokenData) {
        throw new Error("Failed to exchange authorization code for Calendar");
      }
      
      // Clean up
      localStorage.removeItem("google_calendar_state");
      
      toast({
        title: "Connected",
        description: "Google Calendar connected successfully",
      });
      
      // Navigate back to the integrations tab
      navigate("/settings?tab=integrations&provider=calendar");
    } catch (err) {
      console.error("Calendar OAuth error:", err);
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
          description: "Could not connect Google Calendar",
          variant: "destructive",
        });
      }
      navigate("/settings?tab=integrations");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {error ? "Authentication Error" : "Processing Authentication"}
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
