import Link from "next/link";

export default function StartFromLinkPage() {
  return (
    <section className="mx-auto max-w-xl space-y-4">
      <Link href="/brand/campaigns/new" className="text-sm underline">
        Back
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">
        Start from your link
      </h1>
      <p className="text-sm text-neutral-600">
        Stub only. Live Naano would reuse structure from a pasted campaign or
        landing-page URL.
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
