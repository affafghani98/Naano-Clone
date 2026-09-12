"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBooking } from "../../actions/booking";
import {
  applyDiscount,
  daysFromNow,
  DISCOUNT_TIERS,
  formatLabel,
  insufficientWalletMessage,
  listedPriceCents,
  toDateInputValue,
  type BookingFormat,
} from "@/lib/booking";
import { formatEuro } from "@/lib/money";
import type { MarketplaceCreator } from "@/lib/creators";

type CampaignOption = { id: string; title: string };
type DiscountId = (typeof DISCOUNT_TIERS)[number] | "other";

function eurosFromCents(cents: number) {
  return (cents / 100).toFixed(2);
}

function centsFromEuros(value: string) {
  const euros = Number(value);
  if (!Number.isFinite(euros)) {
    return null;
  }
  return Math.round(euros * 100);
}

export function MakeOfferModal({
  creator,
  format,
  campaigns,
  walletBalanceCents,
  onClose,
}: {
  creator: MarketplaceCreator;
  format: BookingFormat;
  campaigns: CampaignOption[];
  walletBalanceCents: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const listedCents = listedPriceCents(creator, format);
  const [discount, setDiscount] = useState<DiscountId | null>(null);
  const [offerEuros, setOfferEuros] = useState(eurosFromCents(listedCents));
  const [dueDate, setDueDate] = useState("");
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? "");
  const [approveBeforePublish, setApproveBeforePublish] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const offerCents = useMemo(() => centsFromEuros(offerEuros), [offerEuros]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function pickDiscount(percent: (typeof DISCOUNT_TIERS)[number]) {
    setDiscount(percent);
    setOfferEuros(eurosFromCents(applyDiscount(listedCents, percent)));
  }

  function submitOffer() {
    setError("");
    if (offerCents == null || offerCents <= 0) {
      setError("Enter an offer greater than €0.");
      return;
    }
    if (offerCents > listedCents) {
      setError("Your offer must be at or below the listed rate.");
      return;
    }
    if (!dueDate) {
      setError("Choose a post-by date.");
      return;
    }
    if (walletBalanceCents < offerCents) {
      setError(insufficientWalletMessage(walletBalanceCents, offerCents));
      return;
    }

    startTransition(async () => {
      const result = await createBooking({
        creatorId: creator.id,
        format,
        mode: "offer",
        offerCents,
        dueDate,
        campaignId: campaignId || null,
        approveBeforePublish,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/brand/collaborations?booked=offer");
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close offer"
        onClick={onClose}
      />
      <article className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Make an offer</h2>
            <p className="mt-1 text-sm text-neutral-600">
              {creator.name} · {formatLabel(format)} · {formatEuro(listedCents)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neutral-200 px-3 py-1 text-sm"
          >
            Close
          </button>
        </header>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium">Choose a discount</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {DISCOUNT_TIERS.map((percent) => (
              <button
                key={percent}
                type="button"
                onClick={() => pickDiscount(percent)}
                className={`rounded-xl border px-3 py-2 text-left text-sm ${
                  discount === percent
                    ? "border-neutral-950 bg-neutral-50"
                    : "border-neutral-200"
                }`}
              >
                {percent}% off
              </button>
            ))}
            <button
              type="button"
              onClick={() => setDiscount("other")}
              className={`rounded-xl border px-3 py-2 text-left text-sm ${
                discount === "other"
                  ? "border-neutral-950 bg-neutral-50"
                  : "border-neutral-200"
              }`}
            >
              Other — enter a price
            </button>
          </div>
        </fieldset>

        <label className="mt-4 block space-y-1 text-sm">
          <span className="font-medium">Your offer</span>
          <span className="flex items-center gap-2 rounded-xl border border-neutral-300 px-3 py-2">
            €
            <input
              type="number"
              min="0"
              step="0.01"
              value={offerEuros}
              onChange={(event) => {
                setDiscount("other");
                setOfferEuros(event.target.value);
              }}
              className="w-full outline-none"
            />
          </span>
        </label>

        <div className="mt-4">
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Post by</span>
            <input
              type="date"
              value={dueDate}
              min={toDateInputValue(new Date())}
              onChange={(event) => setDueDate(event.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
            />
          </label>
          <button
            type="button"
            onClick={() => setDueDate(toDateInputValue(daysFromNow(14)))}
            className="mt-2 text-sm underline"
          >
            14 days from now
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-neutral-200 p-4">
          <p className="text-sm font-medium">How should the creator work?</p>
          <p className="mt-2 rounded-xl bg-neutral-50 px-3 py-2 text-sm">
            Specific brief — use detailed instructions from one of your campaign
            briefs
          </p>
          <label className="mt-3 block space-y-1 text-sm">
            <span className="font-medium">Campaign</span>
            <select
              value={campaignId}
              onChange={(event) => setCampaignId(event.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
            >
              <option value="">No brief attached</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={approveBeforePublish}
            onChange={(event) => setApproveBeforePublish(event.target.checked)}
            className="mt-0.5"
          />
          <span>I want to approve the content before it&apos;s published</span>
        </label>

        <p className="mt-4 text-xs leading-5 text-neutral-500">
          The creator receives the offer immediately and can accept or decline it
          within 48 hours.
        </p>

        {error ? (
          <p className="mt-4 text-sm text-red-700">
            {error}{" "}
            <Link href="/brand/billing" className="underline">
              Top up wallet
            </Link>
          </p>
        ) : null}

        <button
          type="button"
          onClick={submitOffer}
          disabled={pending}
          className="mt-5 w-full rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending
            ? "Sending…"
            : `Add ${offerCents != null && offerCents > 0 ? formatEuro(offerCents) : "€0.00"} and continue`}
        </button>
      </article>
    </div>
  );
}
