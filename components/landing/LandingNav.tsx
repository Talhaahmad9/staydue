"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "How it works", href: "/how-to-get-url" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/#about" },
];

export default function LandingNav(): React.ReactElement {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-line/50 bg-page-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center relative">
        <Link href="/" className="shrink-0">
          <Image
            src="/staydue_logo.svg"
            alt="StayDue"
            width={260}
            height={86}
            priority
            className="h-auto w-[160px] md:w-[180px] lg:w-[260px]"
          />
        </Link>

        {/* Center nav links — desktop only */}
        <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right CTAs — desktop only */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <Link
            href="/login"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Create account
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto p-2 text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden border-t border-line/50 bg-page-surface overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors py-3 border-b border-line-subtle last:border-0"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center rounded-lg border border-line hover:border-line-strong hover:bg-page-hover text-text-secondary hover:text-text-primary text-sm font-medium px-4 py-2.5 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium px-4 py-2.5 transition-colors"
                >
                  Create account
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
