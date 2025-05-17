
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TwitterAuthDialog } from '@/components/integrations/TwitterAuthDialog';

export function useTwitterOAuth(refreshCallback: () => Promise<void>) {
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're returning from a Twitter OAuth callback
    const isTwitterCallback = () => {
      return window.location.pathname === "/auth/callback" && 
             window.location.search.includes("code=") && 
             localStorage.getItem("twitter_auth_state") !== null;
    };
    
    // We don't handle the callback here anymore - it's handled in CallbackPage.tsx
    // This is just for logging purposes
    if (isTwitterCallback()) {
      console.log("Twitter OAuth callback detected, will be handled by CallbackPage component");
    }
  }, [toast, refreshCallback]);
  
  return {
    TwitterAuthDialog,
  };
}
