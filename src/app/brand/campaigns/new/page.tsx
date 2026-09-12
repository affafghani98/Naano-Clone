import Link from "next/link";

const PATHS = [
  {
    href: "/brand/campaigns/new/team",
    title: "Launch free with the Naano team",
    body: "Book a call and we’ll help you set up the brief, matching, and first bookings.",
    cta: "Book a setup call",
  },
  {
    href: "/brand/campaigns/new/ai",
    title: "Create with AI",
    body: "Answer a few questions and Naano drafts an editable creator brief for you.",
    cta: "Start with AI",
  },
  {
    href: "/brand/campaigns/new/from-link",
    title: "Start from your link",
    body: "Paste an existing campaign or landing-page URL and reuse its structure.",
    cta: "Paste a link",
  },
] as const;

export default function NewCampaignPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/brand/campaigns" className="text-sm underline">
          Back to campaigns
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          How do you want to launch your campaign?
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Pick a path to continue. AI drafting and link import are stubs in this
          demo — the screens exist so nothing 404s.
        </p>
      </div>

      <div className="grid gap-4">
        {PATHS.map((path) => (
          <Link
            key={path.href}
            href={path.href}
            className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400"
          >
            <h2 className="text-lg font-semibold">{path.title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{path.body}</p>
            <p className="mt-4 text-sm font-medium underline">{path.cta}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
