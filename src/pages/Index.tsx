import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { StoriesStrip } from "@/components/home/StoriesStrip";
import { FeaturedCoins } from "@/components/home/FeaturedCoins";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { QuickActions } from "@/components/home/QuickActions";
import { TrustBanner } from "@/components/home/TrustBanner";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StoriesStrip />
        <FeaturedCoins />
        <CategoryShowcase />
        <QuickActions />
        <TrustBanner />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
