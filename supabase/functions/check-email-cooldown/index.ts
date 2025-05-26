
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, emailType, cooldownHours = 24 } = await req.json();

    if (!userId || !emailType) {
      throw new Error('User ID and email type are required');
    }

    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - cooldownHours);

    const { data, error } = await supabase
      .from('email_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('email_type', emailType)
      .eq('status', 'sent')
      .gte('sent_at', cutoffTime.toISOString())
      .limit(1);

    if (error) throw error;

    const canSend = !data || data.length === 0;

    return new Response(JSON.stringify({ 
      success: true, 
      canSend 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error checking email cooldown:', error);

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      canSend: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
