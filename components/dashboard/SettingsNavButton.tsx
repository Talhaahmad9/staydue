"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

export default function SettingsNavButton(): React.ReactElement {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = () => {
    setIsNavigating(true);
  };

  return (
    <Link
      href="/settings"
      onClick={handleClick}
      className="hidden lg:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-page-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isNavigating ? (
        <ButtonLoader />
      ) : (
        <>
          <Settings size={16} />
          Settings
        </>
      )}
    </Link>
  );
}
