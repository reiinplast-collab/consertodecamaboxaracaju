import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wrench, MapPin, Clock } from "lucide-react";
import heroImage from "@/assets/hero-bed-repair.jpg";
import { DEFAULTS, fetchSettings, getSignedImageUrl, type HeroSettings, type ThemeSettings } from "@/lib/site-content";
import ScheduleVisitDialog from "@/components/ScheduleVisitDialog";

const HeroSection = () => {
  const [data, setData] = useState<HeroSettings>(DEFAULTS.hero);
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULTS.theme);
  const [imgUrl, setImgUrl] = useState<string>(heroImage);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchSettings<HeroSettings>("hero", DEFAULTS.hero).then(async (h) => {
      setData(h);
      if (h.image_path) {
        const u = await getSignedImageUrl("site-images", h.image_path);
        if (u) setImgUrl(u);
      }
    });
    fetchSettings<ThemeSettings>("theme", DEFAULTS.theme).then(setTheme);
  }, []);

  const ctaAnimClass = {
    none: "",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    shake: "animate-[shake_0.6s_ease-in-out_infinite]",
  }[theme.cta_animation] || "";

  const ctaStyle: React.CSSProperties = {
    ...(theme.cta_bg ? { backgroundColor: theme.cta_bg, backgroundImage: "none" } : {}),
    ...(theme.cta_text ? { color: theme.cta_text } : {}),
    fontSize: `${theme.cta_font_size}px`,
  };

  const handleCta = (link: string, e: React.MouseEvent) => {
    if (link === "#agendar") {
      e.preventDefault();
      setDialogOpen(true);
    }
  };

  const renderTitle = () => {
    if (!data.highlight || !data.title.includes(data.highlight)) {
      return <>{data.title}</>;
    }
    const parts = data.title.split(data.highlight);
    return (
      <>
        {parts[0]}
        <span className="text-primary">{data.highlight}</span>
        {parts.slice(1).join(data.highlight)}
      </>
    );
  };

  return (
    <section className="min-h-[85vh] bg-gradient-soft relative overflow-hidden">
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              {renderTitle()}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {data.subtitle}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-5 h-5 text-primary" /><span>Aracaju e região</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-5 h-5 text-primary" /><span>Atendimento rápido</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Wrench className="w-5 h-5 text-primary" /><span>Serviço especializado</span></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href={data.cta_primary_link} onClick={(e) => handleCta(data.cta_primary_link, e)}
                target={data.cta_primary_link.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                <Button variant="hero" size="xl" style={ctaStyle} className={ctaAnimClass}>
                  {data.cta_primary_text}
                </Button>
              </a>
              <a href={data.cta_secondary_link} target={data.cta_secondary_link.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                <Button variant="outline-comfort" size="xl">{data.cta_secondary_text}</Button>
              </a>
            </div>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-0 shadow-soft">
              <p className="text-center text-muted-foreground">
                <strong className="text-primary">{data.badge_text}</strong>
              </p>
            </Card>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-comfort">
              <img src={imgUrl} alt="Conserto profissional de cama box em Aracaju" className="w-full h-[500px] lg:h-[600px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-comfort">
              <div className="text-center">
                <div className="text-2xl font-bold">{data.stat_number}</div>
                <div className="text-sm opacity-90">{data.stat_label}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScheduleVisitDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
};

export default HeroSection;
