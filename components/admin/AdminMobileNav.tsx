"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  BarChart3,
  Tag,
  Bell,
  Activity,
  MessageSquareQuote,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard, exact: false },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/revenue", label: "Revenue", icon: BarChart3, exact: false },
  { href: "/admin/discounts", label: "Discounts", icon: Tag, exact: false },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, exact: false },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, exact: false },
  { href: "/admin/system", label: "System", icon: Activity, exact: false },
];

export default function AdminMobileNav({ pendingCount }: { pendingCount: number }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div className="lg:hidden h-14 flex items-center px-4 border-b border-line bg-page-surface sticky top-0 z-40">
        <span className="text-sm font-semibold text-text-primary flex-1">StayDue Admin</span>
        {pendingCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-medium rounded-full min-w-5 h-5 flex items-center justify-center px-1.5 mr-3">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 -mr-1 text-text-secondary hover:text-text-primary transition-colors"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            {/* Drawer */}
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-page-surface border-r border-line z-50 lg:hidden flex flex-col"
            >
              <div className="h-14 flex items-center px-5 border-b border-line">
                <span className="text-sm font-semibold text-text-primary">StayDue Admin</span>
              </div>
              <div className="flex-1 overflow-y-auto py-3 px-2">
                {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors ${
                        active
                          ? "bg-brand/10 text-brand font-medium"
                          : "text-text-secondary hover:text-text-primary hover:bg-page-hover"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{label}</span>
                      {label === "Subscriptions" && pendingCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-medium rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
                          {pendingCount > 99 ? "99+" : pendingCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
              <div className="px-4 py-4 border-t border-line">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2 text-xs text-text-muted hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
