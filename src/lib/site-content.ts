import { supabase } from "@/integrations/supabase/client";

export type HeroSettings = {
  title: string;
  highlight: string;
  subtitle: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
  badge_text: string;
  stat_number: string;
  stat_label: string;
  image_path?: string | null;
};

export type ThemeSettings = {
  primary: string;
  accent: string;
  cta_bg: string;
  cta_text: string;
  cta_font_size: string;
  cta_animation: "none" | "pulse" | "bounce" | "shake";
};

export type ContactSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  hours: string;
  area: string;
};

export type SocialSettings = {
  whatsapp_url: string;
  youtube_url: string;
  facebook_url: string;
  instagram_url: string;
};

export const DEFAULTS = {
  hero: {
    title: "Conserto de Cama Box em Aracaju",
    highlight: "Cama Box",
    subtitle:
      "Especialistas em conserto de cama box e reforma de colchões com atendimento a domicílio. Qualidade garantida e preços justos.",
    cta_primary_text: "Solicitar Orçamento",
    cta_primary_link: "#agendar",
    cta_secondary_text: "Falar no WhatsApp",
    cta_secondary_link: "https://wa.me/5579988392252",
    badge_text: "Mais de 10 anos de experiência em consertos e reformas",
    stat_number: "100%",
    stat_label: "Satisfação Garantida",
    image_path: null,
  } as HeroSettings,
  theme: {
    primary: "210 95% 35%",
    accent: "195 85% 45%",
    cta_bg: "",
    cta_text: "",
    cta_font_size: "18",
    cta_animation: "none",
  } as ThemeSettings,
  contact: {
    phone: "(79) 98839-2252",
    whatsapp: "5579988392252",
    email: "reibonsono@gmail.com",
    hours: "Segunda a Sábado - 8h às 18h",
    area: "Aracaju e Região Metropolitana",
  } as ContactSettings,
  social: {
    whatsapp_url: "https://wa.me/5579988392252",
    youtube_url: "",
    facebook_url: "",
    instagram_url: "",
  } as SocialSettings,
};

export async function fetchSettings<T = any>(key: string, fallback: T): Promise<T> {
  const { data } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
  return (data?.value as T) ?? fallback;
}

export async function saveSettings(key: string, value: unknown) {
  const { error } = await supabase.from("site_settings").upsert({ key, value: value as any });
  if (error) throw error;
}

export async function getSignedImageUrl(bucket: string, path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}
