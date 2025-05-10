
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Handle token exchange for Google OAuth
async function exchangeGoogleAuthCode(code: string, redirectUri: string) {
  const googleClientId = "1082106594085-er19ne14fh1si3391t8rbls3jfsbppa2.apps.googleusercontent.com";
  
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.json();
    throw new Error(`Google OAuth token exchange failed: ${JSON.stringify(error)}`);
  }

  return await tokenResponse.json();
}

// Handle token refresh for Google OAuth
async function refreshGoogleToken(refreshToken: string) {
  const googleClientId = "1082106594085-er19ne14fh1si3391t8rbls3jfsbppa2.apps.googleusercontent.com";
  
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.json();
    throw new Error(`Google OAuth token refresh failed: ${JSON.stringify(error)}`);
  }

  return await tokenResponse.json();
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

    const { action, code, redirectUri, refreshToken } = await req.json();

    let response;
    switch (action) {
      case 'exchange':
        if (!code || !redirectUri) {
          throw new Error('Missing required parameters for token exchange');
        }
        response = await exchangeGoogleAuthCode(code, redirectUri);
        break;
      case 'refresh':
        if (!refreshToken) {
          throw new Error('Missing refresh token');
        }
        response = await refreshGoogleToken(refreshToken);
        break;
      default:
        throw new Error('Invalid action');
    }

    // Store tokens in database
    if (action === 'exchange') {
      const expiresAt = new Date(Date.now() + response.expires_in * 1000);
      
      const { error } = await supabase
        .from('user_calendar_tokens')
        .upsert({
          user_id: user.id,
          provider: 'google',
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_at: expiresAt.toISOString(),
        });
      
      if (error) {
        console.error('Error storing token:', error);
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Calendar auth error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
