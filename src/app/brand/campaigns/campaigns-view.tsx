"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteCampaign } from "../../actions/campaigns";
import {
  CAMPAIGN_STATUS_LABELS,
  type CampaignListItem,
} from "@/lib/campaigns";
import { formatEuro } from "@/lib/money";

const TABS: {
  id: "all" | "active" | "draft" | "completed";
  label: string;
  status: string | null;
}[] = [
  { id: "all", label: "All", status: null },
  { id: "active", label: "Active", status: "active" },
  { id: "draft", label: "Draft", status: "draft" },
  { id: "completed", label: "Completed", status: "completed" },
];

export function CampaignsView({
  campaigns,
  showFirstBriefBanner,
}: {
  campaigns: CampaignListItem[];
  showFirstBriefBanner: boolean;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [bannerOpen, setBannerOpen] = useState(showFirstBriefBanner);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const filter = TABS.find((item) => item.id === tab);
  const visible = campaigns.filter((campaign) => {
    if (!filter?.status) {
      return true;
    }
    return campaign.status === filter.status;
  });
  const firstDraft = campaigns.find((campaign) => campaign.status === "draft");

  function onDelete(campaignId: string) {
    setError("");
    setPendingId(campaignId);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("campaignId", campaignId);
      const result = await deleteCampaign({}, formData);
      setPendingId(null);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Campaigns</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Briefs that creators work from when you book.
          </p>
        </div>
        <Link
          href="/brand/campaigns/new"
          className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white"
        >
          Create a campaign
        </Link>
      </div>

      {bannerOpen && firstDraft ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm">
          <p>
            Your first brief is ready.{" "}
            <Link
              href={`/brand/campaigns/${firstDraft.id}`}
              className="font-medium underline"
            >
              See my campaign.
            </Link>
          </p>
          <button
            type="button"
            onClick={() => setBannerOpen(false)}
            className="text-neutral-500 underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => {
          const count =
            item.status == null
              ? campaigns.length
              : campaigns.filter((campaign) => campaign.status === item.status)
                  .length;
          return (
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
              {item.label} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-12 text-center text-sm text-neutral-500">
          {campaigns.length === 0 ? (
            <>
              No campaigns yet.{" "}
              <Link href="/brand/campaigns/new" className="underline">
                Create a campaign
              </Link>
              .
            </>
          ) : (
            "No campaigns in this tab."
          )}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((campaign) => (
            <article
              key={campaign.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium">
                    {CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status}
                  </span>
                  <p className="mt-2 text-xs text-neutral-500">
                    Created{" "}
                    {new Date(campaign.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(campaign.id)}
                  disabled={pendingId === campaign.id}
                  className="rounded-full border border-neutral-200 px-2 py-1 text-xs text-neutral-500 disabled:opacity-60"
                  aria-label={`Delete ${campaign.title}`}
                >
                  {pendingId === campaign.id ? "…" : "Delete"}
                </button>
              </div>
              <h2 className="mt-3 text-lg font-semibold">{campaign.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
                {campaign.description}
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-xs text-neutral-500">
                <div>
                  <dt>Creators</dt>
                  <dd className="text-sm font-medium text-neutral-950">
                    {campaign.creators}
                  </dd>
                </div>
                <div>
                  <dt>Published</dt>
                  <dd className="text-sm font-medium text-neutral-950">
                    {campaign.published}
                  </dd>
                </div>
                <div>
                  <dt>Committed</dt>
                  <dd className="text-sm font-medium text-neutral-950">
                    {formatEuro(campaign.committedBudgetCents)}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <Link
                  href={`/brand/campaigns/${campaign.id}`}
                  className="rounded-full bg-neutral-950 px-3 py-1.5 text-white"
                >
                  Open campaign
                </Link>
                <Link
                  href={`/brand/campaigns/${campaign.id}`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5"
                >
                  My brief
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
