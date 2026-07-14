import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULTS, type ThemeSettings } from "@/lib/site-content";

/** Applies theme colors to CSS variables at runtime. Runs once at app mount. */
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "theme")
      .maybeSingle()
      .then(({ data }) => {
        const t = (data?.value as ThemeSettings) ?? DEFAULTS.theme;
        const root = document.documentElement;
        if (t.primary) root.style.setProperty("--primary", t.primary);
        if (t.primary) root.style.setProperty("--ring", t.primary);
        if (t.primary) root.style.setProperty("--comfort-blue", t.primary);
        if (t.accent) root.style.setProperty("--accent", t.accent);
      });
  }, []);
  return <>{children}</>;
};

export default ThemeProvider;
