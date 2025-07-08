
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const togetherApiKey = Deno.env.get('TOGETHER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_MINUTE = 20;

function checkRateLimit(clientId: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const clientRateData = rateLimitMap.get(clientId);
  
  if (!clientRateData || now > clientRateData.resetTime) {
    // Reset or initialize rate limit
    rateLimitMap.set(clientId, { count: 1, resetTime: now + 60000 });
    return { allowed: true, resetTime: now + 60000 };
  }
  
  if (clientRateData.count >= MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, resetTime: clientRateData.resetTime };
  }
  
  clientRateData.count++;
  return { allowed: true, resetTime: clientRateData.resetTime };
}

function createRateLimitResponse(resetTime?: number) {
  const resetInSeconds = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60;
  return new Response(
    JSON.stringify({ 
      error: 'Rate limit exceeded',
      message: `Too many requests. Try again in ${resetInSeconds} seconds.`
    }), 
    {
      status: 429,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Retry-After': resetInSeconds.toString()
      }
    }
  );
}

function getClientIP(req: Request): string {
  // Try to get real IP from headers (for deployments behind proxies)
  const xForwardedFor = req.headers.get('x-forwarded-for');
  const xRealIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  return cfConnectingIP || xRealIP || (xForwardedFor?.split(',')[0]) || 'unknown';
}

interface AIRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check rate limit using client IP
    const clientId = getClientIP(req);
    const rateLimitResult = checkRateLimit(clientId);
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for client ${clientId}`);
      return createRateLimitResponse(rateLimitResult.resetTime);
    }

    // Log security event
    console.log(`AI request from client: ${clientId} at ${new Date().toISOString()}`);

    const { prompt, maxTokens = 200, temperature = 0.7, systemPrompt }: AIRequest = await req.json();

    if (!togetherApiKey) {
      throw new Error('Together AI API key not configured');
    }

    // Combine system prompt and user prompt for Together AI
    let fullPrompt = prompt;
    if (systemPrompt) {
      fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`;
    }

    const response = await fetch('https://api.together.xyz/inference', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${togetherApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        prompt: fullPrompt,
        max_tokens: maxTokens,
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Together AI API error:', response.status, errorText);
      throw new Error(`Together AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Together AI returns the response in a different format than OpenRouter
    const generatedText = data.output?.choices?.[0]?.text || data.choices?.[0]?.text || data.output || 'No response generated';

    return new Response(JSON.stringify({ 
      response: generatedText.trim(),
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      usage: data.usage || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in together-ai function:', error);
    
    // Provide graceful fallback messaging
    const fallbackMessage = "I'm having trouble connecting right now. Please try asking about:\n\n• Your relationship network\n• Networking strategies\n• Follow-up timing\n• Communication best practices";
    
    return new Response(JSON.stringify({ 
      response: fallbackMessage,
      error: error.message,
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1'
    }), {
      status: 200, // Return 200 with fallback content instead of error status
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
