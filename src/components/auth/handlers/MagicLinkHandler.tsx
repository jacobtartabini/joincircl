
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MagicLinkHandlerProps {
  onComplete: () => void;
}

export const useMagicLinkHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleMagicLink = async (onComplete: () => void) => {
    console.log('Processing magic link authentication...');
    
    try {
      // For magic links, Supabase automatically handles the session exchange
      // We just need to verify the session was established
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Magic link session error:', sessionError);
        toast({
          title: "Authentication Failed",
          description: "Failed to complete magic link sign in. Please try again.",
          variant: "destructive",
        });
        navigate("/signin", { replace: true });
        return;
      }

      if (session?.user) {
        console.log('Magic link authentication successful:', session.user.email);
        
        toast({
          title: "Welcome!",
          description: "You have been signed in successfully via magic link.",
        });

        // Navigate to home page after successful magic link authentication
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
      } else {
        console.warn('No session found after magic link');
        toast({
          title: "Authentication Failed", 
          description: "Magic link authentication failed. Please try again.",
          variant: "destructive",
        });
        navigate("/signin", { replace: true });
      }
    } catch (magicLinkError) {
      console.error('Magic link callback error:', magicLinkError);
      toast({
        title: "Authentication Error",
        description: "Failed to complete magic link authentication. Please try again.",
        variant: "destructive",
      });
      navigate("/signin", { replace: true });
    } finally {
      onComplete();
    }
  };

  return { handleMagicLink };
};
