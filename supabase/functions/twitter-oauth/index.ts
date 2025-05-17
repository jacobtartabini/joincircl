
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TWITTER_CLIENT_ID = "RmNzRlpWUGJ2d05ITXpKdGJlMDY6MTpjaQ";
const TWITTER_CLIENT_SECRET = Deno.env.get("TWITTER_CLIENT_SECRET");
const REDIRECT_URI = "https://app.joincircl.com/auth/callback";

// Define CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the Auth context of the function
const supabaseClient = (req: Request) => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  {
    global: {
      headers: { Authorization: req.headers.get('Authorization')! },
    },
  }
);

// This function exchanges the Twitter OAuth code for an access token
async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<any> {
  const params = new URLSearchParams();
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  params.append('client_id', TWITTER_CLIENT_ID);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('code_verifier', codeVerifier);

  try {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`)}`
      },
      body: params
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Twitter token exchange error:", errorData);
      throw new Error(`Twitter API error: ${JSON.stringify(errorData)}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    throw error;
  }
}

// This function fetches the user profile from Twitter API
async function getTwitterProfile(accessToken: string): Promise<any> {
  try {
    const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,username,name', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Twitter profile fetch error:", errorData);
      throw new Error(`Twitter API error: ${JSON.stringify(errorData)}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching Twitter profile:", error);
    throw error;
  }
}

// Store the Twitter token in Supabase
async function storeTwitterToken(supabase: any, userId: string, tokenData: any, profile: any): Promise<void> {
  try {
    console.log("Storing Twitter token for user:", userId);
    
    // In a real app, we would store this in a social_integrations table
    const { error } = await supabase
      .from('social_integrations')
      .upsert({
        user_id: userId,
        platform: 'twitter',
        username: profile.data.username,
        display_name: profile.data.name,
        profile_url: `https://twitter.com/${profile.data.username}`,
        avatar_url: profile.data.profile_image_url,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        connected_at: new Date().toISOString(),
        last_synced: new Date().toISOString()
      });

    if (error) {
      console.error("Database error storing Twitter token:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error storing Twitter token:", error);
    throw error;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }
  
  try {
    // Get the auth code and code verifier from the request
    const { code, codeVerifier } = await req.json();
    
    if (!code || !codeVerifier) {
      return new Response(
        JSON.stringify({ error: "Missing authorization code or code verifier" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a supabase client with the user's context
    const supabase = supabaseClient(req);
    
    // Get the user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Processing OAuth callback for user:", session.user.id);
    
    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code, codeVerifier);
    console.log("Received Twitter token data");
    
    // Get Twitter profile
    const profile = await getTwitterProfile(tokenData.access_token);
    console.log("Retrieved Twitter profile for:", profile.data.username);
    
    // Store token and profile in Supabase
    await storeTwitterToken(supabase, session.user.id, tokenData, profile);
    console.log("Stored Twitter token and profile data");
    
    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          username: profile.data.username,
          displayName: profile.data.name,
          profileImageUrl: profile.data.profile_image_url
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Twitter OAuth error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
