import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import MiniAboutSection from "@/components/landing/MiniAboutSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home(): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col bg-page-bg">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <MiniAboutSection />
      </main>
      <LandingFooter />
    </div>
  );
}
