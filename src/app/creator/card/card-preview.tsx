"use client";

import { useState } from "react";

export function CardPreview({
  name,
  photoUrl,
  headline,
  country,
  tags,
  followers,
  impressions,
  postCostLabel,
}: {
  name: string;
  photoUrl: string;
  headline: string;
  country: string;
  tags: string[];
  followers: number;
  impressions: number;
  postCostLabel: string;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="w-full max-w-xl text-left"
      >
        {flipped ? (
          <div className="rounded-3xl border border-neutral-200 bg-neutral-950 p-6 text-white">
            <p className="text-xs uppercase tracking-wide text-neutral-400">Reverse</p>
            <p className="mt-4 text-xl font-semibold">{name}</p>
            <p className="mt-2 text-sm text-neutral-300">{headline}</p>
            <p className="mt-6 text-sm text-neutral-400">{country}</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <p className="text-xl font-semibold">{name}</p>
                <p className="text-sm text-neutral-600">{headline}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {country}
                  {tags.length ? ` · ${tags.join(", ")}` : ""}
                </p>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-xl bg-neutral-50 px-2 py-3">
                <dt className="text-xs text-neutral-500">Followers</dt>
                <dd className="mt-1 font-medium">{followers.toLocaleString()}</dd>
              </div>
              <div className="rounded-xl bg-neutral-50 px-2 py-3">
                <dt className="text-xs text-neutral-500">Est. impressions</dt>
                <dd className="mt-1 font-medium">{impressions.toLocaleString()}</dd>
              </div>
              <div className="rounded-xl bg-neutral-50 px-2 py-3">
                <dt className="text-xs text-neutral-500">Cost per post</dt>
                <dd className="mt-1 font-medium">{postCostLabel}</dd>
              </div>
            </dl>
          </div>
        )}
      </button>
      <p className="text-xs text-neutral-500">Tap the card to flip it over.</p>
    </div>
  );
}
