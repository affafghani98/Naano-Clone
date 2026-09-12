"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { shortlistMany, toggleShortlist } from "../../actions/creators";
import type { BookingFormat } from "@/lib/booking";
import {
  matchesPrice,
  PRICE_FILTERS,
  type MarketplaceCreator,
  type PriceFilterId,
} from "@/lib/creators";
import { CreatorCard } from "./creator-card";
import { CreatorProfileModal } from "./creator-profile-modal";
import { MakeOfferModal } from "./make-offer-modal";
import { YourSelectionModal } from "./your-selection-modal";

type BookingStage = "selection" | "offer";
type CampaignOption = { id: string; title: string };

type View = "matching" | "marketplace";
type ListTab = "all" | "shortlist";
type SortId = "match" | "price-asc" | "price-desc" | "followers" | "views";

export function CreatorsMarketplace({
  workspaceName,
  creators: initialCreators,
  campaigns,
  walletBalanceCents,
}: {
  workspaceName: string;
  creators: MarketplaceCreator[];
  campaigns: CampaignOption[];
  walletBalanceCents: number;
}) {
  const [creators, setCreators] = useState(initialCreators);
  const [view, setView] = useState<View>("matching");
  const [listTab, setListTab] = useState<ListTab>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("match");
  const [industry, setIndustry] = useState("all");
  const [country, setCountry] = useState("all");
  const [price, setPrice] = useState<PriceFilterId>("any");
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [booking, setBooking] = useState<{
    creatorId: string;
    format: BookingFormat;
    stage: BookingStage;
  } | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setCreators(initialCreators);
  }, [initialCreators]);

  const industries = useMemo(
    () => [...new Set(creators.map((creator) => creator.industry))].sort(),
    [creators],
  );
  const countries = useMemo(
    () => [...new Set(creators.map((creator) => creator.country))].sort(),
    [creators],
  );

  const shortlistCount = creators.filter((creator) => creator.shortlisted).length;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = creators.filter((creator) => {
      if (listTab === "shortlist") {
        return creator.shortlisted;
      }
      if (industry !== "all" && creator.industry !== industry) {
        return false;
      }
      if (country !== "all" && creator.country !== country) {
        return false;
      }
      if (!matchesPrice(creator.postCostCents, price)) {
        return false;
      }
      if (!needle) {
        return true;
      }
      const haystack = [
        creator.name,
        creator.industry,
        creator.country,
        ...creator.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });

    const sorted = [...rows];
    sorted.sort((left, right) => {
      if (sort === "price-asc") {
        return left.postCostCents - right.postCostCents;
      }
      if (sort === "price-desc") {
        return right.postCostCents - left.postCostCents;
      }
      if (sort === "followers") {
        return right.followers - left.followers;
      }
      if (sort === "views") {
        return right.medianViews - left.medianViews;
      }
      return right.matchPercent - left.matchPercent;
    });
    return sorted;
  }, [country, creators, industry, listTab, price, query, sort]);

  const openCreator = creators.find((creator) => creator.id === openId) ?? null;
  const bookingCreator =
    creators.find((creator) => creator.id === booking?.creatorId) ?? null;

  function startBooking(creatorId: string, format: BookingFormat) {
    setBooking({ creatorId, format, stage: "selection" });
  }

  function flipShortlist(creatorId: string) {
    setCreators((current) =>
      current.map((creator) =>
        creator.id === creatorId
          ? { ...creator, shortlisted: !creator.shortlisted }
          : creator,
      ),
    );
    startTransition(() => {
      void toggleShortlist(creatorId);
    });
  }

  function toggleSelect(creatorId: string) {
    setSelected((current) =>
      current.includes(creatorId)
        ? current.filter((id) => id !== creatorId)
        : [...current, creatorId],
    );
  }

  function addSelectedToShortlist() {
    const ids = selected.filter((id) => {
      const creator = creators.find((item) => item.id === id);
      return creator && !creator.shortlisted;
    });
    if (ids.length === 0) {
      return;
    }
    setCreators((current) =>
      current.map((creator) =>
        ids.includes(creator.id) ? { ...creator, shortlisted: true } : creator,
      ),
    );
    setSelected([]);
    startTransition(() => {
      void shortlistMany(ids);
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">All creators</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {view === "matching"
              ? `AI Matching ranked for ${workspaceName}`
              : "Creator Marketplace"}
          </p>
        </div>
        <div className="flex rounded-full border border-neutral-300 bg-white p-1 text-sm">
          <button
            type="button"
            onClick={() => setView("matching")}
            className={`rounded-full px-3 py-1.5 ${
              view === "matching" ? "bg-neutral-950 text-white" : ""
            }`}
          >
            AI Matching
          </button>
          <button
            type="button"
            onClick={() => setView("marketplace")}
            className={`rounded-full px-3 py-1.5 ${
              view === "marketplace" ? "bg-neutral-950 text-white" : ""
            }`}
          >
            Creator Marketplace
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setListTab("all")}
          className={`rounded-full px-3 py-1.5 text-sm ${
            listTab === "all" ? "bg-neutral-950 text-white" : "border border-neutral-300"
          }`}
        >
          All creators ({creators.length})
        </button>
        <button
          type="button"
          onClick={() => setListTab("shortlist")}
          className={`rounded-full px-3 py-1.5 text-sm ${
            listTab === "shortlist"
              ? "bg-neutral-950 text-white"
              : "border border-neutral-300"
          }`}
        >
          Shortlist ({shortlistCount})
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, tag, or industry"
          className="min-w-56 flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm"
        />
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortId)}
          className="rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="match">Best match</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="followers">Followers</option>
          <option value="views">Median views</option>
        </select>
        <select
          value={industry}
          onChange={(event) => setIndustry(event.target.value)}
          className="rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Industry</option>
          {industries.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          className="rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Country</option>
          {countries.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={price}
          onChange={(event) => setPrice(event.target.value as PriceFilterId)}
          className="rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          {PRICE_FILTERS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {selected.length > 0 ? (
        <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm">
          <p>{selected.length} selected</p>
          <button
            type="button"
            onClick={addSelectedToShortlist}
            className="rounded-full bg-neutral-950 px-3 py-1.5 text-white"
          >
            Add to shortlist
          </button>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-12 text-center text-sm text-neutral-500">
          {listTab === "shortlist"
            ? "No shortlisted creators yet. Star a card or use the checkbox plus Add to shortlist."
            : "No creators match those filters."}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              selected={selected.includes(creator.id)}
              emphasizeMatch={view === "matching"}
              onOpen={() => setOpenId(creator.id)}
              onBook={() => startBooking(creator.id, "single_post")}
              onToggleSelect={() => toggleSelect(creator.id)}
              onToggleShortlist={() => flipShortlist(creator.id)}
            />
          ))}
        </div>
      )}

      {openCreator ? (
        <CreatorProfileModal
          creator={openCreator}
          onClose={() => setOpenId(null)}
          onToggleShortlist={flipShortlist}
          onCollaborate={(format) => startBooking(openCreator.id, format)}
        />
      ) : null}

      {booking && bookingCreator && booking.stage === "selection" ? (
        <YourSelectionModal
          creator={bookingCreator}
          format={booking.format}
          walletBalanceCents={walletBalanceCents}
          onClose={() => setBooking(null)}
          onNegotiate={() =>
            setBooking({ ...booking, stage: "offer" })
          }
        />
      ) : null}

      {booking && bookingCreator && booking.stage === "offer" ? (
        <MakeOfferModal
          creator={bookingCreator}
          format={booking.format}
          campaigns={campaigns}
          walletBalanceCents={walletBalanceCents}
          onClose={() => setBooking({ ...booking, stage: "selection" })}
        />
      ) : null}
    </section>
  );
}
