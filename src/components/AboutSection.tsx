import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Trophy, Heart } from "lucide-react";

const AboutSection = () => {
  const stats = [
    { number: "10+", label: "Anos de Experiência", icon: <Trophy className="w-6 h-6" /> },
    { number: "500+", label: "Clientes Atendidos", icon: <Users className="w-6 h-6" /> },
    { number: "98%", label: "Satisfação Garantida", icon: <Heart className="w-6 h-6" /> },
    { number: "24h", label: "Resposta Rápida", icon: <MapPin className="w-6 h-6" /> }
  ];

  return (
    <section id="sobre" className="py-16 lg:py-24 bg-gradient-soft">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="text-primary font-semibold">
                Sobre Nossa Empresa
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Especialistas em <span className="text-primary">Conforto</span> e Qualidade do Sono
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Há mais de uma década atendendo Aracaju e região com serviços especializados 
                em conserto e reforma de camas box e colchões. Nosso compromisso é devolver 
                o conforto do seu sono com qualidade e preços justos.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Atendimento Local</h3>
                  <p className="text-muted-foreground">
                    Conhecemos Aracaju e região. Nosso atendimento a domicílio é rápido e eficiente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Experiência Comprovada</h3>
                  <p className="text-muted-foreground">
                    Mais de 10 anos de experiência em consertos e reformas de camas e colchões.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Garantia de Qualidade</h3>
                  <p className="text-muted-foreground">
                    Todos os nossos serviços vêm com garantia e compromisso com a sua satisfação.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-8 border-0 shadow-soft hover:shadow-comfort transition-smooth bg-card/80 backdrop-blur-sm">
                <CardContent className="p-0 space-y-4">
                  <div className="text-primary mx-auto">{stat.icon}</div>
                  <div className="text-4xl font-bold text-foreground">{stat.number}</div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;