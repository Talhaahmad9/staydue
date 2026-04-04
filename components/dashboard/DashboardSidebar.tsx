"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface DashboardSidebarProps {
  userInitials: string;
  userName: string;
}

export default function DashboardSidebar({
  userInitials,
  userName,
}: DashboardSidebarProps): React.ReactElement {
  const pathname = usePathname();

  async function handleSignOut(): Promise<void> {
    await signOut({ callbackUrl: "/login" });
  }

  const navLinks = [
    { href: "/dashboard", label: "Deadlines", active: pathname === "/dashboard" },
    { href: "/settings", label: "Settings", active: pathname === "/settings" },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-page-surface border-r border-line/50 p-6">
        <div className="mb-8">
          <h2 className="text-sm font-medium text-text-primary">StayDue</h2>
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
            className="w-full text-left px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-urgency-todayText hover:bg-urgency-today/10 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav - stub for now */}
      <div className="lg:hidden" />
    </>
  );
}
