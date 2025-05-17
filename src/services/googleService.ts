
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Google API scopes
export const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

// Google OAuth Client ID
export const GOOGLE_CLIENT_ID = '1082106594085-er19ne14fh1si3391t8rbls3jfsbppa2.apps.googleusercontent.com';

// Types
export type GoogleProvider = 'gmail' | 'calendar';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

interface GoogleEmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: {
    partId?: string;
    mimeType: string;
    filename?: string;
    headers: {
      name: string;
      value: string;
    }[];
    body?: {
      attachmentId?: string;
      size: number;
      data?: string;
    };
    parts?: any[];
  };
  sizeEstimate: number;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus?: string;
  }[];
}

// Helper function to generate the Google OAuth URL
export const generateGoogleAuthUrl = (provider: GoogleProvider): string => {
  const scope = provider === 'gmail' ? GMAIL_SCOPE : CALENDAR_SCOPE;
  
  // Create random state for CSRF protection
  const state = Math.random().toString(36).substring(2);
  localStorage.setItem(`google_${provider}_state`, state);
  
  // Set the current URL as the redirect URI
  const redirectUri = `${window.location.origin}/auth/callback/google`;
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'consent',
    state: `${provider}_${state}` // Include the provider in state
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// Service object
export const googleService = {
  // Connect to Gmail
  connectGmail: async (): Promise<boolean> => {
    try {
      const authUrl = generateGoogleAuthUrl('gmail');
      window.location.href = authUrl;
      return true;
    } catch (error) {
      console.error('Error connecting to Gmail:', error);
      return false;
    }
  },
  
  // Connect to Google Calendar
  connectCalendar: async (): Promise<boolean> => {
    try {
      const authUrl = generateGoogleAuthUrl('calendar');
      window.location.href = authUrl;
      return true;
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      return false;
    }
  },
  
  // Exchange code for token (handled in CallbackPage)
  exchangeCodeForToken: async (
    code: string, 
    redirectUri: string, 
    scope: string
  ): Promise<GoogleTokenResponse | null> => {
    try {
      // Call our edge function to exchange the code for a token
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: {
          action: 'exchange',
          code,
          redirectUri,
          scope
        }
      });
      
      if (error || !data) {
        console.error('Error exchanging code for token:', error);
        return null;
      }
      
      return data as GoogleTokenResponse;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return null;
    }
  },
  
  // Fetch recent emails from Gmail
  fetchRecentEmails: async (
    limit: number = 10
  ): Promise<{ data: any[], error: any }> => {
    try {
      // Call the Gmail API through our secure backend
      const { data, error } = await supabase.functions.invoke('gmail-fetch', {
        body: {
          action: 'recent',
          limit
        }
      });
      
      if (error) {
        console.error('Error fetching Gmail messages:', error);
        return { data: [], error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching Gmail messages:', error);
      return { data: [], error };
    }
  },
  
  // Fetch upcoming calendar events
  fetchUpcomingEvents: async (
    days: number = 7
  ): Promise<{ data: GoogleCalendarEvent[], error: any }> => {
    try {
      // Call the Calendar API through our secure backend
      const { data, error } = await supabase.functions.invoke('calendar-events', {
        body: {
          action: 'upcoming',
          days
        }
      });
      
      if (error) {
        console.error('Error fetching calendar events:', error);
        return { data: [], error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return { data: [], error };
    }
  },
  
  // Check if provider is connected
  isConnected: async (provider: GoogleProvider): Promise<boolean> => {
    try {
      // Check if we have a valid token for this provider
      if (provider === 'gmail') {
        const { data } = await supabase
          .from('user_email_tokens')
          .select('*')
          .eq('provider', 'gmail')
          .maybeSingle();
          
        return !!data;
      } else {
        const { data } = await supabase
          .from('user_calendar_tokens')
          .select('*')
          .eq('provider', 'google')
          .maybeSingle();
          
        return !!data;
      }
    } catch (error) {
      console.error(`Error checking ${provider} connection:`, error);
      return false;
    }
  },
  
  // Disconnect a provider
  disconnect: async (provider: GoogleProvider): Promise<boolean> => {
    try {
      if (provider === 'gmail') {
        const { error } = await supabase
          .from('user_email_tokens')
          .delete()
          .eq('provider', 'gmail');
          
        if (error) {
          console.error('Error disconnecting Gmail:', error);
          return false;
        }
      } else {
        const { error } = await supabase
          .from('user_calendar_tokens')
          .delete()
          .eq('provider', 'google');
          
        if (error) {
          console.error('Error disconnecting Google Calendar:', error);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error disconnecting ${provider}:`, error);
      return false;
    }
  }
};
