import { requireCreator } from "@/lib/auth";

export default async function CreatorAnalyticsPage() {
  const current = await requireCreator();

  const stats = [
    { label: "Public posts", value: String(current.creator.postsAnalyzed || 0) },
    { label: "Public post reach", value: "Pending" },
    { label: "Public engagements", value: "—" },
    {
      label: "LinkedIn followers",
      value: current.creator.followers.toLocaleString(),
    },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Public LinkedIn performance imported for this profile.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Public LinkedIn snapshot</h2>
        <p className="mt-2 text-sm text-neutral-600">
          0% of imported posts have reach data.
        </p>
        <span className="mt-3 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs">
          No public post found yet
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Recent LinkedIn posts</h2>
          <p className="mt-4 text-sm text-neutral-500">
            Public post import in progress
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Public profile summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">LinkedIn followers</dt>
              <dd>{current.creator.followers.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Public posts</dt>
              <dd>{current.creator.postsAnalyzed || 0}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Posts with reach data</dt>
              <dd>0</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Public engagements</dt>
              <dd>—</dd>
            </div>
          </dl>
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Public LinkedIn data is being prepared… No personal LinkedIn connection is
        required.
      </p>
    </section>
  );
}
