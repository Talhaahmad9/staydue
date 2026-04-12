"use client";

import Image from "next/image";

import CalendarUrlForm from "@/components/onboarding/CalendarUrlForm";
import PhoneNumberForm from "@/components/onboarding/PhoneNumberForm";

interface OnboardingStepsProps {
  admissionYears: string[];
}

export default function OnboardingSteps({ admissionYears }: OnboardingStepsProps): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <Image
          src="/staydue_logo.svg"
          alt="StayDue"
          width={130}
          height={44}
          priority
        />
      </div>
      <CalendarUrlForm phone="" admissionYears={admissionYears} />
      <PhoneNumberForm onVerified={() => {}} />
    </div>
  );
}
