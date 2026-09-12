import Link from "next/link";

const PATHS = [
  {
    href: "/brand/campaigns/new/manual",
    title: "Write a brief yourself",
    body: "Title, description, product, and audience. Publish when ready so creators can apply.",
    cta: "Create brief",
    badge: null as string | null,
  },
  {
    href: "/brand/campaigns/new/ai",
    title: "Create with AI",
    body: "Answer a few questions and Naano drafts an editable creator brief for you.",
    cta: "Start with AI",
    badge: null,
  },
  {
    href: "/brand/campaigns/new/from-link",
    title: "Start from your link",
    body: "Paste an existing campaign or landing page URL. Demo only, no live crawl.",
    cta: "Paste a link",
    badge: "Demo only",
  },
  {
    href: "/brand/campaigns/new/team",
    title: "Launch free with the Naano team",
    body: "Opens a generic Cal.com page. Demo only, not a live Naano scheduler.",
    cta: "Book a setup call",
    badge: "Demo only",
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
          Write a brief yourself or create with AI for a live campaign creators
          can apply to.
        </p>
      </div>

      <div className="grid gap-4">
        {PATHS.map((path) => (
          <Link
            key={path.href}
            href={path.href}
            className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{path.title}</h2>
              {path.badge ? (
                <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                  {path.badge}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-neutral-600">{path.body}</p>
            <p className="mt-4 text-sm font-medium underline">{path.cta}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
