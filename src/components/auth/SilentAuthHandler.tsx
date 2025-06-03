
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function SilentAuthHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleSilentAuth = async () => {
      try {
        const error = searchParams.get('error');
        const code = searchParams.get('code');
        
        // If there's an error parameter, silently redirect to home
        if (error) {
          console.warn('Auth error detected, redirecting to home:', error);
          navigate("/", { replace: true });
          return;
        }

        // If there's no code, redirect to home
        if (!code) {
          console.warn('No auth code found, redirecting to home');
          navigate("/", { replace: true });
          return;
        }

        // Attempt to exchange code for session with timeout
        const exchangePromise = supabase.auth.exchangeCodeForSession(window.location.href);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 10000)
        );

        try {
          const { data, error: authError } = await Promise.race([
            exchangePromise,
            timeoutPromise
          ]) as any;

          if (authError) {
            throw authError;
          }

          if (data?.session) {
            console.log('Auth successful, redirecting to home');
            navigate("/", { replace: true });
          } else {
            throw new Error("No session established");
          }
        } catch (authError) {
          console.warn('Auth exchange failed, redirecting to home:', authError);
          // Clear any partial auth state
          await supabase.auth.signOut();
          navigate("/", { replace: true });
        }
        
      } catch (err) {
        console.warn("Silent auth handler error, redirecting to home:", err);
        // Ensure we always redirect to home on any error
        navigate("/", { replace: true });
      }
    };

    // Small delay to ensure proper URL parsing
    const timer = setTimeout(handleSilentAuth, 100);
    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  // Return minimal loading state - user won't see this for long
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
}
