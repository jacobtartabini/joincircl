
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function CallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This handles the OAuth callback and redirects to the homepage
    const handleAuthCallback = async () => {
      try {
        // Get the session - the OAuth exchange should already be complete
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          setError(error.message);
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
