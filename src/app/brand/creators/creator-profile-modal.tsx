"use client";

import { useEffect, useState } from "react";
import type { BookingFormat } from "@/lib/booking";
import {
  formatCompact,
  tagLine,
  type MarketplaceCreator,
} from "@/lib/creators";
import { formatEuro } from "@/lib/money";
import { AudienceBars } from "./audience-bars";
import { ReachChart } from "./reach-chart";

type Tab = "overview" | "audience" | "content";

export function CreatorProfileModal({
  creator,
  onClose,
  onToggleShortlist,
  onCollaborate,
}: {
  creator: MarketplaceCreator;
  onClose: () => void;
  onToggleShortlist: (creatorId: string) => void;
  onCollaborate: (format: BookingFormat) => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [format, setFormat] = useState<"single" | "bundle">("single");
  const [pricingOpen, setPricingOpen] = useState(false);
  const price =
    format === "single" ? creator.postCostCents : creator.bundleCostCents;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close profile"
        onClick={onClose}
      />
      <article className="relative z-10 grid w-full max-w-5xl gap-0 overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="p-6">
          <header className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <img
                src={creator.photoUrl}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold">{creator.name}</h2>
                <p className="text-sm text-neutral-600">{tagLine(creator)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onToggleShortlist(creator.id)}
                className="rounded-full border border-neutral-200 px-3 py-1 text-sm"
                aria-pressed={creator.shortlisted}
              >
                {creator.shortlisted ? "★ Shortlisted" : "☆ Shortlist"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-neutral-200 px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>
          </header>

          <div className="mt-5 flex gap-2">
            {(
              [
                ["overview", "Overview"],
                ["audience", "Audience"],
                ["content", "Content"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  tab === id ? "bg-neutral-950 text-white" : "border border-neutral-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-6">
            {tab === "overview" ? (
              <>
                <section>
                  <h3 className="text-sm font-medium text-neutral-500">
                    Creator overview
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-800">
                    {creator.overview}
                  </p>
                </section>
                <div className="grid grid-cols-2 gap-3">
                  <Stat
                    label="Match to observed audience"
                    value={`${creator.audienceMatchPercent}%`}
                  />
                  <Stat
                    label="Typical reach"
                    value={formatCompact(creator.typicalReach)}
                  />
                </div>
              </>
            ) : null}

            {tab === "audience" ? (
              <section className="grid gap-6 md:grid-cols-2">
                <AudienceBars title="Job title" slices={creator.jobTitleBreakdown} />
                <AudienceBars title="Seniority" slices={creator.seniorityBreakdown} />
              </section>
            ) : null}

            {tab === "content" ? (
              <section className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">
                    Content performance
                  </h3>
                  <ReachChart points={creator.post?.reachPoints ?? []} />
                </div>
                {creator.post ? (
                  <article className="overflow-hidden rounded-2xl border border-neutral-200">
                    <img
                      src={creator.post.photoUrl}
                      alt=""
                      className="h-40 w-full object-cover"
                    />
                    <div className="space-y-3 p-4">
                      <p className="text-sm leading-6">{creator.post.snippet}</p>
                      <p className="text-xs text-neutral-500">
                        {formatCompact(creator.post.views)} views ·{" "}
                        {formatCompact(creator.post.likes)} likes ·{" "}
                        {creator.post.comments} comments · {creator.post.reposts}{" "}
                        reposts
                      </p>
                      <a
                        href={creator.post.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline"
                      >
                        Open original
                      </a>
                    </div>
                  </article>
                ) : (
                  <p className="text-sm text-neutral-500">No posts analyzed yet.</p>
                )}
              </section>
            ) : null}
          </div>
        </div>

        <aside className="border-t border-neutral-200 bg-neutral-50 p-6 md:border-l md:border-t-0">
          <h3 className="font-semibold">Book this creator</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormat("single")}
              className={`rounded-xl border px-3 py-2 text-left text-sm ${
                format === "single"
                  ? "border-neutral-950 bg-white"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <span className="block text-xs text-neutral-500">Single post</span>
              {formatEuro(creator.postCostCents)}
            </button>
            <button
              type="button"
              onClick={() => setFormat("bundle")}
              className={`rounded-xl border px-3 py-2 text-left text-sm ${
                format === "bundle"
                  ? "border-neutral-950 bg-white"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <span className="block text-xs text-neutral-500">Bundle · 5</span>
              {formatEuro(creator.bundleCostCents)}
            </button>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Typical reach</dt>
              <dd>{formatCompact(creator.typicalReach)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Estimated CPM</dt>
              <dd>{formatEuro(creator.cpmCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Posts analyzed</dt>
              <dd>{creator.postsAnalyzed}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => setPricingOpen((open) => !open)}
            className="mt-3 text-sm underline"
          >
            How pricing is calculated
          </button>
          {pricingOpen ? (
            <p className="mt-2 text-xs leading-5 text-neutral-600">
              The listed rate is the creator&apos;s fee for that format. Estimated
              CPM is the post cost divided by typical reach, times 1,000. It is
              not a media-auction price.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() =>
              onCollaborate(format === "bundle" ? "bundle_5" : "single_post")
            }
            className="mt-5 w-full rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white"
          >
            Collaborate with {creator.name.split(" ")[0]} · {formatEuro(price)}
          </button>
          <p className="mt-3 text-center text-xs text-neutral-500">
            Secure booking · Creator approves first.
          </p>
        </aside>
      </article>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
