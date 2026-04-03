import Link from "next/link";
import { redirect } from "next/navigation";

import LoginForm from "@/components/auth/LoginForm";
import { auth } from "@/lib/auth";

export default async function LoginPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/onboarding");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
      <div className="w-full space-y-4">
        <LoginForm />
        <p className="text-sm text-gray-500">
          New to StayDue?{" "}
          <Link href="/signup" className="font-medium text-teal-700 hover:text-teal-800">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
