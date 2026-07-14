import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import PostsFeed from "@/components/PostsFeed";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <HeroSection />
      <PostsFeed />
      <ServicesSection />
      <AboutSection />
      <ContactSection />
    </div>
  );
};

export default Index;
