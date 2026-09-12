"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { shortlistMany } from "../actions/creators";
import { formatEuro } from "@/lib/money";
import { tagLine, type MarketplaceCreator } from "@/lib/creators";

export function NewCreatorsRow({
  creators: initial,
}: {
  creators: MarketplaceCreator[];
}) {
  const [creators, setCreators] = useState(initial);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setCreators(initial);
  }, [initial]);

  function add(creatorId: string) {
    setCreators((current) =>
      current.map((creator) =>
        creator.id === creatorId ? { ...creator, shortlisted: true } : creator,
      ),
    );
    startTransition(() => {
      void shortlistMany([creatorId]);
    });
  }

  if (creators.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500">
        No creator recommendations yet.
      </p>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {creators.map((creator) => (
        <article
          key={creator.id}
          className="w-56 shrink-0 rounded-2xl border border-neutral-200 bg-white p-4"
        >
          <img
            src={creator.photoUrl}
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
          <h3 className="mt-3 truncate font-medium">{creator.name}</h3>
          <p className="mt-1 truncate text-xs text-neutral-500">
            {tagLine(creator)}
          </p>
          <p className="mt-3 text-sm font-medium">{creator.matchPercent}% match</p>
          <p className="text-sm text-neutral-600">
            {formatEuro(creator.postCostCents)} / post
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href="/brand/creators"
              className="flex-1 rounded-full border border-neutral-300 px-3 py-1.5 text-center text-xs"
            >
              View
            </Link>
            <button
              type="button"
              onClick={() => add(creator.id)}
              disabled={creator.shortlisted}
              className="flex-1 rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {creator.shortlisted ? "Added" : "Add"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
