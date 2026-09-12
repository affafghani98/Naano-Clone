import Link from "next/link";

export default function LaunchWithTeamPage() {
  return (
    <section className="mx-auto max-w-xl space-y-4">
      <Link href="/brand/campaigns/new" className="text-sm underline">
        Back
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">
        Launch free with the Naano team
      </h1>
      <p className="text-sm text-neutral-600">
        On the live product this books a setup call. Here it opens the same Cal
        stub used elsewhere in the app.
      </p>
      <a
        href="https://cal.com"
        target="_blank"
        rel="noreferrer"
        className="inline-flex rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white"
      >
        Book a setup call
      </a>
    </section>
  );
}
