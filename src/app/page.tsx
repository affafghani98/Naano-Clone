import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-between px-6 py-10">
      <header className="flex items-center justify-between">
        <p className="text-lg font-semibold tracking-tight">Naano</p>
        <Link href="/login" className="text-sm underline-offset-4 hover:underline">
          Log in
        </Link>
      </header>
      <section className="space-y-6 py-24">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          B2B influence
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          The B2B LinkedIn Creator Marketplace.
        </h1>
        <p className="max-w-xl text-lg text-neutral-600">
          Find the creators your buyers already trust, launch campaigns, and track
          what each post produces.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium"
          >
            Log in
          </Link>
        </div>
      </section>
      <p className="text-sm text-neutral-500">Brand side only in this rebuild.</p>
    </main>
  );
}
