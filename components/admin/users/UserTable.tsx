import Link from "next/link";
import type { AdminUser } from "@/lib/admin";
import DeleteUserButton from "@/components/admin/users/DeleteUserButton";

const TRIAL_MS = 30 * 24 * 60 * 60 * 1000;

function isTrialActive(trialStartedAt: Date | string): boolean {
  return new Date().getTime() - new Date(trialStartedAt).getTime() < TRIAL_MS;
}

function TierBadge({ user }: { user: AdminUser }) {
  if (user.isPro) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-brand/15 text-brand border border-brand/30">
        Pro
      </span>
    );
  }
  if (user.trialStartedAt) {
    if (isTrialActive(user.trialStartedAt)) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
          Trial
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-urgency-today/15 text-urgency-todayText border border-urgency-todayBorder">
        Trial ended
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-page-hover text-text-muted border border-line">
      Free
    </span>
  );
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

interface Props {
  users: AdminUser[];
}

export default function UserTable({ users }: Props) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-page-surface border border-line rounded-xl">
        <p className="text-text-secondary text-sm">No users found</p>
      </div>
    );
  }

  return (
    <div className="border border-line rounded-xl overflow-hidden">
      {/* Desktop table header */}
      <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2.5 bg-page-surface border-b border-line">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">User</p>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Tier</p>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Status</p>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Admission</p>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Joined</p>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider w-8" />
      </div>

      <div className="divide-y divide-line">
        {users.map((user) => (
          <div key={user.id} className="bg-page-bg hover:bg-page-surface transition-colors">
            {/* Mobile layout */}
            <div className="flex sm:hidden items-start gap-2 px-4 py-3">
              <Link href={`/admin/users/${user.id}`} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                <p className="text-xs text-text-muted truncate">{user.email}</p>
              </Link>
              <div className="flex flex-col items-end gap-1">
                <TierBadge user={user} />
                <p className="text-xs text-text-muted">{formatDate(user.createdAt)}</p>
                <DeleteUserButton userId={user.id} userName={user.name} />
              </div>
            </div>

            {/* Desktop layout — Link spans 5 cols via subgrid, delete in col 6 */}
            <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] sm:gap-4">
              <Link
                href={`/admin/users/${user.id}`}
                className="col-span-5 grid grid-cols-subgrid gap-4 px-4 py-3 items-center"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                  <p className="text-xs text-text-muted truncate">{user.email}</p>
                </div>
                <div>
                  <TierBadge user={user} />
                </div>
                <div className="flex items-center">
                  {user.hasCompletedOnboarding ? (
                    <span className="text-xs text-green-400">Onboarded</span>
                  ) : (
                    <span className="text-xs text-text-muted">Pending</span>
                  )}
                </div>
                <p className="text-sm text-text-secondary">{user.admissionYear ?? "—"}</p>
                <p className="text-sm text-text-secondary">{formatDate(user.createdAt)}</p>
              </Link>
              <div className="flex items-center pr-3">
                <DeleteUserButton userId={user.id} userName={user.name} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
