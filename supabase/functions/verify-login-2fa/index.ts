
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
    const { email, password, totpCode, isBackupCode = false } = await req.json()

    if (!email || !password || !totpCode) {
      throw new Error('Email, password, and TOTP code are required')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // First, authenticate with email/password
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      throw new Error('Invalid email or password')
    }

    if (!authData.user) {
      throw new Error('Authentication failed')
    }

    // Check if user has 2FA enabled
    const { data: preferences } = await supabaseClient
      .from('user_preferences')
      .select('metadata')
      .eq('user_id', authData.user.id)
      .single()

    if (!preferences?.metadata?.two_fa_enabled) {
      // 2FA not enabled, regular login is sufficient
      return new Response(
        JSON.stringify({ 
          success: true, 
          session: authData.session,
          requires2FA: false 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Validate TOTP code
    let isValidCode = false

    if (isBackupCode) {
      // Check backup code
      const backupCodes = preferences.metadata.backup_codes || []
      isValidCode = backupCodes.includes(totpCode.toUpperCase())
      
      if (isValidCode) {
        // Remove used backup code
        const updatedBackupCodes = backupCodes.filter((code: string) => code !== totpCode.toUpperCase())
        await supabaseClient
          .from('user_preferences')
          .update({
            metadata: {
              ...preferences.metadata,
              backup_codes: updatedBackupCodes
            }
          })
          .eq('user_id', authData.user.id)
        
        console.log(`Backup code used during login for user: ${authData.user.id}`)
      }
    } else {
      // Validate TOTP
      if (!/^\d{6}$/.test(totpCode)) {
        throw new Error('Invalid TOTP code format')
      }

      isValidCode = validateTOTP(preferences.metadata.two_fa_secret, totpCode)
    }

    if (!isValidCode) {
      // Sign out the user since 2FA failed
      await supabaseClient.auth.signOut()
      throw new Error('Invalid 2FA code')
    }

    console.log(`Successful 2FA login for user: ${authData.user.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        session: authData.session,
        requires2FA: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('2FA login verification error:', error)
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
  const window = 1
  const timeStep = 30
  const currentTime = Math.floor(Date.now() / 1000 / timeStep)
  
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
  const secretBytes = base32ToBytes(secret)
  const timeBytes = new ArrayBuffer(8)
  const timeView = new DataView(timeBytes)
  timeView.setUint32(4, timeCounter, false)
  
  return hmacSha1Sync(secretBytes, new Uint8Array(timeBytes))
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

function hmacSha1Sync(key: Uint8Array, data: Uint8Array): string {
  // Simplified HMAC-SHA1 for TOTP (this is a basic implementation)
  // In production, you might want to use a more robust crypto library
  
  const blockSize = 64
  const outputSize = 20
  
  if (key.length > blockSize) {
    // Hash key if it's longer than block size
    key = sha1(key)
  }
  
  const keyPad = new Uint8Array(blockSize)
  keyPad.set(key)
  
  const oKeyPad = new Uint8Array(blockSize)
  const iKeyPad = new Uint8Array(blockSize)
  
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = keyPad[i] ^ 0x5c
    iKeyPad[i] = keyPad[i] ^ 0x36
  }
  
  const innerData = new Uint8Array(blockSize + data.length)
  innerData.set(iKeyPad)
  innerData.set(data, blockSize)
  
  const innerHash = sha1(innerData)
  
  const outerData = new Uint8Array(blockSize + outputSize)
  outerData.set(oKeyPad)
  outerData.set(innerHash, blockSize)
  
  const hmac = sha1(outerData)
  
  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f
  const code = ((hmac[offset] & 0x7f) << 24) |
               ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) |
               (hmac[offset + 3] & 0xff)
  
  return (code % 1000000).toString().padStart(6, '0')
}

function sha1(data: Uint8Array): Uint8Array {
  // Basic SHA-1 implementation (simplified for demo)
  // In production, use crypto.subtle.digest or a proper library
  
  const h = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0]
  
  const paddedData = new Uint8Array(Math.ceil((data.length + 9) / 64) * 64)
  paddedData.set(data)
  paddedData[data.length] = 0x80
  
  const bitLength = data.length * 8
  const view = new DataView(paddedData.buffer)
  view.setUint32(paddedData.length - 4, bitLength & 0xffffffff, false)
  view.setUint32(paddedData.length - 8, Math.floor(bitLength / 0x100000000), false)
  
  for (let chunk = 0; chunk < paddedData.length; chunk += 64) {
    const w = new Array(80)
    
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(chunk + i * 4, false)
    }
    
    for (let i = 16; i < 80; i++) {
      w[i] = rotateLeft(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1)
    }
    
    let [a, b, c, d, e] = h
    
    for (let i = 0; i < 80; i++) {
      let f, k
      if (i < 20) {
        f = (b & c) | (~b & d)
        k = 0x5A827999
      } else if (i < 40) {
        f = b ^ c ^ d
        k = 0x6ED9EBA1
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d)
        k = 0x8F1BBCDC
      } else {
        f = b ^ c ^ d
        k = 0xCA62C1D6
      }
      
      const temp = (rotateLeft(a, 5) + f + e + k + w[i]) & 0xffffffff
      e = d
      d = c
      c = rotateLeft(b, 30)
      b = a
      a = temp
    }
    
    h[0] = (h[0] + a) & 0xffffffff
    h[1] = (h[1] + b) & 0xffffffff
    h[2] = (h[2] + c) & 0xffffffff
    h[3] = (h[3] + d) & 0xffffffff
    h[4] = (h[4] + e) & 0xffffffff
  }
  
  const result = new Uint8Array(20)
  const resultView = new DataView(result.buffer)
  for (let i = 0; i < 5; i++) {
    resultView.setUint32(i * 4, h[i], false)
  }
  
  return result
}

function rotateLeft(value: number, shift: number): number {
  return ((value << shift) | (value >>> (32 - shift))) & 0xffffffff
}
