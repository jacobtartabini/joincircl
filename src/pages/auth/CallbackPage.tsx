
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function CallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("Processing OAuth callback");
        setLoading(true);
        
        // Process the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          setError(error.message);
          setLoading(false);
          return;
        }

        if (!data.session) {
          console.error("No session found in callback");
          setError("Authentication failed. Please try again.");
          setLoading(false);
          return;
        }

        console.log("Auth callback successful, session found:", !!data.session);
        
        // Navigate to the home page or a redirect URL if there was one
        const redirectTo = localStorage.getItem('authRedirectPath') || '/';
        localStorage.removeItem('authRedirectPath'); // Clean up
        
        // Short delay to ensure auth state is updated everywhere
        setTimeout(() => {
          setLoading(false);
          navigate(redirectTo, { replace: true });
        }, 500);
        
      } catch (err: any) {
        console.error("Error during OAuth callback:", err);
        setError(err.message || "An unknown error occurred during sign in");
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => navigate("/auth/sign-in")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p>{loading ? "Completing sign in..." : "Redirecting..."}</p>
      </div>
    </div>
  );
}
