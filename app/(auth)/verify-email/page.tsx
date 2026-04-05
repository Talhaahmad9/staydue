import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";

interface VerifyEmailPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps): Promise<React.ReactElement> {
  const session = await getServerSession(authOptions);

  // If user is already logged in and verified, redirect to dashboard
  if (session?.user?.isVerified) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const email = typeof params.email === "string" ? decodeURIComponent(params.email) : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-page-bg px-4 py-6">
      <div className="w-full max-w-md">
        <VerifyEmailForm email={email} />
      </div>
    </div>
  );
}
