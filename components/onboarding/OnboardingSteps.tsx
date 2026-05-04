"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CalendarUrlForm from "@/components/onboarding/CalendarUrlForm";
import PhoneNumberForm from "@/components/onboarding/PhoneNumberForm";

const TUTORIAL_VIDEO_DESKTOP = "uJg653lPHpc";
const TUTORIAL_VIDEO_MOBILE = "XVgTEuW4zYI";

interface OnboardingStepsProps {
  admissionYears: string[];
}

export default function OnboardingSteps({ admissionYears }: OnboardingStepsProps): React.ReactElement {
  const router = useRouter();
  const [phase, setPhase] = useState<"calendar" | "phone">("calendar");

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 max-w-xl">
        <div className={`flex items-center gap-1.5 text-xs font-medium ${
          phase === "calendar" ? "text-brand" : "text-urgency-doneText"
        }`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium border ${
            phase === "calendar"
              ? "bg-brand-light border-brand/40 text-brand"
              : "bg-urgency-done border-urgency-doneBorder text-urgency-doneText"
          }`}>
            {phase === "calendar" ? "1" : "+"}
          </span>
          Calendar
        </div>
        <div className="flex-1 h-px bg-line/50" />
        <div className={`flex items-center gap-1.5 text-xs font-medium ${
          phase === "phone" ? "text-brand" : "text-text-muted"
        }`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium border ${
            phase === "phone"
              ? "bg-brand-light border-brand/40 text-brand"
              : "bg-page-hover border-line text-text-muted"
          }`}>
            2
          </span>
          WhatsApp
        </div>
      </div>

      {phase === "calendar" ? (
        <div className="space-y-6">
          <CalendarUrlForm
            admissionYears={admissionYears}
            onSuccess={() => setPhase("phone")}
          />
          <div className="max-w-xl space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-text-muted">How it works</p>
            {/* Mobile video — shown below md */}
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-line/50 md:hidden">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${TUTORIAL_VIDEO_MOBILE}?rel=0&modestbranding=1`}
                title="How to get your Moodle calendar URL on mobile — StayDue"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            {/* Desktop video — shown from md up */}
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-line/50 hidden md:block">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${TUTORIAL_VIDEO_DESKTOP}?rel=0&modestbranding=1`}
                title="How to get your Moodle calendar URL — StayDue"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-w-xl">
          <PhoneNumberForm onVerified={() => router.push("/dashboard")} />
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-2 text-sm text-text-muted hover:text-text-secondary transition-colors text-center"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}
