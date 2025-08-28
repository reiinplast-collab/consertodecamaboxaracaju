import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed, Settings, Shield, Clock } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: <Bed className="w-8 h-8" />,
      title: "Conserto de Cama Box",
      description: "Reparamos estruturas quebradas, trocamos molas danificadas e restauramos o suporte da sua cama box.",
      features: ["Troca de molas", "Reparo de estrutura", "Reforço da base", "Garantia de 6 meses"]
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Reforma de Colchão de Mola",
      description: "Renovamos colchões de mola com substituição de componentes internos e revestimento exterior.",
      features: ["Troca de molas", "Novo revestimento", "Limpeza profunda", "Higienização completa"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Reforma de Colchão Ortopédico",
      description: "Especialistas em reforma de colchões ortopédicos mantendo suas propriedades terapêuticas.",
      features: ["Manutenção ortopédica", "Materiais especiais", "Conforto preservado", "Qualidade garantida"]
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Nossos Serviços
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Especializados em consertos e reformas que devolvem o conforto do seu sono
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="border-0 shadow-soft hover:shadow-comfort transition-smooth bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-primary mb-6">{service.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-4">{service.title}</h3>
                <p className="text-muted-foreground mb-6">{service.description}</p>
                
                <ul className="space-y-2 mb-8">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button variant="comfort" className="w-full">
                  Solicitar Orçamento
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="inline-block p-8 bg-gradient-soft border-0 shadow-comfort">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Clock className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">Atendimento a Domicílio</h3>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Vamos até sua casa em Aracaju e região para avaliar e realizar o serviço com toda comodidade
            </p>
            <Button variant="hero" size="lg">
              Agendar Visita
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;