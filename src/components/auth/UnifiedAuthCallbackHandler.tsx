
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { detectCallbackType } from "./handlers/CallbackTypeDetector";
import { useMagicLinkHandler } from "./handlers/MagicLinkHandler";
import { useSupabaseAuthHandler } from "./handlers/SupabaseAuthHandler";
import { useGoogleIntegrationHandler } from "./handlers/GoogleIntegrationHandler";
import { useTwitterIntegrationHandler } from "./handlers/TwitterIntegrationHandler";

export default function UnifiedAuthCallbackHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  const { handleMagicLink } = useMagicLinkHandler();
  const { handleSupabaseAuth } = useSupabaseAuthHandler();
  const { handleGoogleIntegration } = useGoogleIntegrationHandler();
  const { handleTwitterIntegration } = useTwitterIntegrationHandler();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Processing auth callback...');
        
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const scope = searchParams.get('scope');

        // Handle OAuth errors
        if (error) {
          console.warn(`OAuth error detected: ${error}`);
          toast({
            title: "Authentication Error",
            description: `Authentication failed: ${error}`,
            variant: "destructive",
          });
          navigate("/signin", { replace: true });
          return;
        }

        // Determine the type of callback
        const callbackType = detectCallbackType(searchParams);

        const onComplete = () => setIsProcessing(false);

        if (callbackType.isMagicLink) {
          await handleMagicLink(onComplete);
        } else if (callbackType.isSupabaseAuth) {
          if (!code) {
            console.warn('No auth code found for Supabase auth');
            navigate("/signin", { replace: true });
            return;
          }
          await handleSupabaseAuth(code, onComplete);
        } else if (callbackType.isGoogleIntegration) {
          if (!code || !scope) {
            console.warn('Missing code or scope for Google integration');
            navigate("/settings?tab=integrations", { replace: true });
            return;
          }
          await handleGoogleIntegration(code, scope, onComplete);
        } else if (callbackType.isTwitterIntegration) {
          if (!code || !state) {
            console.warn('Missing code or state for Twitter integration');
            navigate("/settings?tab=integrations", { replace: true });
            return;
          }
          await handleTwitterIntegration(code, state, onComplete);
        } else {
          console.warn('Unknown callback type');
          navigate("/signin", { replace: true });
          setIsProcessing(false);
        }
        
      } catch (err) {
        console.error("Callback handler error:", err);
        toast({
          title: "Error",
          description: "An unexpected error occurred during authentication.",
          variant: "destructive",
        });
        navigate("/signin", { replace: true });
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate, searchParams, toast, handleMagicLink, handleSupabaseAuth, handleGoogleIntegration, handleTwitterIntegration]);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing your sign in...</p>
        </div>
      </div>
    );
  }

  return null;
}
