import { getAdminOverviewStats } from "@/lib/admin";
import StatCard from "@/components/admin/StatCard";
import SignupChart from "@/components/admin/charts/SignupChart";
import TierChart from "@/components/admin/charts/TierChart";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const stats = await getAdminOverviewStats();

  const onboardingRate =
    stats.totalUsers > 0 ? Math.round((stats.onboardedUsers / stats.totalUsers) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Overview</h1>
        <p className="text-sm text-text-muted mt-0.5">Live snapshot of StayDue</p>
      </div>

      {/* Pending alert */}
      {stats.pendingSubscriptions > 0 && (
        <Link href="/admin/subscriptions?status=pending">
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 hover:bg-amber-500/15 transition-colors cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <p className="text-sm text-amber-300 font-medium">
              {stats.pendingSubscriptions} subscription{stats.pendingSubscriptions > 1 ? "s" : ""} waiting for review
            </p>
          </div>
        </Link>
      )}

      {/* Users */}
      <section className="space-y-2">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Users</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <StatCard label="Total users" value={stats.totalUsers} />
          <StatCard label="Verified" value={stats.verifiedUsers} sub={`${Math.round((stats.verifiedUsers / Math.max(stats.totalUsers, 1)) * 100)}% of total`} />
          <StatCard label="Onboarded" value={stats.onboardedUsers} sub={`${onboardingRate}% conversion`} />
          <StatCard label="Pro" value={stats.proUsers} accent="brand" />
          <StatCard label="Trial" value={stats.trialUsers} accent="warning" />
          <StatCard label="Free" value={stats.freeUsers} />
        </div>
      </section>

      {/* Revenue */}
      <section className="space-y-2">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Revenue (PKR)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Total collected" value={`₨ ${stats.totalRevenue.toLocaleString()}`} accent="brand" />
          <StatCard label="This month" value={`₨ ${stats.revenueThisMonth.toLocaleString()}`} />
          <StatCard
            label="Pending review"
            value={stats.pendingSubscriptions}
            sub="tap to review"
            accent={stats.pendingSubscriptions > 0 ? "danger" : "default"}
          />
        </div>
      </section>

      {/* System */}
      <section className="space-y-2">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Data</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Total deadlines" value={stats.totalDeadlines.toLocaleString()} />
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SignupChart data={stats.signupsLast30Days} />
        </div>
        <div>
          <TierChart data={stats.tierBreakdown} />
        </div>
      </section>
    </div>
  );
}
