"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

interface NavbarButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export default function NavbarButton({
  href,
  children,
  variant = "secondary",
}: NavbarButtonProps): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    router.push(href);
  }

  if (variant === "primary") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <ButtonLoader /> : children}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
