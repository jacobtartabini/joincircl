import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get all users with active integrations
async function getUsersWithActiveIntegrations() {
  console.log("Fetching users with active integrations...");
  
  const { data: emailUsers } = await supabase
    .from('user_email_tokens')
    .select('user_id, provider, last_synced, sync_enabled, sync_frequency')
    .eq('sync_enabled', true);

  const { data: socialUsers } = await supabase
    .from('user_social_integrations')
    .select('user_id, platform, last_synced, sync_enabled, sync_frequency')
    .eq('sync_enabled', true);

  const { data: calendarUsers } = await supabase
    .from('user_calendar_tokens')
    .select('user_id, provider, last_synced, sync_enabled, sync_frequency')
    .where('sync_enabled', 'eq', true);

  return { emailUsers: emailUsers || [], socialUsers: socialUsers || [], calendarUsers: calendarUsers || [] };
}

// Check if user needs sync based on frequency
function needsSync(lastSynced: string | null, frequency: number): boolean {
  if (!lastSynced) return true;
  
  const lastSyncTime = new Date(lastSynced);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastSyncTime.getTime()) / (1000 * 60);
  
  return diffMinutes >= frequency;
}

// Sync Gmail for a user
async function syncGmail(userId: string) {
  try {
    console.log(`Syncing Gmail for user ${userId}`);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/gmail-fetch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'sync',
        limit: 20,
        userId 
      }),
    });

    if (!response.ok) {
      throw new Error(`Gmail sync failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Gmail sync completed for user ${userId}:`, data);

    // Update last synced time
    await supabase
      .from('user_email_tokens')
      .update({ last_synced: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('provider', 'gmail');

    return data;
  } catch (error) {
    console.error(`Error syncing Gmail for user ${userId}:`, error);
    return null;
  }
}

// Sync Google Calendar for a user
async function syncGoogleCalendar(userId: string) {
  try {
    console.log(`Syncing Google Calendar for user ${userId}`);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/calendar-events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'sync',
        userId 
      }),
    });

    if (!response.ok) {
      throw new Error(`Calendar sync failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Calendar sync completed for user ${userId}:`, data);

    // Update last synced time
    await supabase
      .from('user_calendar_tokens')
      .update({ last_synced: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('provider', 'google');

    return data;
  } catch (error) {
    console.error(`Error syncing Calendar for user ${userId}:`, error);
    return null;
  }
}

// Sync Twitter for a user
async function syncTwitter(userId: string) {
  try {
    console.log(`Syncing Twitter for user ${userId}`);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/twitter-sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'sync',
        userId 
      }),
    });

    if (!response.ok) {
      throw new Error(`Twitter sync failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Twitter sync completed for user ${userId}:`, data);

    // Update last synced time
    await supabase
      .from('user_social_integrations')
      .update({ last_synced: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('platform', 'twitter');

    return data;
  } catch (error) {
    console.error(`Error syncing Twitter for user ${userId}:`, error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting social sync scheduler...");
    
    const { emailUsers, socialUsers, calendarUsers } = await getUsersWithActiveIntegrations();
    
    const syncResults = {
      gmail: { attempted: 0, successful: 0, failed: 0 },
      calendar: { attempted: 0, successful: 0, failed: 0 },
      twitter: { attempted: 0, successful: 0, failed: 0 },
    };

    // Process Gmail users
    for (const user of emailUsers) {
      if (user.provider === 'gmail' && needsSync(user.last_synced, user.sync_frequency || 15)) {
        syncResults.gmail.attempted++;
        const result = await syncGmail(user.user_id);
        if (result) {
          syncResults.gmail.successful++;
        } else {
          syncResults.gmail.failed++;
        }
      }
    }

    // Process Calendar users
    for (const user of calendarUsers || []) {
      if (user.provider === 'google' && needsSync(user.last_synced, user.sync_frequency || 15)) {
        syncResults.calendar.attempted++;
        const result = await syncGoogleCalendar(user.user_id);
        if (result) {
          syncResults.calendar.successful++;
        } else {
          syncResults.calendar.failed++;
        }
      }
    }

    // Process Twitter users
    for (const user of socialUsers) {
      if (user.platform === 'twitter' && needsSync(user.last_synced, user.sync_frequency || 15)) {
        syncResults.twitter.attempted++;
        const result = await syncTwitter(user.user_id);
        if (result) {
          syncResults.twitter.successful++;
        } else {
          syncResults.twitter.failed++;
        }
      }
    }

    console.log("Sync scheduler completed:", syncResults);

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      results: syncResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Sync scheduler error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});