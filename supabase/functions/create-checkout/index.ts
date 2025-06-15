
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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
  try {
    const body = await req.json();
    const { plan_price_id } = body; // expects Stripe price id (frontend supplies; see below)
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userObj } = await supabase.auth.getUser(token);
    const user = userObj.user;
    if (!user?.email) throw new Error("No user email");
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    let customerId: string | undefined = undefined;
    // Try to find Stripe customer
    const customers = await stripe.customers.list({email: user.email, limit: 1});
    if (customers.data.length > 0) customerId = customers.data[0].id;
    const origin = req.headers.get("origin") || "https://app.joincircl.com";
    // Use plan_price_id from frontend! (You must configure individual plans/pricing in Stripe dashboard and supply the price id via the UI)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        { price: plan_price_id, quantity: 1 }
      ],
      mode: "subscription",
      success_url: `${origin}/settings?tab=subscription&stripe=success`,
      cancel_url: `${origin}/settings?tab=subscription&stripe=cancel`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { supabase_user_id: user.id }
      }
    });
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || `${e}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500
    });
  }
});
