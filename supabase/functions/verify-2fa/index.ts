
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
    const { token, isBackupCode = false } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get stored secret and backup codes
    const { data: preferences } = await supabaseClient
      .from('user_preferences')
      .select('metadata')
      .eq('user_id', user.id)
      .single()

    if (!preferences?.metadata?.two_fa_secret) {
      throw new Error('2FA not setup')
    }

    let isValid = false

    if (isBackupCode) {
      // Check if token is a valid backup code
      const backupCodes = preferences.metadata.backup_codes || []
      isValid = backupCodes.includes(token.toUpperCase())
      
      if (isValid) {
        // Remove the used backup code
        const updatedBackupCodes = backupCodes.filter((code: string) => code !== token.toUpperCase())
        await supabaseClient
          .from('user_preferences')
          .update({
            metadata: {
              ...preferences.metadata,
              backup_codes: updatedBackupCodes
            }
          })
          .eq('user_id', user.id)
        
        console.log(`Backup code used for user: ${user.id}`)
      }
    } else {
      // Validate TOTP token
      if (!/^\d{6}$/.test(token)) {
        throw new Error('Invalid token format')
      }

      isValid = validateTOTP(preferences.metadata.two_fa_secret, token)
    }

    if (!isValid) {
      throw new Error('Invalid verification code')
    }

    // Enable 2FA if verification successful
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

    console.log(`2FA enabled for user: ${user.id}`)

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('2FA verification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function validateTOTP(secret: string, token: string): boolean {
  const window = 1 // Allow 1 time step before/after for clock drift
  const timeStep = 30 // TOTP time step in seconds
  const currentTime = Math.floor(Date.now() / 1000 / timeStep)
  
  // Check current time and adjacent windows
  for (let i = -window; i <= window; i++) {
    const timeCounter = currentTime + i
    const expectedToken = generateTOTP(secret, timeCounter)
    if (expectedToken === token) {
      return true
    }
  }
  
  return false
}

function generateTOTP(secret: string, timeCounter: number): string {
  // Convert secret from base32 to bytes
  const secretBytes = base32ToBytes(secret)
  
  // Convert time counter to 8-byte array (big-endian)
  const timeBytes = new ArrayBuffer(8)
  const timeView = new DataView(timeBytes)
  timeView.setUint32(4, timeCounter, false) // big-endian
  
  // Generate HMAC-SHA1
  const hmac = hmacSha1(secretBytes, new Uint8Array(timeBytes))
  
  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f
  const code = ((hmac[offset] & 0x7f) << 24) |
               ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) |
               (hmac[offset + 3] & 0xff)
  
  // Return 6-digit code
  return (code % 1000000).toString().padStart(6, '0')
}

function base32ToBytes(base32: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const cleanBase32 = base32.toUpperCase().replace(/[^A-Z2-7]/g, '')
  
  let bits = ''
  for (const char of cleanBase32) {
    const index = chars.indexOf(char)
    if (index === -1) continue
    bits += index.toString(2).padStart(5, '0')
  }
  
  const bytes = new Uint8Array(Math.floor(bits.length / 8))
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substr(i * 8, 8), 2)
  }
  
  return bytes
}

async function hmacSha1(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data)
  return new Uint8Array(signature)
}
