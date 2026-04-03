import Link from "next/link";
import { redirect } from "next/navigation";

import SignupForm from "@/components/auth/SignupForm";
import { auth } from "@/lib/auth";

export default async function SignupPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/onboarding");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
      <div className="w-full space-y-4">
        <SignupForm />
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-teal-700 hover:text-teal-800">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
