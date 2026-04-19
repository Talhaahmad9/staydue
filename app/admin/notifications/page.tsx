import { getAdminNotificationStats } from "@/lib/admin";
import StatCard from "@/components/admin/StatCard";
import NotificationChart from "@/components/admin/charts/NotificationChart";

export default async function AdminNotificationsPage() {
  const stats = await getAdminNotificationStats();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Notifications</h1>
        <p className="text-sm text-text-muted mt-0.5">Aggregated send activity across all users</p>
      </div>

      <section className="space-y-2">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Reminder sends</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard label="Total reminder sends" value={stats.totalReminderSends} accent="brand" />
          <StatCard label="Last 7 days" value={stats.reminderSendsLast7Days} sub="reminder emails" />
          <StatCard label="Total overdue notices" value={stats.totalOverdueSends} accent="warning" />
          <StatCard label="WhatsApp trial sends" value={stats.totalWhatsappTrialUsed} />
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">User reach</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Users with phone" value={stats.usersWithPhone} sub="WhatsApp-eligible" accent="brand" />
          <StatCard
            label="Email disabled"
            value={stats.usersWithEmailDisabled}
            accent={stats.usersWithEmailDisabled > 0 ? "danger" : "default"}
            sub="opted out of email"
          />
        </div>
      </section>

      <NotificationChart data={stats.sendsByDay} />
    </div>
  );
}
