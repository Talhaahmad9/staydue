import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import MiniAboutSection from "@/components/landing/MiniAboutSection";
import LandingFooter from "@/components/landing/LandingFooter";
import { connectToDatabase, TestimonialModel } from "@/lib/mongodb";
import { getTestimonialPhotoUrl } from "@/lib/r2";

async function getVisibleTestimonials() {
  try {
    await connectToDatabase();
    const docs = await TestimonialModel.find({ isVisible: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return await Promise.all(
      docs.map(async (t) => {
        let photoUrl: string | null = null;
        if (t.photoKey) {
          const result = await getTestimonialPhotoUrl(t.photoKey);
          if (result.success && result.url) photoUrl = result.url;
        }
        return {
          id: t._id.toString(),
          quote: t.quote,
          name: t.name,
          batch: t.batch,
          course: t.course,
          photoUrl,
        };
      })
    );
  } catch {
    return [];
  }
}

export default async function Home(): Promise<React.ReactElement> {
  const testimonials = await getVisibleTestimonials();

  return (
    <div className="min-h-screen flex flex-col bg-page-bg">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection testimonials={testimonials} />
        <PricingSection />
        <FAQSection />
        <MiniAboutSection />
      </main>
      <LandingFooter />
    </div>
  );
}
