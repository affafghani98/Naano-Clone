import Link from "next/link";
import { redirect } from "next/navigation";
import { redirectIfAuthenticated } from "@/lib/auth";
import { isAuthIntent } from "@/lib/login-code";
import { VerifyCodeForm } from "../_components/verify-code-form";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string;
    intent?: string;
    name?: string;
    dev?: string;
  }>;
}) {
  await redirectIfAuthenticated();
  const params = await searchParams;
  const email = (params.email ?? "").trim().toLowerCase();
  const intent = params.intent ?? "";
  const name = (params.name ?? "").trim();

  if (!email || !isAuthIntent(intent)) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Naano
      </Link>
      <section className="mt-16 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Enter your code
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            We sent a 6-digit code to <span className="font-medium">{email}</span>.
            It expires in 10 minutes.
          </p>
        </div>
        <VerifyCodeForm
          email={email}
          intent={intent}
          name={name || undefined}
          showDevHint={params.dev === "1"}
        />
        <p className="text-sm text-neutral-600">
          Wrong email?{" "}
          <Link
            href={
              intent === "login"
                ? "/login"
                : intent === "signup_creator"
                  ? "/register?role=influencer"
                  : "/register?role=saas"
            }
            className="underline"
          >
            Go back
          </Link>
        </p>
      </section>
    </main>
  );
}
