import Link from "next/link";

export default function StartFromLinkPage() {
  return (
    <section className="mx-auto max-w-xl space-y-4">
      <Link href="/brand/campaigns/new" className="text-sm underline">
        Back
      </Link>
      <p className="text-xs uppercase tracking-wide text-neutral-500">Demo only</p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Start from your link
      </h1>
      <p className="text-sm text-neutral-600">
        This path is not wired. Use Write a brief yourself or Create with AI for
        a live campaign.
      </p>
      <label className="block space-y-1 text-sm">
        <span>Campaign URL</span>
        <input
          type="url"
          placeholder="https://"
          disabled
          className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2"
        />
      </label>
      <button
        type="button"
        disabled
        className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white opacity-50"
      >
        Continue
      </button>
    </section>
  );
}
