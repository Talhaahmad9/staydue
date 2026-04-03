"use client";

import { useState } from "react";

import CalendarUrlForm from "@/components/onboarding/CalendarUrlForm";
import PhoneNumberForm from "@/components/onboarding/PhoneNumberForm";

interface OnboardingStepsProps {
  admissionYears: string[];
}

export default function OnboardingSteps({ admissionYears }: OnboardingStepsProps): React.ReactElement {
  const [phone, setPhone] = useState("");

  return (
    <div className="space-y-6">
      <CalendarUrlForm phone={phone} admissionYears={admissionYears} />
      <PhoneNumberForm value={phone} onChange={setPhone} />
    </div>
  );
}
