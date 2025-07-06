
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get Calendar token for the user
async function getCalendarToken(userId: string) {
  const { data, error } = await supabase
    .from('user_calendar_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single();

  if (error || !data) {
    throw new Error('Google Calendar token not found');
  }

  // Check if token is expired
  if (new Date(data.expires_at) <= new Date()) {
    // Token is expired, refresh it
    const refreshedToken = await refreshCalendarToken(userId, data.refresh_token);
    return refreshedToken;
  }

  return data.access_token;
}

// Refresh Calendar token
async function refreshCalendarToken(userId: string, refreshToken: string) {
  try {
    const { data, error } = await supabase.functions.invoke('google-oauth', {
      body: {
        action: 'refresh',
        refreshToken,
        provider: 'calendar'
      }
    });

    if (error || !data) {
      throw new Error(`Failed to refresh Calendar token: ${error}`);
    }

    // Update token in database
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);
    
    await supabase
      .from('user_calendar_tokens')
      .update({
        access_token: data.access_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('provider', 'google');

    return data.access_token;
  } catch (error) {
    console.error('Error refreshing Calendar token:', error);
    throw error;
  }
}

// Fetch upcoming Calendar events
async function fetchUpcomingEvents(accessToken: string, daysAhead = 7) {
  try {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + daysAhead);
    
    const timeMin = now.toISOString();
    const timeMax = future.toISOString();
    
    // Fetch calendar events
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Calendar API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching Calendar events:', error);
    throw error;
  }
}

// Store calendar events in database
async function storeCalendarEvents(userId: string, events: any[]) {
  const results = { stored: 0, errors: [] as string[] };
  
  for (const event of events) {
    try {
      // Parse attendees and find contacts
      const contactIds: string[] = [];
      if (event.attendees) {
        for (const attendee of event.attendees) {
          if (attendee.email && !attendee.self) {
            const contact = await findContactByEmail(userId, attendee.email);
            if (contact) {
              contactIds.push(contact.id);
            }
          }
        }
      }

      const startTime = event.start.dateTime || event.start.date;
      const endTime = event.end.dateTime || event.end.date;
      const isAllDay = !event.start.dateTime; // All-day events don't have dateTime

      const { error } = await supabase
        .from('calendar_events')
        .upsert({
          user_id: userId,
          provider: 'google',
          event_id: event.id,
          summary: event.summary || 'Untitled Event',
          description: event.description || '',
          start_time: new Date(startTime).toISOString(),
          end_time: endTime ? new Date(endTime).toISOString() : null,
          all_day: isAllDay,
          location: event.location || '',
          attendees: event.attendees || [],
          contact_ids: contactIds,
          metadata: {
            creator: event.creator,
            organizer: event.organizer,
            status: event.status,
            html_link: event.htmlLink
          },
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id,provider,event_id' 
        });

      if (error) {
        console.error(`Error storing calendar event ${event.id}:`, error);
        results.errors.push(`Error storing event ${event.id}: ${error.message}`);
      } else {
        results.stored++;
      }
    } catch (error) {
      console.error(`Error processing calendar event ${event.id}:`, error);
      results.errors.push(`Error processing event ${event.id}: ${error.message}`);
    }
  }
  
  return results;
}

// Find contact by email
async function findContactByEmail(userId: string, email: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('id, name, personal_email')
    .eq('user_id', userId)
    .eq('personal_email', email)
    .maybeSingle();
    
  if (error) {
    console.error('Error finding contact by email:', error);
    return null;
  }
  
  return data;
}

// Add calendar event to interaction
async function addCalendarInteraction(userId: string, contactId: string, event: any) {
  try {
    // Format start time
    const startTime = event.start.dateTime || event.start.date;
    const formattedStartTime = new Date(startTime).toISOString();
    
    // Add interaction to contact's timeline
    const { data: interaction, error } = await supabase
      .from('interactions')
      .insert({
        user_id: userId,
        contact_id: contactId,
        type: 'meeting',
        date: formattedStartTime,
        notes: `Calendar event: ${event.summary}`,
        created_at: new Date().toISOString(),
        metadata: {
          event_id: event.id,
          summary: event.summary,
          description: event.description || '',
          location: event.location || '',
          start_time: startTime,
          end_time: event.end.dateTime || event.end.date
        }
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding calendar interaction:', error);
      return null;
    }
    
    return interaction;
  } catch (error) {
    console.error('Error adding calendar interaction:', error);
    return null;
  }
}

// Process calendar events
async function processCalendarEvents(userId: string, events: any[]) {
  const results = {
    processed: 0,
    interactions: {
      created: 0
    }
  };
  
  for (const event of events) {
    try {
      // Skip events without attendees or with empty attendees
      if (!event.attendees || event.attendees.length === 0) {
        continue;
      }
      
      // Process each attendee
      for (const attendee of event.attendees) {
        // Skip if no email
        if (!attendee.email) continue;
        
        // Skip self (calendar owner)
        if (attendee.self) continue;
        
        // Find contact by email
        const contact = await findContactByEmail(userId, attendee.email);
        if (!contact) continue;
        
        // Add event interaction
        const interaction = await addCalendarInteraction(userId, contact.id, event);
        if (interaction) {
          results.interactions.created++;
        }
      }
      
      results.processed++;
    } catch (error) {
      console.error(`Error processing calendar event ${event.id}:`, error);
    }
  }
  
  return results;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, days = 7, userId } = await req.json();
    const targetUserId = userId || user.id;
    
    switch (action) {
      case 'upcoming': {
        // Get Calendar token for the user
        const accessToken = await getCalendarToken(targetUserId);
        
        // Fetch upcoming events
        const events = await fetchUpcomingEvents(accessToken, days);
        
        // Store events in calendar_events table and process interactions
        await storeCalendarEvents(targetUserId, events);
        
        // Process events in background task
        if (typeof EdgeRuntime !== 'undefined') {
          EdgeRuntime.waitUntil(processCalendarEvents(targetUserId, events));
        } else {
          processCalendarEvents(targetUserId, events).catch(console.error);
        }
        
        return new Response(JSON.stringify(events), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'sync': {
        // Get Calendar token for the user
        const accessToken = await getCalendarToken(targetUserId);
        
        // Fetch upcoming events
        const events = await fetchUpcomingEvents(accessToken, days);
        
        // Store events in calendar_events table
        const storeResults = await storeCalendarEvents(targetUserId, events);
        
        // Process events and wait for result
        const results = await processCalendarEvents(targetUserId, events);
        
        return new Response(JSON.stringify({
          ...results,
          events_stored: storeResults.stored
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Calendar events error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
