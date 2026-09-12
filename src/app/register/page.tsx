import Link from "next/link";
import { redirect } from "next/navigation";
import { redirectIfAuthenticated } from "@/lib/auth";
import { AuthForm } from "../_components/auth-form";
import { registerBrand, registerCreator } from "../actions/auth";
import { CreatorRegisterView } from "./creator-register-view";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  await redirectIfAuthenticated();
  const { role } = await searchParams;

  if (role === "influencer") {
    return <CreatorRegisterView />;
  }

  if (role !== "saas") {
    redirect("/signup");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Naano
      </Link>
      <section className="mt-16 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Create a brand account</h1>
          <p className="mt-2 text-sm text-neutral-600">Email and password only. No OAuth.</p>
        </div>
        <AuthForm action={registerBrand} submitLabel="Continue to onboarding" includeName />
        <p className="text-sm text-neutral-600">
          Already registered?{" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
