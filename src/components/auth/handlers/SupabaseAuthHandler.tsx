
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useSupabaseAuthHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSupabaseAuth = async (code: string, onComplete: () => void) => {
    try {
      console.log('Processing Supabase OAuth callback with code:', code);
      
      // Wait a moment to ensure any concurrent auth operations complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data, error: authError } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (authError) {
        console.error('Auth exchange error:', authError);
        toast({
          title: "Authentication Failed",
          description: authError.message || "Failed to complete sign in",
          variant: "destructive",
        });
        navigate("/signin", { replace: true });
        return;
      }

      if (data?.session?.user) {
        console.log('OAuth authentication successful, user:', data.session.user.email);
        
        // Store session explicitly to ensure persistence
        if (typeof window !== 'undefined' && data.session) {
          try {
            localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
            // Set flag to skip aggressive session validation after OAuth
            sessionStorage.setItem('recent_oauth', 'true');
          } catch (storageError) {
            console.warn('Failed to store session:', storageError);
          }
        }
        
        toast({
          title: "Welcome!",
          description: "You have been signed in successfully.",
        });

        // Wait a bit longer before navigation to ensure session is fully established
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
      } else {
        console.warn('No session established after auth exchange');
        navigate("/signin", { replace: true });
      }
    } catch (authError) {
      console.error('Supabase auth callback error:', authError);
      toast({
        title: "Authentication Error",
        description: "Failed to complete authentication. Please try again.",
        variant: "destructive",
      });
      navigate("/signin", { replace: true });
    } finally {
      onComplete();
    }
  };

  return { handleSupabaseAuth };
};
