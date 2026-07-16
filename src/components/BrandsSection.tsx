import { Card } from "@/components/ui/card";
import brands from "@/assets/brands.png.asset.json";

const BrandsSection = () => {
  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">Marcas com as quais trabalhamos</h2>
          <p className="text-lg text-foreground max-w-2xl mx-auto">
            Prestamos serviços de conserto e reforma para as principais marcas de camas e colchões do Brasil.
          </p>
        </div>

        <Card className="p-6 md:p-10 border-2 border-primary/30 rounded-3xl shadow-comfort bg-card">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-background to-secondary/40 p-4 md:p-8">
            <img
              src={brands.url}
              alt="Marcas de colchões atendidas: Castor, Sankonfort, Luckspuma, Paropas, Ecoflex, Americanflex, Minaspuma, Orthocrin, Plumatex, Ortobom, Flex, Epeda, Simmons, Colchobel, Anjos, Bom Pastor, Ultra-Flex"
              className="w-full h-auto object-contain"
              loading="lazy"
            />
          </div>
        </Card>
      </div>
    </section>
  );
};

export default BrandsSection;
