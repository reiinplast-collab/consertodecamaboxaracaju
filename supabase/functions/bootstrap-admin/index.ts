// Idempotently ensures the admin user (Reibiel / Elisbiel) exists.
// Called from the login page on mount so the account is available for first sign-in.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = "reibiel@bomsono.local";
const ADMIN_PASSWORD = "Elisbiel";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // Check if user already exists
    const { data: list } = await admin.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === ADMIN_EMAIL);

    let userId: string;
    if (existing) {
      userId = existing.id;
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
      });
      if (error) throw error;
      userId = data.user!.id;
    }

    // Ensure admin role
    await admin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("bootstrap-admin failed:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
