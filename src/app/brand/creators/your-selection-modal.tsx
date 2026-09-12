"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBooking } from "../../actions/booking";
import {
  formatLabel,
  insufficientWalletMessage,
  listedPriceCents,
  type BookingFormat,
} from "@/lib/booking";
import { formatEuro } from "@/lib/money";
import type { MarketplaceCreator } from "@/lib/creators";

export function YourSelectionModal({
  creator,
  format,
  walletBalanceCents,
  onClose,
  onNegotiate,
}: {
  creator: MarketplaceCreator;
  format: BookingFormat;
  walletBalanceCents: number;
  onClose: () => void;
  onNegotiate: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const listedCents = listedPriceCents(creator, format);
  const cannotAfford = walletBalanceCents < listedCents;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function bookListed() {
    setError("");
    if (cannotAfford) {
      setError(insufficientWalletMessage(walletBalanceCents, listedCents));
      return;
    }
    startTransition(async () => {
      const result = await createBooking({
        creatorId: creator.id,
        format,
        mode: "book",
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/brand/collaborations?booked=book");
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close selection"
        onClick={onClose}
      />
      <article className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Your selection</h2>
            <p className="mt-1 text-sm text-neutral-600">{creator.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neutral-200 px-3 py-1 text-sm"
          >
            Close
          </button>
        </header>

        <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="text-sm font-medium">
            {formatLabel(format)} — {formatEuro(listedCents)} — Standard rate
          </p>
        </div>
        <p className="mt-3 text-sm text-neutral-600">
          Book this option at the listed price, or propose a lower price.
        </p>

        {error ? (
          <p className="mt-4 text-sm text-red-700">
            {error}{" "}
            <Link href="/brand/billing" className="underline">
              Top up wallet
            </Link>
          </p>
        ) : cannotAfford ? (
          <p className="mt-4 text-sm text-neutral-700">
            Wallet balance is {formatEuro(walletBalanceCents)}. Top up to book at
            this rate, or negotiate a lower offer you can cover.{" "}
            <Link href="/brand/billing" className="underline">
              Top up wallet
            </Link>
          </p>
        ) : null}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onNegotiate}
            disabled={pending}
            className="flex-1 rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            Negotiate
          </button>
          <button
            type="button"
            onClick={bookListed}
            disabled={pending}
            className="flex-1 rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Booking…" : `Book · ${formatEuro(listedCents)}`}
          </button>
        </div>
      </article>
    </div>
  );
}
