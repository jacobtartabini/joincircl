
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No Authorization");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("No user email");
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({email: user.email, limit: 1});
    if (customers.data.length === 0) throw new Error("No Stripe customer found");
    const customerId = customers.data[0].id;
    const origin = req.headers.get("origin") || "https://app.joincircl.com";
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings?tab=subscription`
    });
    return new Response(JSON.stringify({ url: portal.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || `${e}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500
    });
  }
});
