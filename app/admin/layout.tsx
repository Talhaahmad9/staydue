import type { Metadata } from "next";
import { SubscriptionModel, connectToDatabase } from "@/lib/mongodb";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import AdminProviders from "@/components/admin/AdminProviders";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connectToDatabase();
  const pendingCount = await SubscriptionModel.countDocuments({ status: "pending" });

  return (
    <div className="flex min-h-screen bg-page-bg">
      <AdminSidebar pendingCount={pendingCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminMobileNav pendingCount={pendingCount} />
        <AdminProviders>{children}</AdminProviders>
      </div>
    </div>
  );
}
