import { Suspense } from "react";
import { getAdminSubscriptions } from "@/lib/admin";
import SubscriptionRow from "@/components/admin/subscriptions/SubscriptionRow";
import SubscriptionFilterTabs from "@/components/admin/subscriptions/SubscriptionFilterTabs";
import { SubscriptionModel, connectToDatabase } from "@/lib/mongodb";

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminSubscriptionsPage({ searchParams }: PageProps) {
  const { status = "pending", page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  await connectToDatabase();
  const pendingCount = await SubscriptionModel.countDocuments({ status: "pending" });
  const { subscriptions, total } = await getAdminSubscriptions(status, page, PAGE_SIZE);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Subscriptions</h1>
        <p className="text-sm text-text-muted mt-0.5">{total} total</p>
      </div>

      <Suspense>
        <SubscriptionFilterTabs pendingCount={pendingCount} />
      </Suspense>

      <div className="space-y-2">
        {subscriptions.length === 0 ? (
          <div className="text-center py-12 bg-page-surface border border-line rounded-xl">
            <p className="text-text-secondary text-sm">No subscriptions found</p>
          </div>
        ) : (
          subscriptions.map((sub) => (
            <SubscriptionRow key={sub.id} sub={sub} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-text-muted">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/subscriptions?status=${status}&page=${page - 1}`}
                className="px-3 py-1.5 text-sm bg-page-surface border border-line rounded-lg text-text-secondary hover:text-text-primary hover:bg-page-hover transition-colors"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/subscriptions?status=${status}&page=${page + 1}`}
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
