
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useTwitterIntegrationHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleTwitterIntegration = async (code: string, state: string, onComplete: () => void) => {
    try {
      const storedState = localStorage.getItem('twitter_auth_state');
      const codeVerifier = localStorage.getItem('twitter_code_verifier');

      if (!storedState || storedState !== state) {
        throw new Error('Invalid state parameter');
      }

      if (!codeVerifier) {
        throw new Error('Missing code verifier');
      }

      const { data, error } = await supabase.functions.invoke('twitter-oauth', {
        body: { code, codeVerifier }
      });

      if (error) {
        throw new Error(`Twitter OAuth error: ${error.message}`);
      }

      // Clean up localStorage
      localStorage.removeItem('twitter_auth_state');
      localStorage.removeItem('twitter_code_verifier');

      toast({
        title: "Success",
        description: "Twitter account connected successfully",
      });

      setTimeout(() => {
        navigate('/settings?tab=integrations');
      }, 2000);
    } catch (error) {
      console.error('Failed to connect Twitter:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect Twitter. Please try again.",
        variant: "destructive",
      });
      navigate("/settings?tab=integrations", { replace: true });
    } finally {
      onComplete();
    }
  };

  return { handleTwitterIntegration };
};
