
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

// Get Gmail token for the user
async function getGmailToken(userId: string) {
  const { data, error } = await supabase
    .from('user_email_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .eq('provider', 'gmail')
    .single();

  if (error || !data) {
    throw new Error('Gmail token not found');
  }

  // Check if token is expired
  if (new Date(data.expires_at) <= new Date()) {
    // Token is expired, refresh it
    const refreshedToken = await refreshGmailToken(userId, data.refresh_token);
    return refreshedToken;
  }

  return data.access_token;
}

// Refresh Gmail token
async function refreshGmailToken(userId: string, refreshToken: string) {
  try {
    const { data, error } = await supabase.functions.invoke('google-oauth', {
      body: {
        action: 'refresh',
        refreshToken,
        provider: 'gmail'
      }
    });

    if (error || !data) {
      throw new Error(`Failed to refresh Gmail token: ${error}`);
    }

    // Update token in database
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);
    
    await supabase
      .from('user_email_tokens')
      .update({
        access_token: data.access_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('provider', 'gmail');

    return data.access_token;
  } catch (error) {
    console.error('Error refreshing Gmail token:', error);
    throw error;
  }
}

// Fetch recent Gmail messages
async function fetchRecentEmails(accessToken: string, limit = 10) {
  try {
    // Fetch message list
    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!listResponse.ok) {
      const error = await listResponse.json();
      throw new Error(`Gmail API error: ${JSON.stringify(error)}`);
    }

    const listData = await listResponse.json();
    const messages = listData.messages || [];

    // Fetch details for each message
    const detailedMessages = await Promise.all(
      messages.map(async (msg: { id: string }) => {
        const msgResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!msgResponse.ok) {
          console.error(`Failed to fetch message ${msg.id}`);
          return null;
        }

        return await msgResponse.json();
      })
    );

    // Extract relevant data from messages
    return detailedMessages
      .filter((msg): msg is any => msg !== null)
      .map((msg) => {
        const headers = msg.payload.headers;
        const from = headers.find((h: any) => h.name === 'From')?.value || '';
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(no subject)';
        const date = headers.find((h: any) => h.name === 'Date')?.value || '';
        
        // Extract email address from the from field (which might be "Name <email@example.com>")
        let senderEmail = from;
        const emailMatch = from.match(/<([^>]+)>/);
        if (emailMatch) {
          senderEmail = emailMatch[1];
        }
        
        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: msg.snippet,
          from,
          senderEmail,
          subject,
          date,
          receivedAt: new Date(date).toISOString(),
          labels: msg.labelIds || []
        };
      });
  } catch (error) {
    console.error('Error fetching Gmail messages:', error);
    throw error;
  }
}

// Update or create a contact based on email
async function updateOrCreateContact(userId: string, email: string, name: string) {
  try {
    // First check if the contact exists by email
    const { data: existingContact, error: findError } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, email')
      .eq('user_id', userId)
      .eq('email', email)
      .maybeSingle();
    
    if (findError) {
      console.error('Error searching for contact:', findError);
      return null;
    }
    
    if (existingContact) {
      // Return existing contact
      return existingContact;
    } else {
      // No matching contact found, create a new one
      
      // Parse the name
      let firstName = name;
      let lastName = "";
      
      // If the name contains a space, split it into first and last name
      if (name.includes(' ')) {
        const nameParts = name.split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      }
      
      // Create new contact
      const { data: newContact, error: createError } = await supabase
        .from('contacts')
        .insert({
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating contact:', createError);
        return null;
      }
      
      return newContact;
    }
  } catch (error) {
    console.error('Error updating or creating contact:', error);
    return null;
  }
}

// Add email interaction to contact
async function addEmailInteraction(userId: string, contactId: string, emailData: any) {
  try {
    // Add interaction to contact's timeline
    const { data: interaction, error } = await supabase
      .from('interactions')
      .insert({
        user_id: userId,
        contact_id: contactId,
        type: 'email',
        date: emailData.receivedAt,
        notes: `Email: ${emailData.subject}`,
        created_at: new Date().toISOString(),
        metadata: {
          email_id: emailData.id,
          thread_id: emailData.threadId,
          subject: emailData.subject,
          sender: emailData.from,
          snippet: emailData.snippet
        }
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding interaction:', error);
      return null;
    }
    
    return interaction;
  } catch (error) {
    console.error('Error adding email interaction:', error);
    return null;
  }
}

// Process emails and add interactions
async function processEmails(userId: string, emails: any[]) {
  const results = {
    processed: 0,
    contacts: {
      created: 0,
      updated: 0
    },
    interactions: {
      created: 0
    }
  };
  
  for (const email of emails) {
    try {
      // Skip emails without a valid sender email
      if (!email.senderEmail || !email.senderEmail.includes('@')) {
        continue;
      }
      
      // Extract sender's name from the From field
      const senderName = email.from.split('<')[0].trim().replace(/"/g, '') || 'Unknown';
      
      // Update or create contact
      const contact = await updateOrCreateContact(userId, email.senderEmail, senderName);
      if (!contact) continue;
      
      if (contact.created_at === contact.updated_at) {
        results.contacts.created++;
      } else {
        results.contacts.updated++;
      }
      
      // Add email interaction
      const interaction = await addEmailInteraction(userId, contact.id, email);
      if (interaction) {
        results.interactions.created++;
      }
      
      results.processed++;
    } catch (error) {
      console.error(`Error processing email ${email.id}:`, error);
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

    const { action, limit = 10 } = await req.json();
    
    switch (action) {
      case 'recent': {
        // Get Gmail token for the user
        const accessToken = await getGmailToken(user.id);
        
        // Fetch recent emails
        const emails = await fetchRecentEmails(accessToken, limit);
        
        // Process emails in background task in Edge Runtime environment
        EdgeRuntime.waitUntil(processEmails(user.id, emails));
        
        return new Response(JSON.stringify(emails), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'sync': {
        // Get Gmail token for the user
        const accessToken = await getGmailToken(user.id);
        
        // Fetch recent emails
        const emails = await fetchRecentEmails(accessToken, limit);
        
        // Process emails and wait for result
        const results = await processEmails(user.id, emails);
        
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Gmail fetch error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
