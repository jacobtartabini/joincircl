
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityValidation {
  isValid: boolean;
  errors: string[];
}

function validateInput(data: any): SecurityValidation {
  const errors: string[] = [];

  if (!data.message || typeof data.message !== 'string') {
    errors.push('Message is required and must be a string');
  }

  if (data.message && data.message.length > 2000) {
    errors.push('Message exceeds maximum length of 2000 characters');
  }

  if (data.message && data.message.length < 1) {
    errors.push('Message cannot be empty');
  }

  // Check for potential injection attempts
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /function\s*\(/i
  ];

  if (dangerousPatterns.some(pattern => pattern.test(data.message))) {
    errors.push('Message contains potentially dangerous content');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove remaining brackets
    .substring(0, 2000); // Limit length
}

async function logSecurityEvent(supabase: any, userId: string, eventType: string, details: any) {
  try {
    await supabase
      .from('security_audit_logs')
      .insert([{
        user_id: userId,
        event_type: eventType,
        event_details: details,
        ip_address: 'edge-function',
        user_agent: 'supabase-edge-function'
      }]);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      await logSecurityEvent(supabaseClient, 'anonymous', 'unauthorized_access', {
        endpoint: '/secure-ai-chat',
        reason: 'no_user_token'
      });
      
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Parse request body
    const body = await req.json()
    
    // Validate input
    const validation = validateInput(body);
    if (!validation.isValid) {
      await logSecurityEvent(supabaseClient, user.id, 'suspicious_activity', {
        reason: 'invalid_input',
        errors: validation.errors,
        input: body.message?.substring(0, 100)
      });

      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.errors }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Rate limiting check (simple implementation)
    const rateLimitKey = `ai_chat_${user.id}`;
    const { data: recentRequests } = await supabaseClient
      .from('security_audit_logs')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('event_type', 'ai_chat_request')
      .gte('created_at', new Date(Date.now() - 60000).toISOString()); // Last minute

    if (recentRequests && recentRequests.length >= 10) {
      await logSecurityEvent(supabaseClient, user.id, 'rate_limit_exceeded', {
        endpoint: '/secure-ai-chat',
        request_count: recentRequests.length
      });

      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429 
        }
      )
    }

    // Sanitize input
    const sanitizedMessage = sanitizeInput(body.message);

    // Log the request
    await logSecurityEvent(supabaseClient, user.id, 'ai_chat_request', {
      message_length: sanitizedMessage.length,
      endpoint: '/secure-ai-chat'
    });

    // Get OpenRouter API key
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openrouterApiKey) {
      console.error('OpenRouter API key not found')
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Make request to OpenRouter with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://app.joincircl.com',
          'X-Title': 'Circl App'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            {
              role: 'system',
              content: 'You are Arlo, a helpful AI assistant for Circl, a professional networking and career development platform. Keep responses concise and professional.'
            },
            {
              role: 'user',
              content: sanitizedMessage
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      
      return new Response(
        JSON.stringify({ 
          response: data.choices?.[0]?.message?.content || 'No response generated',
          model: 'meta-llama/llama-3.1-8b-instruct:free'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (error) {
      clearTimeout(timeoutId);
      
      await logSecurityEvent(supabaseClient, user.id, 'suspicious_activity', {
        reason: 'ai_api_error',
        error: error.message
      });

      return new Response(
        JSON.stringify({ error: 'Failed to process request' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

  } catch (error) {
    console.error('Edge function error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
