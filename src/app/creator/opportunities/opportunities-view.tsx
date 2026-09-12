"use client";

import { useActionState, useMemo, useState } from "react";
import {
  applyToCampaign,
  type ApplyState,
} from "../../actions/creator-opportunities";
import { CopyButton } from "../_components/copy-button";

export type OpportunityCard = {
  id: string;
  title: string;
  description: string;
  productSummary: string | null;
  audienceSummary: string | null;
  brandName: string;
  brandWebsite: string | null;
  industry: string | null;
  regions: string[];
  matchPercent: number;
  applied: boolean;
  deadlineLabel: string;
};

export function OpportunitiesView({ campaigns }: { campaigns: OpportunityCard[] }) {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState<"all" | "linkedin">("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    campaigns[0]?.id ?? null,
  );
  const [state, formAction, pending] = useActionState(
    applyToCampaign,
    {} as ApplyState,
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      if (!needle) {
        return true;
      }
      const haystack = [
        campaign.title,
        campaign.brandName,
        campaign.industry ?? "",
        campaign.description,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [campaigns, query]);

  const selected =
    visible.find((campaign) => campaign.id === selectedId) ?? visible[0] ?? null;

  const markdown = selected
    ? `# ${selected.title}\n\nBrand: ${selected.brandName}\n\n${selected.description}\n\n## Objectives\n${selected.productSummary ?? "—"}\n\n## Audience\n${selected.audienceSummary ?? "—"}`
    : "";

  const aiPrompt = selected
    ? `Write a LinkedIn post for this brand campaign.\n\nBrand: ${selected.brandName}\nCampaign: ${selected.title}\nBrief: ${selected.description}\nProduct: ${selected.productSummary ?? "n/a"}\nAudience: ${selected.audienceSummary ?? "n/a"}\n\nTone: operator-led, specific, no fluff.`
    : "";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Opportunities</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Open brand campaigns — apply, the brand accepts, and the booking is created
          on your terms.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setChannel("all")}
          className={`rounded-full px-3 py-1.5 text-sm ${
            channel === "all"
              ? "bg-neutral-950 text-white"
              : "border border-neutral-200 bg-white"
          }`}
        >
          All channels
        </button>
        <button
          type="button"
          onClick={() => setChannel("linkedin")}
          className={`rounded-full px-3 py-1.5 text-sm ${
            channel === "linkedin"
              ? "bg-neutral-950 text-white"
              : "border border-neutral-200 bg-white"
          }`}
        >
          LinkedIn
        </button>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          className="min-w-48 flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <ul className="space-y-3">
          {visible.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
              No open campaigns match your filters.
            </li>
          ) : (
            visible.map((campaign) => (
              <li key={campaign.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(campaign.id)}
                  className={`w-full rounded-2xl border bg-white p-4 text-left ${
                    selected?.id === campaign.id
                      ? "border-neutral-950"
                      : "border-neutral-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-500">
                        {campaign.brandName}
                      </p>
                      <p className="mt-1 font-medium">{campaign.title}</p>
                      <p className="mt-1 text-xs text-neutral-500">Main campaign</p>
                    </div>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium">
                      {campaign.matchPercent}% match
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(campaign.regions.length
                      ? campaign.regions
                      : ["EU", "US"]
                    ).map((region) => (
                      <span
                        key={region}
                        className="rounded-full border border-neutral-200 px-2 py-0.5 text-xs"
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Audience relevance</span>
                      <span>
                        {campaign.matchPercent}/100
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-neutral-950"
                        style={{ width: `${campaign.matchPercent}%` }}
                      />
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-xs text-neutral-600">
                    <div>
                      <dt>Match</dt>
                      <dd className="font-medium text-neutral-950">
                        {campaign.matchPercent}%
                      </dd>
                    </div>
                    <div>
                      <dt>Channel</dt>
                      <dd className="font-medium text-neutral-950">LinkedIn</dd>
                    </div>
                    <div>
                      <dt>Post deadline</dt>
                      <dd className="font-medium text-neutral-950">
                        {campaign.deadlineLabel}
                      </dd>
                    </div>
                  </dl>
                </button>
              </li>
            ))
          )}
        </ul>

        {selected ? (
          <aside className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{selected.brandName}</h2>
                <p className="text-sm text-neutral-500">
                  {selected.brandWebsite ?? "No website on file"}
                </p>
              </div>
              <CopyButton label="Copy as Markdown" value={markdown} />
            </div>

            <div className="mt-6 rounded-xl bg-neutral-50 p-4">
              <p className="text-sm font-medium">Create my post with AI</p>
              <p className="mt-1 text-xs text-neutral-500">
                Copies a prompt with this brief for your own AI tool.
              </p>
              <CopyButton
                label="Copy for my AI"
                value={aiPrompt}
                className="mt-3 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs"
              />
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div>
                <h3 className="font-medium">Campaign objectives</h3>
                <p className="mt-1 text-neutral-600">
                  {selected.productSummary ?? selected.description}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Target audience</h3>
                <p className="mt-1 text-neutral-600">
                  {selected.audienceSummary ?? "Audience details coming soon."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {selected.applied ? (
                <span className="rounded-full bg-neutral-100 px-4 py-2 text-sm">
                  Applied
                </span>
              ) : (
                <form action={formAction}>
                  <input type="hidden" name="campaignId" value={selected.id} />
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {pending ? "Applying…" : "Apply"}
                  </button>
                </form>
              )}
            </div>
            {state.error ? (
              <p className="mt-3 text-sm text-red-700">{state.error}</p>
            ) : null}
            {state.ok ? (
              <p className="mt-3 text-sm text-neutral-600">
                Application sent — it appears under Collaborations.
              </p>
            ) : null}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
