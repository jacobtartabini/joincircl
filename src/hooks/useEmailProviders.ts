
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define the email provider token type
export interface EmailProviderToken {
  id: string;
  user_id: string;
  provider: 'gmail' | 'outlook';
  access_token: string;
  refresh_token?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// Custom hook to check if email providers are connected
export const useEmailProviders = () => {
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [isOutlookConnected, setIsOutlookConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkEmailProviders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: userSession } = await supabase.auth.getSession();
        
        if (userSession?.session) {
          const userId = userSession.session.user.id;
          
          // Use a more type-safe approach with explicit typing
          const { data: tokens, error: tokensError } = await supabase
            .from('user_email_tokens')
            .select('*')
            .eq('user_id', userId);
          
          if (tokensError) {
            throw tokensError;
          }
          
          if (tokens) {
            const gmailToken = tokens.find(token => token.provider === 'gmail');
            const outlookToken = tokens.find(token => token.provider === 'outlook');
            
            setIsGmailConnected(!!gmailToken);
            setIsOutlookConnected(!!outlookToken);
          }
        }
      } catch (err) {
        console.error('Error checking email providers:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    checkEmailProviders();
  }, []);
  
  return { isGmailConnected, isOutlookConnected, loading, error };
};
