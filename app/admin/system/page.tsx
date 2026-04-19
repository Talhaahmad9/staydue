import { getAdminSystemHealth, getAdminCronLogs } from "@/lib/admin";
import StatCard from "@/components/admin/StatCard";

const CRON_JOBS = [
  { name: "Send reminders", path: "/api/cron/notify", schedule: "00:05, 06:05, 12:05 UTC", pkt: "05:05, 11:05, 17:05 PKT" },
  { name: "Expire subscriptions", path: "/api/cron/expire-subscriptions", schedule: "00:00 UTC", pkt: "05:00 PKT" },
];

export default async function AdminSystemPage() {
  const [health, cronLogs] = await Promise.all([
    getAdminSystemHealth(),
    getAdminCronLogs(20),
  ]);

  const totalDeadlines =
    health.deadlineStatusCounts.upcoming +
    health.deadlineStatusCounts.overdue +
    health.deadlineStatusCounts.done;

  const lastSyncLabel = health.lastDeadlineCreatedAt
    ? health.lastDeadlineCreatedAt.toLocaleString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" })
    : "No data";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">System Health</h1>
        <p className="text-sm text-text-muted mt-0.5">Data integrity checks and cron schedule</p>
      </div>

      {/* Alerts */}
      {health.expiredProCount > 0 && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <span className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
          <p className="text-sm text-red-300">
            <span className="font-medium">{health.expiredProCount} user{health.expiredProCount > 1 ? "s" : ""}</span> still marked Pro but their subscription has expired. The expire-subscriptions cron may not be running correctly.
          </p>
        </div>
      )}

      {health.orphanedPendingSubs > 0 && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
          <p className="text-sm text-amber-300">
            <span className="font-medium">{health.orphanedPendingSubs} subscription{health.orphanedPendingSubs > 1 ? "s" : ""}</span> have been pending for over 7 days. These may be stale or abandoned.
          </p>
        </div>
      )}

      {/* Users */}
      <section className="space-y-2">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Users</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard label="Total users" value={health.totalUsers} />
          <StatCard label="Verified" value={health.totalVerifiedUsers} sub={`${Math.round((health.totalVerifiedUsers / Math.max(health.totalUsers, 1)) * 100)}%`} />
          <StatCard
            label="Expired Pro (not fixed)"
            value={health.expiredProCount}
            accent={health.expiredProCount > 0 ? "danger" : "default"}
          />
          <StatCard
            label="Onboarded, no calendar"
            value={health.onboardedWithoutCalendar}
            accent={health.onboardedWithoutCalendar > 0 ? "warning" : "default"}
            sub="missing URL"
          />
        </div>
      </section>

      {/* Deadlines */}
      <section className="space-y-2">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Deadlines</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard label="Total" value={totalDeadlines} />
          <StatCard label="Upcoming" value={health.deadlineStatusCounts.upcoming} accent="brand" />
          <StatCard label="Overdue" value={health.deadlineStatusCounts.overdue} accent="danger" />
          <StatCard label="Done" value={health.deadlineStatusCounts.done} accent="success" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <StatCard label="Discount code uses" value={health.totalDiscountUsed} />
          <StatCard label="Last calendar sync" value={lastSyncLabel} />
        </div>
      </section>

      {/* Cron Schedule */}
      <section className="space-y-2">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Cron schedule</p>
        <div className="bg-page-surface border border-line rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left text-text-muted font-medium text-xs px-4 py-3">Job</th>
                <th className="text-left text-text-muted font-medium text-xs px-4 py-3 hidden sm:table-cell">Path</th>
                <th className="text-left text-text-muted font-medium text-xs px-4 py-3">UTC</th>
                <th className="text-left text-text-muted font-medium text-xs px-4 py-3 hidden md:table-cell">PKT</th>
              </tr>
            </thead>
            <tbody>
              {CRON_JOBS.map((job, i) => (
                <tr key={job.path} className={i < CRON_JOBS.length - 1 ? "border-b border-line" : ""}>
                  <td className="px-4 py-3 text-text-primary font-medium">{job.name}</td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs hidden sm:table-cell">{job.path}</td>
                  <td className="px-4 py-3 text-text-secondary">{job.schedule}</td>
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell">{job.pkt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cron Run History */}
      <section className="space-y-2">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Notify cron — last 20 runs</p>
        {cronLogs.length === 0 ? (
          <div className="bg-page-surface border border-line rounded-xl px-4 py-6 text-center text-sm text-text-muted">
            No cron runs recorded yet. Logs appear after the next cron execution.
          </div>
        ) : (
          <div className="bg-page-surface border border-line rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left text-text-muted font-medium text-xs px-4 py-3">Run at (PKT)</th>
                  <th className="text-left text-text-muted font-medium text-xs px-4 py-3">Reminders</th>
                  <th className="text-left text-text-muted font-medium text-xs px-4 py-3">Overdue</th>
                  <th className="text-left text-text-muted font-medium text-xs px-4 py-3">WhatsApp</th>
                  <th className="text-left text-text-muted font-medium text-xs px-4 py-3">Errors</th>
                  <th className="text-left text-text-muted font-medium text-xs px-4 py-3">Duration</th>
                </tr>
              </thead>
              <tbody>
                {cronLogs.map((run, i) => (
                  <tr key={run.id} className={i < cronLogs.length - 1 ? "border-b border-line" : ""}>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {run.runAt.toLocaleString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 text-text-primary">{run.remindersSent}</td>
                    <td className="px-4 py-3 text-text-primary">{run.overduesSent}</td>
                    <td className="px-4 py-3 text-text-primary">{run.whatsappReminderSent + run.whatsappOverdueSent}</td>
                    <td className={`px-4 py-3 font-medium ${run.errors > 0 ? "text-red-400" : "text-text-muted"}`}>
                      {run.errors}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs">{run.durationMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
