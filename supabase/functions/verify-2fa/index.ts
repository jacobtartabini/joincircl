
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get stored secret
    const { data: preferences } = await supabaseClient
      .from('user_preferences')
      .select('metadata')
      .eq('user_id', user.id)
      .single()

    if (!preferences?.metadata?.two_fa_secret) {
      throw new Error('2FA not setup')
    }

    // In a real implementation, verify the TOTP token
    // For demo purposes, accept any 6-digit code
    if (!/^\d{6}$/.test(token)) {
      throw new Error('Invalid token format')
    }

    // Enable 2FA
    const { error } = await supabaseClient
      .from('user_preferences')
      .update({
        metadata: {
          ...preferences.metadata,
          two_fa_enabled: true
        }
      })
      .eq('user_id', user.id)

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
