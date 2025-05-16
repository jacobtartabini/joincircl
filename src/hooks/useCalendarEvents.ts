
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define calendar event type
interface CalendarEvent {
  id: string;
  date: string;
  type: 'calendar';
  title: string;
  location?: string;
  description?: string;
  attendees?: string[];
  provider: 'gmail' | 'outlook';
  contact_id: string;
  user_id: string;
}

export const useCalendarEvents = (contactId?: string) => {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      if (!contactId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, we would fetch from the database
        // Here we're simulating with demo data
        
        // Check if we have email/calendar integrations enabled
        const { data: userSession } = await supabase.auth.getSession();
        
        if (userSession?.session) {
          const { data: gmailConnectionData } = await supabase
            .from('user_email_tokens')
            .select('*')
            .eq('user_id', userSession.session.user.id)
            .eq('provider', 'gmail')
            .maybeSingle();
            
          const { data: outlookConnectionData } = await supabase
            .from('user_email_tokens')
            .select('*')
            .eq('user_id', userSession.session.user.id)
            .eq('provider', 'outlook')
            .maybeSingle();
            
          // Generate some demo calendar events based on connected providers
          const demoEvents: CalendarEvent[] = [];
          
          if (gmailConnectionData) {
            // Add some Gmail calendar events
            const gmailEvents: CalendarEvent[] = [
              {
                id: `gmail-cal-1-${contactId}`,
                date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days in future
                type: 'calendar',
                title: 'Project Planning Meeting',
                location: 'Conference Room A',
                description: 'Quarterly planning session to align on goals and roadmap for the upcoming three months.',
                attendees: ['john@example.com', 'sarah@example.com'],
                provider: 'gmail',
                contact_id: contactId,
                user_id: userSession.session.user.id
              },
              {
                id: `gmail-cal-2-${contactId}`,
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
                type: 'calendar',
                title: 'Coffee Chat',
                location: 'Starbucks, Downtown',
                description: 'Informal catchup to discuss career opportunities and industry trends.',
                provider: 'gmail',
                contact_id: contactId,
                user_id: userSession.session.user.id
              }
            ];
            
            demoEvents.push(...gmailEvents);
          }
          
          if (outlookConnectionData) {
            // Add some Outlook calendar events
            const outlookEvents: CalendarEvent[] = [
              {
                id: `outlook-cal-1-${contactId}`,
                date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days in future
                type: 'calendar',
                title: 'Quarterly Business Review',
                location: 'Virtual - Microsoft Teams',
                description: 'Review of Q1 performance and discussion of Q2 strategies.',
                provider: 'outlook',
                contact_id: contactId,
                user_id: userSession.session.user.id
              },
              {
                id: `outlook-cal-2-${contactId}`,
                date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
                type: 'calendar',
                title: 'Industry Networking Event',
                location: 'Downtown Convention Center',
                description: 'Annual tech networking event with keynote speakers and breakout sessions.',
                provider: 'outlook',
                contact_id: contactId,
                user_id: userSession.session.user.id
              }
            ];
            
            demoEvents.push(...outlookEvents);
          }
          
          setCalendarEvents(demoEvents);
        }
        
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError(err as Error);
        setCalendarEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarEvents();
  }, [contactId]);

  return { calendarEvents, loading, error };
};
