import { Suspense } from "react";
import { getAdminUsers } from "@/lib/admin";
import UserTable from "@/components/admin/users/UserTable";
import UserSearchBar from "@/components/admin/users/UserSearchBar";
import UserFilterBar from "@/components/admin/users/UserFilterBar";

const PAGE_SIZE = 30;

interface PageProps {
  searchParams: Promise<{ tier?: string; onboarded?: string; search?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { tier, onboarded, search, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  const { users, total } = await getAdminUsers(
    { tier, onboarded, search },
    page,
    PAGE_SIZE
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildPageUrl(p: number) {
    const params = new URLSearchParams();
    if (tier) params.set("tier", tier);
    if (onboarded) params.set("onboarded", onboarded);
    if (search) params.set("search", search);
    params.set("page", String(p));
    return `/admin/users?${params.toString()}`;
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Users</h1>
        <p className="text-sm text-text-muted mt-0.5">{total.toLocaleString()} total</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Suspense>
          <UserSearchBar />
        </Suspense>
        <Suspense>
          <UserFilterBar />
        </Suspense>
      </div>

      <UserTable users={users} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-text-muted">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={buildPageUrl(page - 1)}
                className="px-3 py-1.5 text-sm bg-page-surface border border-line rounded-lg text-text-secondary hover:text-text-primary hover:bg-page-hover transition-colors"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={buildPageUrl(page + 1)}
                className="px-3 py-1.5 text-sm bg-page-surface border border-line rounded-lg text-text-secondary hover:text-text-primary hover:bg-page-hover transition-colors"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
