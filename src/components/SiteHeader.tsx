import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type MenuItem = { id: string; label: string; target: string; is_external: boolean; sort_order: number };

const SiteHeader = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase
      .from("menu_items")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setItems((data as MenuItem[]) ?? []));
  }, []);

  const renderLink = (m: MenuItem) => {
    if (m.is_external || m.target.startsWith("http") || m.target.startsWith("#")) {
      return (
        <a
          key={m.id}
          href={m.target}
          target={m.is_external ? "_blank" : undefined}
          rel="noreferrer"
          className="text-foreground/80 hover:text-primary transition-colors font-medium"
          onClick={() => setOpen(false)}
        >
          {m.label}
        </a>
      );
    }
    return (
      <Link
        key={m.id}
        to={m.target}
        className="text-foreground/80 hover:text-primary transition-colors font-medium"
        onClick={() => setOpen(false)}
      >
        {m.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-primary">
          Bom Sono Aracaju
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {items.map(renderLink)}
          <Link to="/adm/login">
            <Button variant="outline" size="sm" className="gap-2">
              <ShieldCheck className="w-4 h-4" /> ADM
            </Button>
          </Link>
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {items.map(renderLink)}
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
