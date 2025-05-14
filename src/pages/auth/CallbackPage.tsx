import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { secureApiService } from "@/services/secure-api";

export default function CallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Process the OAuth callback
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
          return;
        }

        // Check if user selected "keep me signed in" before OAuth redirect
        const keepSignedIn = localStorage.getItem('keepSignedIn') === 'true';
        
        // Apply extended session if keep me signed in was selected
        if (keepSignedIn) {
          await secureApiService.extendSession(true);
          localStorage.removeItem('keepSignedIn'); // Clean up
        }

        // Navigate to the home page or a redirect URL if there was one
        const redirectTo = localStorage.getItem('authRedirectPath') || '/';
        localStorage.removeItem('authRedirectPath'); // Clean up
        navigate(redirectTo, { replace: true });
        
      } catch (err: any) {
        console.error("Error during OAuth callback:", err);
        setError(err.message || "An unknown error occurred during sign in");
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
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}
