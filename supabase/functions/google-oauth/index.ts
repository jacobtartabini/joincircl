
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
const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Handle token exchange for Google OAuth
async function exchangeGoogleCode(code: string, redirectUri: string, scope: string) {
  const googleClientId = "1082106594085-er19ne14fh1si3391t8rbls3jfsbppa2.apps.googleusercontent.com";
  
  console.log(`Exchanging code for token with redirect URI: ${redirectUri}`);
  
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
    console.error('Google OAuth token exchange failed:', error);
    throw new Error(`Google OAuth token exchange failed: ${JSON.stringify(error)}`);
  }

  const tokenData = await tokenResponse.json();
  
  // Determine if this is Gmail or Calendar based on scope
  const isGmail = scope.includes('gmail');
  const isCalendar = scope.includes('calendar');
  const provider = isGmail ? 'gmail' : isCalendar ? 'calendar' : 'google';
  
  return {
    tokenData,
    provider
  };
}

// Handle token refresh for Google OAuth
async function refreshGoogleToken(refreshToken: string, provider: string) {
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

// Fetch user profile from Google
async function fetchGoogleUserInfo(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch Google user info: ${JSON.stringify(error)}`);
  }
  
  return await response.json();
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

    const { action, code, redirectUri, refreshToken, scope, provider } = await req.json();

    let response;
    switch (action) {
      case 'exchange':
        if (!code || !redirectUri || !scope) {
          throw new Error('Missing required parameters for token exchange');
        }
        
        console.log(`Processing exchange action with redirectUri: ${redirectUri}`);
        
        try {
          const result = await exchangeGoogleCode(code, redirectUri, scope);
          response = result.tokenData;
          
          // Get Google user info
          const userInfo = await fetchGoogleUserInfo(response.access_token);
          
          // Store in appropriate table based on provider
          await storeGoogleToken(user.id, result.provider, response, userInfo);
        } catch (exchangeError) {
          console.error("Error during code exchange:", exchangeError);
          
          // Check specifically for redirect_uri_mismatch error
          if (exchangeError.message && 
              (exchangeError.message.includes('redirect_uri_mismatch') || 
               exchangeError.message.includes('redirect'))) {
            return new Response(
              JSON.stringify({ 
                error: 'redirect_uri_mismatch', 
                message: 'The redirect URI does not match the one registered in the Google Cloud Console.' 
              }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
          
          throw exchangeError;
        }
        break;
        
      case 'refresh':
        if (!refreshToken || !provider) {
          throw new Error('Missing refresh token or provider');
        }
        response = await refreshGoogleToken(refreshToken, provider);
        
        // Update token in database
        const expiresAt = new Date(Date.now() + response.expires_in * 1000);
        
        if (provider === 'gmail') {
          await supabase
            .from('user_email_tokens')
            .update({
              access_token: response.access_token,
              expires_at: expiresAt.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('provider', 'gmail');
        } else if (provider === 'calendar') {
          await supabase
            .from('user_calendar_tokens')
            .update({
              access_token: response.access_token,
              expires_at: expiresAt.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('provider', 'google');
        }
        break;
        
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Google OAuth error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Store Google token in appropriate table
async function storeGoogleToken(userId: string, provider: string, tokenData: any, userInfo: any) {
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
  
  if (provider === 'gmail') {
    // Store Gmail token
    const { error } = await supabase
      .from('user_email_tokens')
      .upsert({
        user_id: userId,
        provider: 'gmail',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        username: userInfo.email,
        email: userInfo.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error storing Gmail token:', error);
      throw error;
    }
  } else if (provider === 'calendar') {
    // Store Calendar token
    const { error } = await supabase
      .from('user_calendar_tokens')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error storing Calendar token:', error);
      throw error;
    }
  }
}
