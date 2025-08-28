import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wrench, MapPin, Clock } from "lucide-react";
import heroImage from "@/assets/hero-bed-repair.jpg";

const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-soft relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Conserto de <span className="text-primary">Cama Box</span> em Aracaju
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Especialistas em conserto de cama box e reforma de colchões com atendimento a domicílio. 
                Qualidade garantida e preços justos.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Aracaju e região</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <span>Atendimento rápido</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wrench className="w-5 h-5 text-primary" />
                <span>Serviço especializado</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl">
                Solicitar Orçamento
              </Button>
              <Button variant="outline-comfort" size="xl">
                Falar no WhatsApp
              </Button>
            </div>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-0 shadow-soft">
              <p className="text-center text-muted-foreground">
                <strong className="text-primary">Mais de 10 anos</strong> de experiência em consertos e reformas
              </p>
            </Card>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-comfort">
              <img 
                src={heroImage} 
                alt="Conserto profissional de cama box em Aracaju"
                className="w-full h-[500px] lg:h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-comfort">
              <div className="text-center">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm opacity-90">Satisfação Garantida</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;