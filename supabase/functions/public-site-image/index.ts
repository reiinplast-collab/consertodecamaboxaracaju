import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const PATH_RE = /^[A-Za-z0-9._\/-]{1,300}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const { path } = await req.json().catch(() => ({}));
    if (typeof path !== "string" || !PATH_RE.test(path) || path.includes("..")) return json({ error: "invalid" }, 400);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const [prod, post, hero] = await Promise.all([
      admin.from("products").select("id").eq("image_path", path).limit(1),
      admin.from("posts").select("id").eq("image_url", path).eq("published", true).limit(1),
      admin.from("site_settings").select("key").eq("key", "hero").eq("value->>image_path", path).limit(1),
    ]);
    const used = (prod.data?.length ?? 0) + (post.data?.length ?? 0) + (hero.data?.length ?? 0) > 0;
    if (!used) return json({ error: "not_found" }, 404);
    const { data, error } = await admin.storage.from("site-images").createSignedUrl(path, 3600);
    if (error || !data) return json({ error: "not_found" }, 404);
    return json({ signedUrl: data.signedUrl });
  } catch {
    return json({ error: "server_error" }, 500);
  }
});
