import { supabase } from "@/integrations/supabase/client";

export interface GoogleServiceResponse<T = any> {
  data?: T;
  error?: string;
}

class GoogleService {
  private readonly clientId = "1082106594085-er19ne14fh1si3391t8rb3391t8rbls3jfsbppa2.apps.googleusercontent.com";

  // Check if a Google service is connected
  async isConnected(service: 'gmail' | 'calendar'): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return false;

      if (service === 'gmail') {
        const { data } = await supabase
          .from('user_email_tokens')
          .select('id')
          .eq('user_id', session.session.user.id)
          .eq('provider', 'gmail')
          .single();
        return !!data;
      } else {
        const { data } = await supabase
          .from('user_calendar_tokens')
          .select('id')
          .eq('user_id', session.session.user.id)
          .eq('provider', 'google')
          .single();
        return !!data;
      }
    } catch (error) {
      console.error(`Error checking ${service} connection:`, error);
      return false;
    }
  }

  // Connect to Gmail
  async connectGmail(): Promise<boolean> {
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const scope = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email';
      
      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${this.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;

      window.location.href = authUrl;
      return true;
    } catch (error) {
      console.error('Error connecting to Gmail:', error);
      return false;
    }
  }

  // Connect to Google Calendar
  async connectCalendar(): Promise<boolean> {
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const scope = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email';
      
      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${this.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;

      window.location.href = authUrl;
      return true;
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      return false;
    }
  }

  // Exchange code for token
  async exchangeCodeForToken(code: string, redirectUri: string, scope: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: {
          action: 'exchange',
          code,
          redirectUri,
          scope
        }
      });

      if (error) {
        throw new Error(`Token exchange failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  // Fetch recent emails
  async fetchRecentEmails(limit = 10): Promise<GoogleServiceResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('gmail-fetch', {
        body: {
          action: 'recent',
          limit
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Error fetching emails:', error);
      return { error: 'Failed to fetch emails' };
    }
  }

  // Sync Gmail (fetch and process emails)
  async syncGmail(): Promise<GoogleServiceResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('gmail-fetch', {
        body: {
          action: 'sync',
          limit: 20
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Error syncing Gmail:', error);
      return { error: 'Failed to sync Gmail' };
    }
  }

  // Fetch upcoming calendar events
  async fetchUpcomingEvents(days = 7): Promise<GoogleServiceResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('calendar-events', {
        body: {
          action: 'upcoming',
          days
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return { error: 'Failed to fetch calendar events' };
    }
  }

  // Sync Google Calendar (fetch and process events)
  async syncCalendar(): Promise<GoogleServiceResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('calendar-events', {
        body: {
          action: 'sync',
          days: 30
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Error syncing calendar:', error);
      return { error: 'Failed to sync calendar' };
    }
  }

  // Disconnect a service
  async disconnect(service: 'gmail' | 'calendar'): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return false;

      if (service === 'gmail') {
        const { error } = await supabase
          .from('user_email_tokens')
          .delete()
          .eq('user_id', session.session.user.id)
          .eq('provider', 'gmail');
        
        return !error;
      } else {
        const { error } = await supabase
          .from('user_calendar_tokens')
          .delete()
          .eq('user_id', session.session.user.id)
          .eq('provider', 'google');
        
        return !error;
      }
    } catch (error) {
      console.error(`Error disconnecting ${service}:`, error);
      return false;
    }
  }
}

export const googleService = new GoogleService();