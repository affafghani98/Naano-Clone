import Link from "next/link";

export default function CreateWithAiPage() {
  return (
    <section className="mx-auto max-w-xl space-y-4">
      <Link href="/brand/campaigns/new" className="text-sm underline">
        Back
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Create with AI</h1>
      <p className="text-sm text-neutral-600">
        Stub only. Live Naano asks a few questions and generates an editable
        brief. This demo does not call a model.
      </p>
      <Link
        href="/brand/campaigns"
        className="inline-flex rounded-full border border-neutral-300 px-4 py-2 text-sm"
      >
        Return to campaigns
      </Link>
    </section>
  );
}
