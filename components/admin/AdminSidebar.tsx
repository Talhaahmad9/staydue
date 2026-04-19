"use client";

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
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard, exact: false },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/revenue", label: "Revenue", icon: BarChart3, exact: false },
  { href: "/admin/discounts", label: "Discounts", icon: Tag, exact: false },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, exact: false },
  { href: "/admin/system", label: "System", icon: Activity, exact: false },
];

export default function AdminSidebar({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 hidden lg:flex flex-col bg-page-surface border-r border-line h-screen sticky top-0">
      <div className="h-14 flex items-center px-5 border-b border-line">
        <span className="text-sm font-semibold text-text-primary tracking-wide">StayDue Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
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
      </nav>

      <div className="px-4 py-4 border-t border-line">
        <Link
          href="/dashboard"
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          Back to app
        </Link>
      </div>
    </aside>
  );
}
