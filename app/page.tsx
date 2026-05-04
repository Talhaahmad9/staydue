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

export const revalidate = 86400; // regenerate once per day

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://staydue.app/#webapp",
      name: "StayDue",
      url: "https://staydue.app",
      description:
        "StayDue syncs your IOBM Moodle deadlines and sends WhatsApp and email reminders before every due date.",
      applicationCategory: "EducationApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "PKR",
        availability: "https://schema.org/InStock",
      },
      publisher: {
        "@type": "Organization",
        name: "StayDue",
        url: "https://staydue.app",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Does StayDue work with IOBM Moodle?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. StayDue was built specifically for IOBM students using lms.iobm.edu.pk. The course catalog covers batches from 2020 onwards, and course codes and full names are resolved automatically based on your admission year.",
          },
        },
        {
          "@type": "Question",
          name: "How do I get my Moodle calendar URL?",
          acceptedAnswer: {
            "@type": "Answer",
            text: 'Log in to IOBM Moodle, go to Calendar, scroll to the bottom and click "Export calendar". Select "All events" and "All courses", then click "Get calendar URL" and copy it.',
          },
        },
        {
          "@type": "Question",
          name: "What reminders will I receive?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "By default you get reminders 3 days before a deadline, 1 day before, and on the day of. If a deadline passes, StayDue sends overdue follow-up notices over the next several days so you can still submit late if the option exists.",
          },
        },
        {
          "@type": "Question",
          name: "Is my Moodle data safe?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "StayDue reads your public calendar export URL — the same data any calendar app would see. We do not store your Moodle credentials, cannot access your Moodle account, and cannot read assignment files or submissions. Your URL and deadline data are encrypted at rest.",
          },
        },
        {
          "@type": "Question",
          name: "What payment methods are accepted?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "JazzCash, Easypaisa, and direct bank transfer. After sending payment, upload a screenshot and transaction ID in-app. Subscriptions are activated manually within 24 hours.",
          },
        },
        {
          "@type": "Question",
          name: "Can I get a refund?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Refunds are not available once a subscription has been activated. If you have an issue before activation, reach out and we will resolve it before proceeding.",
          },
        },
      ],
    },
  ],
};

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
