import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Naano
      </Link>
      <section className="mt-16 space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">How will you use Naano?</h1>
        <p className="text-neutral-600">Choose a role to continue.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/register?role=saas"
            className="rounded-2xl border border-neutral-300 bg-white p-6 hover:border-neutral-950"
          >
            <p className="text-sm uppercase tracking-wide text-neutral-500">Brand</p>
            <p className="mt-2 text-xl font-medium">I want to book creators</p>
            <p className="mt-2 text-sm text-neutral-600">
              Company signup, onboarding, marketplace, and campaigns.
            </p>
          </Link>
          <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-neutral-500">
            <p className="text-sm uppercase tracking-wide">Creator</p>
            <p className="mt-2 text-xl font-medium text-neutral-700">
              I create sponsored posts
            </p>
            <p className="mt-2 text-sm">
              Creator signup is out of scope for this rebuild.
            </p>
          </div>
        </div>
        <p className="text-sm text-neutral-600">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
