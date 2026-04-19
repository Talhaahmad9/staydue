import { getAdminRevenueStats } from "@/lib/admin";
import StatCard from "@/components/admin/StatCard";
import RevenueChart from "@/components/admin/charts/RevenueChart";
import PlanSplitChart from "@/components/admin/charts/PlanSplitChart";

export default async function AdminRevenuePage() {
  const stats = await getAdminRevenueStats();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Revenue</h1>
        <p className="text-sm text-text-muted mt-0.5">Active subscriptions only</p>
      </div>

      <section className="space-y-2">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Summary (PKR)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total collected"
            value={`₨ ${stats.totalRevenue.toLocaleString()}`}
            sub={`${stats.totalTransactions} transactions`}
            accent="brand"
          />
          <StatCard
            label="This month"
            value={`₨ ${stats.revenueThisMonth.toLocaleString()}`}
            sub={`${stats.transactionsThisMonth} transactions`}
          />
          <StatCard
            label="Monthly plan"
            value={`₨ ${stats.monthlyPlanRevenue.toLocaleString()}`}
          />
          <StatCard
            label="Semester plan"
            value={`₨ ${stats.semesterPlanRevenue.toLocaleString()}`}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart data={stats.revenueByMonth} />
        </div>
        <div>
          <PlanSplitChart data={stats.planSplit} />
        </div>
      </section>
    </div>
  );
}
