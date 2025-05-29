
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode } from 'https://deno.land/std@0.195.0/encoding/base32.ts'

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

    // Generate a cryptographically secure secret for TOTP
    const secret = generateSecureBase32Secret()
    
    // Create QR code data for TOTP with proper issuer and account name
    const issuer = 'Circl'
    const accountName = `${issuer}:${user.email}`
    const qrCodeUrl = `otpauth://totp/${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`
    
    // Generate 8 backup codes (each 8 characters)
    const backupCodes = generateBackupCodes(8)

    // Check if user already has preferences
    const { data: existingPrefs } = await supabaseClient
      .from('user_preferences')
      .select('metadata')
      .eq('user_id', user.id)
      .single()

    const currentMetadata = existingPrefs?.metadata || {}

    // Store 2FA setup data temporarily (not enabled until verified)
    const { error } = await supabaseClient
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        metadata: {
          ...currentMetadata,
          two_fa_secret: secret,
          backup_codes: backupCodes,
          two_fa_enabled: false // Not enabled until verified
        }
      })

    if (error) throw error

    console.log(`2FA setup initiated for user: ${user.id}`)

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
    console.error('2FA setup error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function generateSecureBase32Secret(): string {
  // Generate 160 bits (20 bytes) of random data for strong security
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  
  // Convert to base32 for TOTP compatibility
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i]
    secret += chars[byte >> 3] // Use top 5 bits
    if (i < bytes.length - 1) {
      const nextByte = bytes[i + 1] || 0
      secret += chars[((byte & 0x07) << 2) | (nextByte >> 6)] // Use bottom 3 bits + top 2 of next
    }
  }
  
  // Ensure we have exactly 32 characters
  return secret.substring(0, 32).padEnd(32, 'A')
}

function generateBackupCodes(count: number): string[] {
  const codes = []
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = Array.from({ length: 8 }, () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      return chars[Math.floor(Math.random() * chars.length)]
    }).join('')
    codes.push(code)
  }
  return codes
}
