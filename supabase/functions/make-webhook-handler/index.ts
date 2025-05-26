
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface WebhookPayload {
  userId: string;
  triggerType: 'reconnect_reminder' | 'weekly_digest' | 'contact_sync' | 'message_automation';
  data: any;
  timestamp: string;
  source: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();
    console.log('Received Make webhook:', payload);

    // Verify the webhook source
    if (payload.source !== 'circl-app') {
      throw new Error('Invalid webhook source');
    }

    let result;
    
    switch (payload.triggerType) {
      case 'reconnect_reminder':
        result = await handleReconnectReminder(payload);
        break;
      case 'weekly_digest':
        result = await handleWeeklyDigest(payload);
        break;
      case 'contact_sync':
        result = await handleContactSync(payload);
        break;
      case 'message_automation':
        result = await handleMessageAutomation(payload);
        break;
      default:
        throw new Error(`Unknown trigger type: ${payload.triggerType}`);
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleReconnectReminder(payload: WebhookPayload) {
  const { userId, data } = payload;
  const { contacts, preferences } = data;

  // Generate AI-powered reconnection suggestions for each contact
  const suggestions = [];
  
  for (const contact of contacts) {
    try {
      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            {
              role: 'system',
              content: 'You are a relationship assistant helping users reconnect with contacts. Generate a brief, personalized suggestion for why and how to reconnect.'
            },
            {
              role: 'user',
              content: `Contact: ${contact.name}, Company: ${contact.company_name || 'Unknown'}, Last contact: ${contact.last_contact || 'Never'}, Circle: ${contact.circle}. Suggest how to reconnect.`
            }
          ],
          max_tokens: 150
        })
      });

      const aiResult = await aiResponse.json();
      const suggestion = aiResult.choices?.[0]?.message?.content || 'Consider reaching out to reconnect!';

      suggestions.push({
        contactId: contact.id,
        contactName: contact.name,
        suggestion,
        urgency: contact.circle === 'inner' ? 'high' : contact.circle === 'middle' ? 'medium' : 'low'
      });
    } catch (error) {
      console.error(`Error generating suggestion for ${contact.name}:`, error);
    }
  }

  // Store suggestions in database
  for (const suggestion of suggestions) {
    await supabase.from('automation_suggestions').insert({
      user_id: userId,
      contact_id: suggestion.contactId,
      type: 'reconnect_reminder',
      suggestion: suggestion.suggestion,
      urgency: suggestion.urgency,
      created_at: new Date().toISOString()
    });
  }

  return { suggestionsGenerated: suggestions.length };
}

async function handleWeeklyDigest(payload: WebhookPayload) {
  const { userId, data } = payload;
  const { recentInteractions, contactStats, preferences } = data;

  // Generate AI digest content
  const digestPrompt = `Generate a weekly relationship digest for a user with ${contactStats.total} contacts (${contactStats.inner} inner circle, ${contactStats.middle} middle circle, ${contactStats.outer} outer circle). They had ${recentInteractions.length} interactions this week. Create an encouraging, personalized summary with 2-3 specific action items for next week.`;

  try {
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a relationship coach creating weekly digests. Be encouraging and specific.'
          },
          {
            role: 'user',
            content: digestPrompt
          }
        ],
        max_tokens: 300
      })
    });

    const aiResult = await aiResponse.json();
    const digestContent = aiResult.choices?.[0]?.message?.content || 'Great work on your relationships this week!';

    // Store weekly digest
    await supabase.from('weekly_digests').insert({
      user_id: userId,
      content: digestContent,
      stats: contactStats,
      interaction_count: recentInteractions.length,
      created_at: new Date().toISOString()
    });

    return { digestGenerated: true, content: digestContent };
  } catch (error) {
    console.error('Error generating weekly digest:', error);
    return { digestGenerated: false, error: error.message };
  }
}

async function handleContactSync(payload: WebhookPayload) {
  const { userId, data } = payload;
  const { contacts, platform, syncDirection } = data;

  // Log sync attempt
  await supabase.from('sync_logs').insert({
    user_id: userId,
    platform,
    direction: syncDirection,
    contact_count: contacts.length,
    status: 'initiated',
    created_at: new Date().toISOString()
  });

  // Return contact data for Make to process
  return {
    syncInitiated: true,
    platform,
    contactCount: contacts.length,
    contacts: contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      email: contact.personal_email,
      phone: contact.mobile_phone,
      company: contact.company_name
    }))
  };
}

async function handleMessageAutomation(payload: WebhookPayload) {
  const { userId, data } = payload;
  const { contact, message, channel } = data;

  // Log automation attempt
  await supabase.from('message_automations').insert({
    user_id: userId,
    contact_id: contact.id,
    message,
    channel,
    status: 'sent',
    created_at: new Date().toISOString()
  });

  return {
    messageProcessed: true,
    contactName: contact.name,
    channel,
    timestamp: new Date().toISOString()
  };
}
