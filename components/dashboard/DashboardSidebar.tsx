"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

interface DashboardSidebarProps {
  userInitials: string;
  userName: string;
}

export default function DashboardSidebar({
  userInitials,
  userName,
}: DashboardSidebarProps): React.ReactElement {
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("[dashboard/signout]", error);
      setIsSigningOut(false);
    }
  }

  const navLinks = [
    { href: "/dashboard", label: "Deadlines", active: pathname === "/dashboard" },
    { href: "/settings", label: "Settings", active: pathname === "/settings" },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-page-surface border-r border-line/50 p-6">
        <div className="mb-8 w-64 h-auto">
          <Image
            src="/staydue_logo.svg"
            alt="StayDue"
            width={160}
            height={54}
            priority
            className="w-full h-auto"
          />
        </div>

        <nav className="flex-1 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                link.active
                  ? "bg-brand-light text-brand border border-brand/40"
                  : "text-text-secondary hover:text-text-primary hover:bg-page-hover"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-line/50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-light border border-brand/40 flex items-center justify-center text-brand text-xs font-medium">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary truncate">{userName}</p>
              <p className="text-xs text-text-muted">Account owner</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full text-left px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-urgency-todayText hover:bg-urgency-today/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-text-secondary disabled:hover:bg-transparent"
          >
            {isSigningOut ? <ButtonLoader /> : "Sign out"}
          </button>
        </div>
      </aside>

      {/* Mobile nav placeholder - profile dropdown rendered in navbar instead */}
      <div className="lg:hidden" />
    </>
  );
}
