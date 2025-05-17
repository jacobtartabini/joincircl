
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function CallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Check if this is a Twitter OAuth callback
        if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
          const params = new URLSearchParams(window.location.search);
          const code = params.get("code");
          const state = params.get("state");
          const savedState = localStorage.getItem("twitter_auth_state");
          const codeVerifier = localStorage.getItem("twitter_code_verifier");
          
          if (code && state && state === savedState && codeVerifier) {
            // This is a valid Twitter callback, redirect to settings page
            // The useSocialIntegrations hook will handle the token exchange
            navigate("/settings?tab=integrations", { replace: true });
            return;
          }
        }

        // If not Twitter OAuth, handle regular auth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          setError(error.message);
          setProcessing(false);
          return;
        }

        if (data && data.session) {
          console.log("Auth callback successful, redirecting to homepage");
          // Successful authentication, redirect to the home page
          navigate("/", { replace: true });
        } else {
          // No session found, might be an error in the OAuth flow
          console.error("No session found in callback");
          setError("Authentication failed. Please try again.");
          setTimeout(() => navigate("/auth/sign-in", { replace: true }), 2000);
        }
      } catch (err) {
        console.error("Error in auth callback:", err);
        setError("An unexpected error occurred during authentication.");
      } finally {
        setProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Authenticating...</h2>
        <p className="mb-1">Please wait while we complete the authentication process.</p>
        {error && <p className="text-destructive">{error}</p>}
      </div>
    </div>
  );
}
