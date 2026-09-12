import Link from "next/link";
import { redirectIfAuthenticated } from "@/lib/auth";
import {
  DEMO_CREATOR_EMAIL,
  DEMO_CREATOR_PASSWORD,
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from "@/lib/demo-account";
import { AuthForm } from "../_components/auth-form";
import { login, loginDemoAccount } from "../actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await redirectIfAuthenticated();
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Naano
      </Link>
      <section className="mt-16 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Email and password. No one-time codes.
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            Each email is linked to one account type, brand or creator. Use a
            different email if you need the other role.
          </p>
        </div>

        {error === "demo-missing" ? (
          <p className="text-sm text-red-700">
            Demo accounts missing — run{" "}
            <code className="font-mono">npm run db:seed</code>.
          </p>
        ) : null}

        <AuthForm action={login} submitLabel="Log in" />

        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Instant demo
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <form action={loginDemoAccount}>
              <input type="hidden" name="role" value="brand" />
              <button
                type="submit"
                className="w-full rounded-full border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Brand demo
              </button>
            </form>
            <form action={loginDemoAccount}>
              <input type="hidden" name="role" value="creator" />
              <button
                type="submit"
                className="w-full rounded-full border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Creator demo
              </button>
            </form>
          </div>
          <p className="text-xs text-neutral-500">
            {DEMO_EMAIL} / {DEMO_PASSWORD} · {DEMO_CREATOR_EMAIL} /{" "}
            {DEMO_CREATOR_PASSWORD}
          </p>
        </div>

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
