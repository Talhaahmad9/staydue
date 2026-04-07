"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Settings, LogOut } from "lucide-react";
import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

interface ProfileDropdownProps {
  userInitials: string;
  userName: string;
}

export default function ProfileDropdown({
  userInitials,
  userName,
}: ProfileDropdownProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("[dashboard/signout]", error);
      setIsSigningOut(false);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-brand-light border border-brand/40 flex items-center justify-center text-brand text-xs font-medium hover:bg-brand hover:text-white transition-colors"
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        {userInitials}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-48 bg-page-card border border-line/50 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-50 overflow-hidden">
          <div className="p-4 border-b border-line-subtle">
            <p className="text-sm text-text-primary truncate font-medium">
              {userName}
            </p>
            <p className="text-xs text-text-muted">Account owner</p>
          </div>

          <div className="py-2">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-page-hover transition-colors"
            >
              <Settings size={16} />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-urgency-todayText hover:bg-urgency-today/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-text-secondary disabled:hover:bg-transparent"
            >
              {isSigningOut ? <ButtonLoader /> : <><LogOut size={16} />Sign out</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
