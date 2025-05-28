
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Generate a random secret for TOTP
    const secret = generateBase32Secret()
    
    // Create QR code data (simplified - in production use proper QR library)
    const qrCodeUrl = `otpauth://totp/Circl:${user.email}?secret=${secret}&issuer=Circl`
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    )

    // Store 2FA setup data temporarily (you'd want to use a more secure method)
    const { error } = await supabaseClient
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        metadata: {
          two_fa_secret: secret,
          backup_codes: backupCodes,
          two_fa_enabled: false
        }
      })

    if (error) throw error

    return new Response(
      JSON.stringify({
        secret,
        qrCode: qrCodeUrl,
        backupCodes
      }),
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

function generateBase32Secret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < 32; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)]
  }
  return secret
}
