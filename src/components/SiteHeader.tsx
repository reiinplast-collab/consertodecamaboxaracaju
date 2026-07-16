import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ShieldCheck, X, Youtube, Facebook, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULTS, fetchSettings, type SocialSettings } from "@/lib/site-content";
import logo from "@/assets/rp-logo.png.asset.json";

type MenuItem = { id: string; label: string; target: string; is_external: boolean; sort_order: number };

const SiteHeader = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [open, setOpen] = useState(false);
  const [social, setSocial] = useState<SocialSettings>(DEFAULTS.social);

  useEffect(() => {
    supabase.from("menu_items").select("*").order("sort_order").then(({ data }) => setItems((data as MenuItem[]) ?? []));
    fetchSettings<SocialSettings>("social", DEFAULTS.social).then(setSocial);
  }, []);

  const renderLink = (m: MenuItem) => {
    if (m.is_external || m.target.startsWith("http") || m.target.startsWith("#")) {
      return (
        <a key={m.id} href={m.target} target={m.is_external ? "_blank" : undefined} rel="noreferrer"
          className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => setOpen(false)}>
          {m.label}
        </a>
      );
    }
    return (
      <Link key={m.id} to={m.target} className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => setOpen(false)}>
        {m.label}
      </Link>
    );
  };

  const socialLinks = [
    { url: social.whatsapp_url, icon: MessageCircle, label: "WhatsApp", color: "hover:text-green-600" },
    { url: social.youtube_url, icon: Youtube, label: "YouTube", color: "hover:text-red-600" },
    { url: social.facebook_url, icon: Facebook, label: "Facebook", color: "hover:text-blue-600" },
    { url: social.instagram_url, icon: Instagram, label: "Instagram", color: "hover:text-pink-600" },
  ].filter((s) => s.url);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo.url} alt="RP Serviços" className="h-14 w-14 object-contain" />
          <div className="hidden sm:block leading-tight">
            <div className="font-bold text-lg text-primary tracking-tight">RP SERVIÇOS</div>
            <div className="text-[10px] text-foreground uppercase tracking-widest">Manutenção &amp; Reparos</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-5">
          {items.map(renderLink)}
          <div className="flex items-center gap-2 border-l border-border pl-4">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}
                className={`text-foreground ${s.color} transition-colors`}>
                <s.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
          <Link to="/adm/login">
            <Button variant="outline" size="sm" className="gap-2">
              <ShieldCheck className="w-4 h-4" /> ADM
            </Button>
          </Link>
        </nav>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {items.map(renderLink)}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4 pt-2 border-t border-border">
                {socialLinks.map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}
                    className={`text-foreground ${s.color} transition-colors`}>
                    <s.icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            )}
            <Link to="/adm/login" onClick={() => setOpen(false)}>
              <Button variant="outline" size="sm" className="gap-2 w-full">
                <ShieldCheck className="w-4 h-4" /> ADM
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
