import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { DEFAULTS, fetchSettings, type ContactSettings } from "@/lib/site-content";
import ScheduleVisitDialog from "@/components/ScheduleVisitDialog";

const ContactSection = () => {
  const [c, setC] = useState<ContactSettings>(DEFAULTS.contact);
  const [open, setOpen] = useState(false);

  useEffect(() => { fetchSettings<ContactSettings>("contact", DEFAULTS.contact).then(setC); }, []);

  const wa = `https://wa.me/${c.whatsapp}`;
  const tel = `tel:${c.phone.replace(/\D/g, "")}`;

  return (
    <section id="contato" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">Entre em Contato</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Solicite seu orçamento gratuito e agende uma visita. Atendemos toda Aracaju e região</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: <Phone className="w-6 h-6" />, title: "Telefone", info: c.phone, href: tel, action: "Ligar" },
            { icon: <MessageCircle className="w-6 h-6" />, title: "WhatsApp", info: c.phone, href: wa, action: "Chamar" },
            { icon: <MapPin className="w-6 h-6" />, title: "Atendimento", info: c.area, action: "" },
            { icon: <Clock className="w-6 h-6" />, title: "Horário", info: c.hours, action: "" },
          ].map((it, i) => (
            <Card key={i} className="text-center border-0 shadow-soft hover:shadow-comfort transition-smooth bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-primary mb-4 flex justify-center">{it.icon}</div>
                <h3 className="font-bold text-foreground mb-2">{it.title}</h3>
                <p className="text-muted-foreground mb-6 text-sm">{it.info}</p>
                {it.action && (
                  <a href={it.href} target={it.href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                    <Button variant="outline-comfort" size="sm" className="w-full">{it.action}</Button>
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-comfort border-0 shadow-comfort">
            <CardContent className="p-12 text-center text-primary-foreground">
              <h3 className="text-3xl font-bold mb-4">Pronto para Recuperar o Conforto do Seu Sono?</h3>
              <p className="text-xl mb-8 opacity-90">Não deixe para amanhã o conserto que pode melhorar suas noites hoje. Orçamento gratuito e atendimento a domicílio em Aracaju.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={tel}><Button variant="secondary" size="xl" className="bg-white text-primary hover:bg-white/90"><Phone className="w-5 h-5 mr-2" />Ligar Agora</Button></a>
                <a href={wa} target="_blank" rel="noreferrer"><Button variant="secondary" size="xl" className="bg-white text-primary hover:bg-white/90"><MessageCircle className="w-5 h-5 mr-2" />WhatsApp</Button></a>
                <Button variant="secondary" size="xl" className="bg-white text-primary hover:bg-white/90" onClick={() => setOpen(true)}>Agendar visita</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ScheduleVisitDialog open={open} onOpenChange={setOpen} />
    </section>
  );
};

export default ContactSection;
