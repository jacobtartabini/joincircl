
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function CallbackPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
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
            console.log("Valid Twitter callback detected, processing OAuth exchange");
            
            try {
              // Call the Twitter OAuth edge function to exchange code for token
              const { data, error } = await supabase.functions.invoke('twitter-oauth', {
                body: { code, codeVerifier }
              });
              
              if (error) {
                console.error("Edge function error:", error);
                toast({
                  title: "Twitter Connection Failed",
                  description: `Error: ${error.message || "Unknown error"}`,
                  variant: "destructive",
                });
                setError("Failed to connect Twitter account");
              } else if (data && data.success) {
                console.log("Twitter connection successful:", data);
                toast({
                  title: "Twitter Connected",
                  description: `Successfully connected as @${data.profile.username}`,
                });
                
                // Clear auth state data
                localStorage.removeItem("twitter_auth_state");
                localStorage.removeItem("twitter_code_verifier");
                
                // Redirect to integrations page
                navigate("/settings?tab=integrations", { replace: true });
                return;
              } else {
                console.error("Unexpected response from edge function:", data);
                setError("Failed to connect Twitter account: Unexpected response");
              }
            } catch (edgeFnError) {
              console.error("Error calling edge function:", edgeFnError);
              setError(`Failed to connect Twitter account: ${edgeFnError instanceof Error ? edgeFnError.message : "Unknown error"}`);
            }
            
            // If we're still here, something went wrong
            setTimeout(() => navigate("/settings?tab=integrations", { replace: true }), 2000);
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
  }, [navigate, toast]);

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
