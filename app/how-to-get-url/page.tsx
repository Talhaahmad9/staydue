import type { Metadata } from "next";
import StaticPageLayout from "@/components/landing/StaticPageLayout";
import TutorialContent from "@/components/onboarding/TutorialContent";

export const metadata: Metadata = {
  title: "How to get your Moodle URL — StayDue",
  description:
    "Step-by-step guide for IOBM students on how to find and copy the Moodle calendar export URL for StayDue.",
};

export default function HowToGetUrlPage(): React.ReactElement {
  return (
    <StaticPageLayout>
      <div className="space-y-2 mb-10">
        <p className="text-xs md:text-sm uppercase tracking-widest text-text-muted font-medium">Tutorial</p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-text-primary leading-tight">
          How to get your Moodle calendar URL
        </h1>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-xl">
          This guide is for IOBM students using lms.iobm.edu.pk. It takes about 2 minutes and
          you only need to do it once.
        </p>
      </div>
      <TutorialContent />
    </StaticPageLayout>
  );
}
