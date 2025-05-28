
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Delete user data in the correct order (respecting foreign keys)
    await supabaseAdmin.from('interactions').delete().eq('user_id', user.id)
    await supabaseAdmin.from('keystones').delete().eq('user_id', user.id)
    await supabaseAdmin.from('contacts').delete().eq('user_id', user.id)
    await supabaseAdmin.from('user_preferences').delete().eq('user_id', user.id)
    await supabaseAdmin.from('user_sessions').delete().eq('user_id', user.id)
    await supabaseAdmin.from('user_integrations').delete().eq('user_id', user.id)
    await supabaseAdmin.from('user_subscriptions').delete().eq('user_id', user.id)
    await supabaseAdmin.from('profiles').delete().eq('id', user.id)

    // Finally delete the auth user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

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
