
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST")
    return new Response(JSON.stringify({ message: "Invalid method" }), { status: 405, headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let userId = null;
  try {
    const jwt = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!jwt) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: user } = await supabase.auth.getUser(jwt);
    if (!user?.user?.id) return new Response(JSON.stringify({ message: "User not found" }), { status: 401, headers: corsHeaders });
    userId = user.user.id;
  } catch {
    return new Response(JSON.stringify({ message: "Could not authenticate" }), { status: 401, headers: corsHeaders });
  }

  let contacts: any[] = [];
  try {
    const body = await req.json();
    contacts = Array.isArray(body.contacts) ? body.contacts : [];
    if (contacts.length === 0) throw new Error("No contacts provided");
  } catch (e) {
    return new Response(JSON.stringify({ message: "Malformed request" }), { status: 400, headers: corsHeaders });
  }

  // Validate and prepare
  let existingEmails: string[] = [];
  try {
    // Fetch all user emails for deduplication
    const { data } = await supabase.from("contacts").select("personal_email").eq("user_id", userId);
    existingEmails = (data || []).map((c: any) => (c.personal_email || "").toLowerCase());
  } catch {}

  const newContacts = [];
  const failed: { row: number; reason: string }[] = [];
  for (let i = 0; i < contacts.length; i++) {
    const row = contacts[i];
    // Validate required
    if (!row.name || !row.personal_email) {
      failed.push({ row: i + 2, reason: "Missing Name or Email" });
      continue;
    }
    // Email format
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(row.personal_email)) {
      failed.push({ row: i + 2, reason: "Invalid email format" });
      continue;
    }
    // Deduplication
    if (existingEmails.includes(row.personal_email.toLowerCase())) {
      failed.push({ row: i + 2, reason: "Duplicate (already exists)" });
      continue;
    }
    // Prepare
    newContacts.push({
      ...row,
      user_id: userId,
    });
    existingEmails.push(row.personal_email.toLowerCase());
  }

  let insertedCount = 0;
  if (newContacts.length > 0) {
    const { error } = await supabase.from("contacts").insert(newContacts);
    if (!error) {
      insertedCount = newContacts.length;
    } else {
      // Widespread error (Supabase, e.g. unique constraint)
      for (let i = 0; i < newContacts.length; i++) {
        failed.push({ row: i + 2, reason: "Insert error" });
      }
    }
  }

  return new Response(
    JSON.stringify({ successCount: insertedCount, failed }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
});
