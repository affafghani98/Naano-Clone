import Link from "next/link";
import { redirectIfAuthenticated } from "@/lib/auth";
import {
  DEMO_CREATOR_EMAIL,
  DEMO_CREATOR_PASSWORD,
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from "@/lib/demo-account";
import { AuthForm } from "../_components/auth-form";
import { login } from "../actions/auth";

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Naano
      </Link>
      <section className="mt-16 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Brand demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            Creator demo: {DEMO_CREATOR_EMAIL} / {DEMO_CREATOR_PASSWORD}
          </p>
        </div>
        <AuthForm action={login} submitLabel="Log in" />
        <p className="text-sm text-neutral-600">
          No account?{" "}
          <Link href="/signup" className="underline">
            Get started
          </Link>
        </p>
      </section>
    </main>
  );
}
