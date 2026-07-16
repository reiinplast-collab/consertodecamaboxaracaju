import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "rp_visit_session";

/** Logs one visit per browser session per path. Enriches with city/region via ipapi.co (free). */
export async function trackVisit(path: string) {
  try {
    const key = `${STORAGE_KEY}:${path}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    let geo: any = {};
    try {
      const r = await fetch("https://ipapi.co/json/");
      if (r.ok) geo = await r.json();
    } catch {}

    await supabase.from("visits").insert({
      path,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      ip: geo.ip ?? null,
      city: geo.city ?? null,
      region: geo.region ?? null,
      country: geo.country_name ?? geo.country ?? null,
      timezone: geo.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch {
    // silent
  }
}
