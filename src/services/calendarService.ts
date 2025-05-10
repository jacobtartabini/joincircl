
import { Keystone } from "@/types/keystone";
import { Interaction } from "@/types/contact";
import { supabase } from "@/integrations/supabase/client";

// Google Calendar API scopes
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
].join(' ');

// Google Calendar Client ID
const GOOGLE_CLIENT_ID = '1082106594085-er19ne14fh1si3391t8rbls3jfsbppa2.apps.googleusercontent.com';

// Types
export type CalendarProvider = 'google' | 'apple' | 'outlook';

interface CalendarToken {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  provider: CalendarProvider;
}

interface CalendarEvent {
  title: string;
  description: string;
  start: string; // ISO date string
  end?: string; // ISO date string
  location?: string;
}

// Store token in localStorage for now (will be moved to Supabase in production)
const storeToken = async (provider: CalendarProvider, tokenData: any) => {
  try {
    // In a real app, this would securely store tokens in Supabase
    const expiresAt = Date.now() + tokenData.expires_in * 1000;
    
    // Store in Supabase
    const { error } = await supabase
      .from('user_calendar_tokens')
      .upsert({
        user_id: supabase.auth.getUser().then(data => data.data.user?.id),
        provider,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(expiresAt).toISOString()
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error storing calendar token:', error);
    return false;
  }
};

// Get stored token
const getToken = async (provider: CalendarProvider): Promise<CalendarToken | null> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) return null;
    
    // Get token from Supabase
    const { data, error } = await supabase
      .from('user_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();
      
    if (error || !data) return null;
    
    // Check if token is expired
    if (new Date(data.expires_at).getTime() < Date.now()) {
      // Token is expired, should refresh
      if (provider === 'google' && data.refresh_token) {
        return await refreshGoogleToken(data.refresh_token);
      }
      return null;
    }
    
    return data as CalendarToken;
  } catch (error) {
    console.error('Error getting calendar token:', error);
    return null;
  }
};

// Refresh Google token
const refreshGoogleToken = async (refreshToken: string): Promise<CalendarToken | null> => {
  // This should be handled by a Supabase Edge Function in production
  // For now we'll just return null
  return null;
};

export const calendarService = {
  // Initialize Google Auth
  initGoogleAuth: () => {
    return new Promise((resolve) => {
      // Check if the Google API client is already loaded
      if (window.gapi) {
        window.gapi.load('client:auth2', () => {
          window.gapi.client.init({
            clientId: GOOGLE_CLIENT_ID,
            scope: GOOGLE_SCOPES
          }).then(() => {
            resolve(true);
          }).catch((error: any) => {
            console.error('Error initializing Google API client:', error);
            resolve(false);
          });
        });
      } else {
        // Load the Google API client if it's not already loaded
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
          window.gapi.load('client:auth2', () => {
            window.gapi.client.init({
              clientId: GOOGLE_CLIENT_ID,
              scope: GOOGLE_SCOPES
            }).then(() => {
              resolve(true);
            }).catch((error: any) => {
              console.error('Error initializing Google API client:', error);
              resolve(false);
            });
          });
        };
        document.body.appendChild(script);
      }
    });
  },
  
  // Connect to Google Calendar
  connectGoogleCalendar: async (): Promise<boolean> => {
    try {
      await calendarService.initGoogleAuth();
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      const isSignedIn = authInstance.isSignedIn.get();
      
      if (!isSignedIn) {
        const user = await authInstance.signIn();
        const authResponse = user.getAuthResponse(true);
        
        if (authResponse) {
          await storeToken('google', {
            access_token: authResponse.access_token,
            refresh_token: authResponse.refresh_token || '', // May not be present on re-auth
            expires_in: authResponse.expires_in
          });
          return true;
        }
      } else {
        // Already signed in
        const currentUser = authInstance.currentUser.get();
        const authResponse = currentUser.getAuthResponse(true);
        
        if (authResponse) {
          await storeToken('google', {
            access_token: authResponse.access_token,
            refresh_token: '', // Not available on already signed in user
            expires_in: authResponse.expires_in
          });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      return false;
    }
  },
  
  // Add event to Google Calendar
  addEventToGoogleCalendar: async (event: CalendarEvent): Promise<boolean> => {
    try {
      const token = await getToken('google');
      
      if (!token) {
        // Need to reconnect
        const connected = await calendarService.connectGoogleCalendar();
        if (!connected) return false;
      }
      
      await calendarService.initGoogleAuth();
      
      const endTime = event.end || new Date(new Date(event.start).getTime() + 60 * 60 * 1000).toISOString();
      
      const calendarEvent = {
        'summary': event.title,
        'description': event.description,
        'start': {
          'dateTime': event.start,
          'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        'end': {
          'dateTime': endTime,
          'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };
      
      if (event.location) {
        calendarEvent.location = event.location;
      }
      
      // Add event to calendar
      await window.gapi.client.load('calendar', 'v3');
      const response = await window.gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': calendarEvent
      });
      
      if (response?.status === 200) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding event to Google Calendar:', error);
      return false;
    }
  },
  
  // Generate Apple Calendar URL
  generateAppleCalendarURL: (event: CalendarEvent): string => {
    let url = 'data:text/calendar;charset=utf8,';
    
    // Format dates for iCal
    const startDate = new Date(event.start);
    const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 60 * 60 * 1000);
    
    // Format for iCal
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    // Create iCal content
    const iCalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `LOCATION:${event.location || ''}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');
    
    return url + encodeURIComponent(iCalContent);
  },
  
  // Generate Outlook Calendar URL
  generateOutlookCalendarURL: (event: CalendarEvent): string => {
    const startDate = new Date(event.start);
    const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 60 * 60 * 1000);
    
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    let url = 'https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent';
    url += `&subject=${encodeURIComponent(event.title)}`;
    url += `&body=${encodeURIComponent(event.description)}`;
    url += `&startdt=${formatDate(startDate)}`;
    url += `&enddt=${formatDate(endDate)}`;
    
    if (event.location) {
      url += `&location=${encodeURIComponent(event.location)}`;
    }
    
    return url;
  },
  
  // Create calendar event from keystone
  createEventFromKeystone: (keystone: Keystone): CalendarEvent => {
    return {
      title: keystone.title,
      description: keystone.notes || '',
      start: keystone.due_date || keystone.date,
      location: ''
    };
  },
  
  // Create calendar event from interaction
  createEventFromInteraction: (interaction: Interaction, contactName: string): CalendarEvent => {
    return {
      title: `${interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)} with ${contactName}`,
      description: interaction.notes || '',
      start: interaction.date,
      location: ''
    };
  }
};

// Add TypeScript type definitions for the global gapi object
declare global {
  interface Window {
    gapi: any;
  }
}
