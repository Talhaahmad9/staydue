import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminUserDetail } from "@/lib/admin";
import UserProControl from "@/components/admin/users/UserProControl";
import SubscriptionRow from "@/components/admin/subscriptions/SubscriptionRow";

function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className="text-sm text-text-primary">{value}</p>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getAdminUserDetail(id);
  if (!user) notFound();

  const tierLabel = user.isPro ? "Pro" : user.trialStartedAt ? "Trial" : "Free";
  const tierColor = user.isPro ? "text-brand" : user.trialStartedAt ? "text-amber-400" : "text-text-muted";

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/users"
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-page-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">{user.name}</h1>
          <p className="text-sm text-text-muted">{user.email}</p>
        </div>
        <span className={`ml-auto text-sm font-medium ${tierColor}`}>{tierLabel}</span>
      </div>

      {/* Profile */}
      <section className="bg-page-surface border border-line rounded-xl p-4 space-y-4">
        <p className="text-sm font-medium text-text-primary">Profile</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoRow label="Joined" value={formatDate(user.createdAt)} />
          <InfoRow label="Admission year" value={user.admissionYear ?? "—"} />
          <InfoRow label="Timezone" value={user.timezone} />
          <InfoRow label="Verified" value={user.isVerified ? "Yes" : "No"} />
          <InfoRow label="Onboarded" value={user.hasCompletedOnboarding ? "Yes" : "No"} />
          <InfoRow label="Phone" value={user.phone ?? "Not set"} />
          <InfoRow label="Calendar URL" value={user.calendarUrl ?? "Not set"} />
          <InfoRow label="WhatsApp trial used" value={String(user.whatsappTrialUsed)} />
          <InfoRow label="Email notifications" value={user.notificationEmailEnabled ? "On" : "Off"} />
          <InfoRow label="Reminder intervals" value={user.reminderIntervals.join(", ") || "—"} />
        </div>
      </section>

      {/* Deadlines */}
      <section className="bg-page-surface border border-line rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium text-text-primary">Deadlines</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-page-bg rounded-lg p-3">
            <p className="text-xs text-text-muted mb-1">Total</p>
            <p className="text-2xl font-semibold text-text-primary">{user.deadlineCount}</p>
          </div>
          <div className="bg-page-bg rounded-lg p-3">
            <p className="text-xs text-text-muted mb-1">Overdue</p>
            <p className="text-2xl font-semibold text-red-400">{user.overdueCount}</p>
          </div>
          <div className="bg-page-bg rounded-lg p-3">
            <p className="text-xs text-text-muted mb-1">Done</p>
            <p className="text-2xl font-semibold text-green-400">{user.doneCount}</p>
          </div>
        </div>
      </section>

      {/* Pro control */}
      <UserProControl userId={user.id} isPro={user.isPro} hasTrial={!!user.trialStartedAt} />

      {/* Access status dates */}
      {(user.isPro || user.trialStartedAt) && (() => {
        const activeSub = user.subscriptions.find((s) => s.status === "active");
        const trialExpiresAt = user.trialStartedAt
          ? new Date(new Date(user.trialStartedAt).getTime() + 7 * 24 * 60 * 60 * 1000)
          : null;
        return (
          <section className="bg-page-surface border border-line rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-text-primary">
              {user.isPro ? "Pro access dates" : "Trial access dates"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {user.isPro && (
                <>
                  <InfoRow
                    label="Pro started"
                    value={activeSub?.startDate ? formatDate(activeSub.startDate) : "Manually granted"}
                  />
                  <InfoRow label="Pro expires" value={formatDate(user.proExpiresAt)} />
                </>
              )}
              {!user.isPro && user.trialStartedAt && (
                <>
                  <InfoRow label="Trial started" value={formatDate(user.trialStartedAt)} />
                  <InfoRow label="Trial expires" value={formatDate(trialExpiresAt)} />
                </>
              )}
            </div>
          </section>
        );
      })()}

      {/* Subscription history */}
      {user.subscriptions.length > 0 && (
        <section className="space-y-2">
          <p className="text-sm font-medium text-text-primary">Subscription history</p>
          {user.subscriptions.map((sub) => (
            <SubscriptionRow key={sub.id} sub={sub} />
          ))}
        </section>
      )}
    </div>
  );
}
