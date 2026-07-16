import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import PostsFeed from "@/components/PostsFeed";
import ServicesSection from "@/components/ServicesSection";
import BrandsSection from "@/components/BrandsSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <HeroSection />
      <PostsFeed />
      <ServicesSection />
      <BrandsSection />
      <AboutSection />
      <ContactSection />
    </div>
  );
};

export default Index;

