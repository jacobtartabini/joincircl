
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
// Helper logging function
const logStep = (step: string, details?: any) => {
  const dstr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${dstr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  // Service role for full access
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );
  try {
    logStep("started");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr) throw new Error(`Auth error: ${userErr.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("No user email");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    let subscribed = false, subscriptionTier = null, subscriptionEnd = null;
    let customerId = null, stripeSubscriptionId = null, status = "inactive", current_period_start = null, current_period_end = null, cancel_at_period_end = false;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      // Get active sub
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 1,
      });
      if (subscriptions.data.length > 0) {
        const sub = subscriptions.data[0];
        subscribed = sub.status === "active" || sub.status === "trialing";
        status = sub.status;
        stripeSubscriptionId = sub.id;
        // Find tier by price
        const price = sub.items.data[0]?.price;
        let amt = price?.unit_amount || 0;
        if (amt < 2000) subscriptionTier = "pro";
        else subscriptionTier = "business";
        subscriptionEnd = new Date((sub.current_period_end || 0) * 1000).toISOString();
        current_period_start = new Date((sub.current_period_start || 0) * 1000).toISOString();
        current_period_end = subscriptionEnd;
        cancel_at_period_end = !!sub.cancel_at_period_end;
      }
    }
    // Upsert user_subscriptions
    await supabase.from("user_subscriptions").upsert({
      user_id: user.id,
      plan_type: subscribed ? subscriptionTier : "free",
      stripe_customer_id: customerId,
      stripe_subscription_id: stripeSubscriptionId,
      status,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return new Response(JSON.stringify({
      subscribed, plan_type: subscribed ? subscriptionTier : "free", subscription_end: subscriptionEnd, status, cancel_at_period_end
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (e) {
    logStep("ERROR", { err: e.message || `${e}` });
    return new Response(JSON.stringify({ error: e.message || `${e}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});
