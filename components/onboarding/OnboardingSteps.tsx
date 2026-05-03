"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import CalendarUrlForm from "@/components/onboarding/CalendarUrlForm";
import PhoneNumberForm from "@/components/onboarding/PhoneNumberForm";

interface OnboardingStepsProps {
  admissionYears: string[];
}

export default function OnboardingSteps({ admissionYears }: OnboardingStepsProps): React.ReactElement {
  const router = useRouter();
  const [phase, setPhase] = useState<"calendar" | "phone">("calendar");

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <Image src="/staydue_logo.svg" alt="StayDue" width={130} height={44} priority />
      </div>

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
        <CalendarUrlForm
          admissionYears={admissionYears}
          onSuccess={() => setPhase("phone")}
        />
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
