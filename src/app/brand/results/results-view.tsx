"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ReachChart } from "../creators/reach-chart";
import {
  committedBudgetLabel,
  formatResultsStat,
  type AttributionRow,
  type ResultsSnapshot,
} from "@/lib/results";

type CampaignOption = { id: string; title: string };

type Props = {
  campaigns: CampaignOption[];
  snapshots: Record<string, ResultsSnapshot>;
  allSnapshot: ResultsSnapshot;
};

const TABS = [
  { id: "analytics", label: "Analytics" },
  { id: "leads", label: "Leads" },
  { id: "posts", label: "Posts" },
] as const;

export function ResultsView({ campaigns, snapshots, allSnapshot }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("analytics");
  const [campaignId, setCampaignId] = useState("all");
  const [range, setRange] = useState<"week" | "month">("month");

  const snapshot = useMemo(() => {
    if (campaignId === "all") {
      return allSnapshot;
    }
    return snapshots[campaignId] ?? emptySnapshot();
  }, [allSnapshot, campaignId, snapshots]);

  const series = range === "week" ? snapshot.weekSeries : snapshot.monthSeries;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Results</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Reach and clicks are mocked. Attribution rows use creators you have
            actually booked.
          </p>
        </div>
        <select
          value={campaignId}
          onChange={(event) => setCampaignId(event.target.value)}
          className="rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All campaigns</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              tab === item.id
                ? "bg-neutral-950 text-white"
                : "border border-neutral-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "analytics" ? (
        <AnalyticsPanel
          snapshot={snapshot}
          series={series}
          range={range}
          onRange={setRange}
        />
      ) : null}
      {tab === "leads" ? <LeadsPanel snapshot={snapshot} /> : null}
      {tab === "posts" ? <PostsPanel snapshot={snapshot} /> : null}
    </section>
  );
}

function AnalyticsPanel({
  snapshot,
  series,
  range,
  onRange,
}: {
  snapshot: ResultsSnapshot;
  series: number[];
  range: "week" | "month";
  onRange: (value: "week" | "month") => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Est. reach"
          value={formatResultsStat(snapshot.estimatedReach)}
        />
        <StatCard
          label="Qualified clicks (last 30 days)"
          value={formatResultsStat(snapshot.qualifiedClicks)}
        />
        <StatCard
          label="Committed budget"
          value={committedBudgetLabel(
            snapshot.committedBudgetCents,
            snapshot.bookingCount,
          )}
        />
      </div>

      <article className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Performance over time</h2>
          <div className="flex rounded-full border border-neutral-300 p-1 text-sm">
            <button
              type="button"
              onClick={() => onRange("week")}
              className={`rounded-full px-3 py-1 ${
                range === "week" ? "bg-neutral-950 text-white" : ""
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => onRange("month")}
              className={`rounded-full px-3 py-1 ${
                range === "month" ? "bg-neutral-950 text-white" : ""
              }`}
            >
              Month
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Qualified clicks · mocked series
        </p>
        <div className="mt-4">
          <ReachChart points={series} />
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">Post performance</h2>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-neutral-500">Posts</dt>
              <dd className="mt-1 text-xl font-semibold">{snapshot.posts}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Reactions</dt>
              <dd className="mt-1 text-xl font-semibold">
                {formatResultsStat(snapshot.reactions)}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Comments</dt>
              <dd className="mt-1 text-xl font-semibold">
                {formatResultsStat(snapshot.comments)}
              </dd>
            </div>
          </dl>
          <Link
            href="/brand/collaborations"
            className="mt-4 inline-block text-sm underline"
          >
            View posts
          </Link>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">Measure site conversions</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Pixel Naano would track visits, sign ups, and revenue per post. Demo
            only: no tracking script is installed.
          </p>
          <button
            type="button"
            disabled
            className="mt-4 rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            Install the pixel (demo only)
          </button>
        </article>
      </div>

      <AttributionTable rows={snapshot.attribution} />
    </div>
  );
}

function LeadsPanel({ snapshot }: { snapshot: ResultsSnapshot }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Qualified clicks"
          value={formatResultsStat(snapshot.qualifiedClicks)}
        />
        <StatCard
          label="Booked creators driving leads"
          value={String(snapshot.attribution.length)}
        />
      </div>
      <article className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Lead sources</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Lead capture is mocked. Rows below mirror booked creators so the table
          stays tied to real collaborations.
        </p>
        <AttributionTable rows={snapshot.attribution} showQualified />
      </article>
    </div>
  );
}

function PostsPanel({ snapshot }: { snapshot: ResultsSnapshot }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Posts" value={String(snapshot.posts)} />
        <StatCard
          label="Reactions"
          value={formatResultsStat(snapshot.reactions)}
        />
        <StatCard
          label="Comments"
          value={formatResultsStat(snapshot.comments)}
        />
      </div>
      <article className="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
        {snapshot.posts === 0
          ? "No posts yet. Book a creator to populate this tab."
          : `${snapshot.posts} booked collaboration${snapshot.posts === 1 ? "" : "s"} counted as posts. Full post embeds land later.`}
      </article>
    </div>
  );
}

function AttributionTable({
  rows,
  showQualified = false,
}: {
  rows: AttributionRow[];
  showQualified?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h2 className="font-semibold">Attribution by creator</h2>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-sm text-neutral-500">
          No booked creators yet.{" "}
          <Link href="/brand/creators" className="underline">
            Book a creator
          </Link>{" "}
          to see attribution rows.
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Creator</th>
              <th className="px-4 py-3 font-medium">Clicks</th>
              {showQualified ? (
                <th className="px-4 py-3 font-medium">Qualified</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.creatorId} className="border-t border-neutral-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={row.creatorPhotoUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    {row.creatorName}
                  </div>
                </td>
                <td className="px-4 py-3">{row.clicks}</td>
                {showQualified ? (
                  <td className="px-4 py-3">{row.qualifiedClicks}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}

function emptySnapshot(): ResultsSnapshot {
  return {
    estimatedReach: 0,
    qualifiedClicks: 0,
    committedBudgetCents: 0,
    bookingCount: 0,
    posts: 0,
    reactions: 0,
    comments: 0,
    weekSeries: [0, 0, 0, 0, 0, 0, 0],
    monthSeries: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    attribution: [],
  };
}
