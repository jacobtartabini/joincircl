
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AuthCallbackHandlerProps {
  type: 'general' | 'google';
}

export default function AuthCallbackHandler({ type }: AuthCallbackHandlerProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setProcessing(true);
        setError(null);

        // Handle Supabase auth callback
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(window.location.href);
        
        if (authError) {
          throw authError;
        }

        if (data?.session) {
          toast({
            title: "Welcome!",
            description: "Successfully signed in to your account.",
          });
          navigate("/", { replace: true });
        } else {
          throw new Error("No session established");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        const errorMessage = err instanceof Error ? err.message : "Authentication failed";
        setError(errorMessage);
        
        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Redirect to sign in after a delay
        setTimeout(() => {
          navigate("/signin", { replace: true });
        }, 3000);
      } finally {
        setProcessing(false);
      }
    };

    handleCallback();
  }, [navigate, toast, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold">
          {error ? "Authentication Error" : "Processing Authentication"}
        </h1>
        
        {processing ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-gray-500">Completing sign in...</p>
          </div>
        ) : error ? (
          <div className="text-red-500">
            <p className="mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to sign in...</p>
          </div>
        ) : (
          <div className="text-green-500">
            <p className="mb-4">Authentication successful!</p>
            <p className="text-sm text-gray-500">Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  );
}
