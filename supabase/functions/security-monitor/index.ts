import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_MINUTE = 20;

function checkRateLimit(userId: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const userRateData = rateLimitMap.get(userId);
  
  if (!userRateData || now > userRateData.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 });
    return { allowed: true, resetTime: now + 60000 };
  }
  
  if (userRateData.count >= MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, resetTime: userRateData.resetTime };
  }
  
  userRateData.count++;
  return { allowed: true, resetTime: userRateData.resetTime };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check rate limit
    const rateLimitResult = checkRateLimit(user.id);
    if (!rateLimitResult.allowed) {
      const resetInSeconds = rateLimitResult.resetTime ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000) : 60;
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        resetIn: resetInSeconds
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, timeRange, eventType } = await req.json();

    switch (action) {
      case 'dashboard': {
        const validTimeRanges = ['1h', '24h', '7d'];
        const range = validTimeRanges.includes(timeRange) ? timeRange : '24h';
        
        const timeRangeMap = { '1h': 1, '24h': 24, '7d': 168 };
        const hours = timeRangeMap[range as keyof typeof timeRangeMap];
        const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

        const { data: events, error } = await supabase
          .from('security_events')
          .select('*')
          .gte('occurred_at', startTime)
          .order('occurred_at', { ascending: false });

        if (error) {
          console.error('Error fetching security events:', error);
          return new Response(JSON.stringify({ error: 'Failed to fetch security events' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Group events by type
        const eventsByType = (events || []).reduce((acc: Record<string, number>, event: any) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        }, {});

        // Create timeline data
        const timeline = (events || []).reduce((acc: Record<string, number>, event: any) => {
          const hour = new Date(event.occurred_at).toISOString().slice(0, 13);
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {});

        return new Response(JSON.stringify({
          totalEvents: events?.length || 0,
          eventsByType,
          timeline: Object.entries(timeline).map(([time, count]) => ({ time, count })),
          recentEvents: events?.slice(0, 10) || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'log_event': {
        const { type, details, clientIp, userAgent } = await req.json();

        const { error } = await supabase
          .from('security_events')
          .insert({
            type,
            user_id: user.id,
            client_ip: clientIp,
            user_agent: userAgent,
            details,
            occurred_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error logging security event:', error);
          return new Response(JSON.stringify({ error: 'Failed to log security event' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'analyze_patterns': {
        const timeWindow = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const { data: events, error } = await supabase
          .from('security_events')
          .select('*')
          .eq('user_id', user.id)
          .gte('occurred_at', timeWindow)
          .order('occurred_at', { ascending: false });

        if (error) {
          return new Response(JSON.stringify({ error: 'Failed to analyze patterns' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const patterns: string[] = [];
        const recommendations: string[] = [];
        let riskLevel: 'low' | 'medium' | 'high' = 'low';

        // Analyze patterns
        const eventCounts = (events || []).reduce((acc: Record<string, number>, event: any) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        }, {});

        if (eventCounts.failed_login > 5) {
          patterns.push(`${eventCounts.failed_login} failed login attempts`);
          riskLevel = 'medium';
          recommendations.push('Consider enabling 2FA');
        }

        if (eventCounts.rate_limit_exceeded > 10) {
          patterns.push(`Excessive rate limiting (${eventCounts.rate_limit_exceeded} events)`);
          riskLevel = 'high';
          recommendations.push('Review API usage patterns');
        }

        return new Response(JSON.stringify({
          riskLevel,
          patterns,
          recommendations,
          eventCounts
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Security monitor error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});