
import { supabase } from '@/integrations/supabase/client';

export const validateSession = async (): Promise<boolean> => {
  try {
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session validation error:', error);
      return false;
    }

    if (!session) {
      console.log('No active session found');
      return false;
    }

    // Check if session is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log('Session has expired');
      
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Failed to refresh session:', refreshError);
        return false;
      }
      
      console.log('Session refreshed successfully');
      
      // Update stored session on web
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('supabase.auth.token', JSON.stringify(refreshData.session));
        } catch (error) {
          console.warn('Failed to store refreshed session:', error);
        }
      }
      
      return true;
    }

    // Verify session with a simple API call
    const { error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('User validation error:', userError);
      return false;
    }

    console.log('Session is valid');
    return true;
  } catch (error) {
    console.error('Session validation failed:', error);
    return false;
  }
};

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('supabase.auth.token');
      console.log('Auth data cleared from localStorage');
    } catch (error) {
      console.warn('Failed to clear auth data:', error);
    }
  }
};

export const getStoredSession = () => {
  if (typeof window !== 'undefined') {
    try {
      const storedSession = localStorage.getItem('supabase.auth.token');
      return storedSession ? JSON.parse(storedSession) : null;
    } catch (error) {
      console.warn('Failed to get stored session:', error);
      return null;
    }
  }
  return null;
};
