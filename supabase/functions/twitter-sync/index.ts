import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_MINUTE = 5;

function checkRateLimit(userId: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const userRateData = rateLimitMap.get(userId);
  
  if (!userRateData || now > userRateData.resetTime) {
    // Reset or initialize rate limit
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 });
    return { allowed: true, resetTime: now + 60000 };
  }
  
  if (userRateData.count >= MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, resetTime: userRateData.resetTime };
  }
  
  userRateData.count++;
  return { allowed: true, resetTime: userRateData.resetTime };
}

function createRateLimitResponse(resetTime?: number) {
  const resetInSeconds = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60;
  return new Response(
    JSON.stringify({ 
      error: 'Rate limit exceeded',
      message: `Too many requests. Try again in ${resetInSeconds} seconds.`
    }), 
    {
      status: 429,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Retry-After': resetInSeconds.toString()
      }
    }
  );
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get Twitter token for user
async function getTwitterToken(userId: string) {
  console.log(`Getting Twitter token for user ${userId}`);
  
  const { data, error } = await supabase
    .from('user_social_integrations')
    .select('access_token, refresh_token, expires_at, username')
    .eq('user_id', userId)
    .eq('platform', 'twitter')
    .single();

  if (error || !data) {
    throw new Error('Twitter token not found');
  }

  // Check if token is expired
  if (new Date(data.expires_at) <= new Date()) {
    throw new Error('Twitter token expired');
  }

  return data;
}

// Fetch recent tweets from contacts with Twitter handles
async function fetchTweetsFromContacts(userId: string, accessToken: string) {
  console.log(`Fetching tweets from contacts for user ${userId}`);
  
  // Get contacts with Twitter handles
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, name, twitter')
    .eq('user_id', userId)
    .not('twitter', 'is', null)
    .not('twitter', 'eq', '');

  if (!contacts || contacts.length === 0) {
    console.log('No contacts with Twitter handles found');
    return { processed: 0, tweets: 0, errors: [] };
  }

  console.log(`Found ${contacts.length} contacts with Twitter handles`);

  const results = {
    processed: 0,
    tweets: 0,
    errors: [] as string[]
  };

  // Process each contact
  for (const contact of contacts) {
    try {
      results.processed++;
      
      // Extract username from Twitter URL or handle
      let username = contact.twitter;
      if (username.includes('twitter.com') || username.includes('x.com')) {
        const match = username.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/);
        if (match) username = match[1];
      }
      username = username.replace('@', '');

      console.log(`Fetching tweets for contact ${contact.name} (@${username})`);

      // Get user ID from username
      const userResponse = await fetch(
        `https://api.twitter.com/2/users/by/username/${username}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!userResponse.ok) {
        const error = `Failed to get user ID for @${username}: ${userResponse.status}`;
        results.errors.push(error);
        console.error(error);
        continue;
      }

      const userData = await userResponse.json();
      if (!userData.data?.id) {
        results.errors.push(`User @${username} not found`);
        continue;
      }

      // Fetch recent tweets
      const tweetsResponse = await fetch(
        `https://api.twitter.com/2/users/${userData.data.id}/tweets?max_results=10&tweet.fields=created_at,public_metrics,text&exclude=retweets,replies`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!tweetsResponse.ok) {
        const error = `Failed to fetch tweets for @${username}: ${tweetsResponse.status}`;
        results.errors.push(error);
        console.error(error);
        continue;
      }

      const tweetsData = await tweetsResponse.json();
      const tweets = tweetsData.data || [];

      console.log(`Found ${tweets.length} tweets for @${username}`);

      // Store tweets in database
      for (const tweet of tweets) {
        try {
          const { error: insertError } = await supabase
            .from('social_posts')
            .upsert({
              user_id: userId,
              contact_id: contact.id,
              platform: 'twitter',
              post_id: tweet.id,
              content: tweet.text,
              summary: tweet.text.length > 100 ? 
                tweet.text.substring(0, 100) + '...' : 
                tweet.text,
              post_url: `https://twitter.com/${username}/status/${tweet.id}`,
              posted_at: tweet.created_at,
              metadata: {
                public_metrics: tweet.public_metrics,
                username: username
              }
            }, { 
              onConflict: 'user_id,platform,post_id' 
            });

          if (insertError) {
            console.error(`Error storing tweet ${tweet.id}:`, insertError);
            results.errors.push(`Error storing tweet ${tweet.id}: ${insertError.message}`);
          } else {
            results.tweets++;
          }
        } catch (error) {
          console.error(`Error processing tweet ${tweet.id}:`, error);
          results.errors.push(`Error processing tweet ${tweet.id}: ${error.message}`);
        }
      }

    } catch (error) {
      console.error(`Error processing contact ${contact.name}:`, error);
      results.errors.push(`Error processing contact ${contact.name}: ${error.message}`);
    }
  }

  return results;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId } = await req.json();

    // Get user ID from auth if not provided
    let targetUserId = userId;
    if (!targetUserId) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      targetUserId = user.id;
    }

    // Check rate limit
    const rateLimitResult = checkRateLimit(targetUserId);
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for user ${targetUserId}`);
      return createRateLimitResponse(rateLimitResult.resetTime);
    }

    console.log(`Twitter sync requested for user ${targetUserId}, action: ${action} at ${new Date().toISOString()}`);

    switch (action) {
      case 'sync': {
        // Get Twitter token
        const tokenData = await getTwitterToken(targetUserId);
        
        // Fetch tweets from contacts
        const results = await fetchTweetsFromContacts(targetUserId, tokenData.access_token);

        return new Response(JSON.stringify({
          success: true,
          results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Twitter sync error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});