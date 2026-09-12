import { requireCreator } from "@/lib/auth";
import { db } from "@/lib/db";
import { CopyButton } from "../_components/copy-button";

export default async function CreatorCommunityPage() {
  const current = await requireCreator();
  const leaders = await db.creator.findMany({
    orderBy: { typicalReach: "desc" },
    take: 8,
  });
  const maxReach = leaders[0]?.typicalReach || 1;
  const dealLink = `https://naano.clone/c/${current.creator.slug}`;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Community</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Connect with other creators and share your card.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Join the Slack community</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Operator tips, campaign wins, and product updates.
          </p>
          <a
            href="https://slack.com"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white"
          >
            Open Slack invite
          </a>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Share your creator card</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Drop your Deal Link in the community when you ship a post.
          </p>
          <CopyButton
            label="Copy card link"
            value={dealLink}
            className="mt-4 rounded-full border border-neutral-200 px-4 py-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Naano campaign leaderboard</h2>
          <p className="text-xs text-neutral-500">
            Sorted by estimated impressions (mock)
          </p>
        </div>
        <ul className="mt-5 space-y-3">
          {leaders.map((creator, index) => (
            <li key={creator.id} className="flex items-center gap-3">
              <span className="w-6 text-sm text-neutral-500">{index + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={creator.photoUrl}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <p className="truncate font-medium">{creator.name}</p>
                  <p className="shrink-0 tabular-nums">
                    {creator.typicalReach.toLocaleString()}
                  </p>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-neutral-950"
                    style={{
                      width: `${Math.max(8, (creator.typicalReach / maxReach) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
