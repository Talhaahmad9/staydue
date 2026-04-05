import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

interface ResetPasswordPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps): Promise<React.ReactElement> {
  const session = await getServerSession(authOptions);

  // If user is already logged in, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  // Require token parameter
  if (!token) {
    redirect("/forgot-password");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page-bg px-4 py-6">
      <div className="w-full max-w-md">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
