import { formatCompact } from "./creators";
import { formatEuro } from "./money";

export type AttributionRow = {
  creatorId: string;
  creatorName: string;
  creatorPhotoUrl: string;
  clicks: number;
  qualifiedClicks: number;
};

export type BookedCreatorInput = {
  id: string;
  agreedPriceCents: number;
  creator: {
    id: string;
    name: string;
    photoUrl: string;
    typicalReach: number;
  };
};

export type ResultsSnapshot = {
  estimatedReach: number;
  qualifiedClicks: number;
  committedBudgetCents: number;
  bookingCount: number;
  posts: number;
  reactions: number;
  comments: number;
  weekSeries: number[];
  monthSeries: number[];
  attribution: AttributionRow[];
};

function stableInt(seed: string, min: number, max: number) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return min + (hash % (max - min + 1));
}

function seriesFromBase(base: number, length: number, seed: string) {
  if (base <= 0) {
    return Array.from({ length }, () => 0);
  }
  return Array.from({ length }, (_, index) => {
    const wobble = stableInt(`${seed}:${index}`, 70, 130) / 100;
    return Math.max(
      0,
      Math.round((base / length) * (index + 1) * 0.35 * wobble),
    );
  });
}

export function buildResultsSnapshot(
  collaborations: BookedCreatorInput[],
): ResultsSnapshot {
  const byCreator = new Map<
    string,
    {
      creator: BookedCreatorInput["creator"];
      bookings: number;
    }
  >();

  for (const row of collaborations) {
    const existing = byCreator.get(row.creator.id);
    if (existing) {
      existing.bookings += 1;
    } else {
      byCreator.set(row.creator.id, {
        creator: row.creator,
        bookings: 1,
      });
    }
  }

  const attribution: AttributionRow[] = [...byCreator.values()].map((entry) => {
    const clicks =
      stableInt(`${entry.creator.id}:clicks`, 12, 180) * entry.bookings;
    const qualifiedClicks = Math.max(
      1,
      Math.round(
        clicks * (0.18 + stableInt(entry.creator.id, 0, 20) / 100),
      ),
    );
    return {
      creatorId: entry.creator.id,
      creatorName: entry.creator.name,
      creatorPhotoUrl: entry.creator.photoUrl,
      clicks,
      qualifiedClicks,
    };
  });
  attribution.sort((left, right) => right.clicks - left.clicks);

  const estimatedReach = collaborations.reduce(
    (sum, row) => sum + row.creator.typicalReach,
    0,
  );
  const qualifiedClicks = attribution.reduce(
    (sum, row) => sum + row.qualifiedClicks,
    0,
  );
  const committedBudgetCents = collaborations.reduce(
    (sum, row) => sum + row.agreedPriceCents,
    0,
  );
  const bookingCount = collaborations.length;
  const base =
    bookingCount === 0
      ? 0
      : Math.max(qualifiedClicks, bookingCount * 8, 4);

  return {
    estimatedReach,
    qualifiedClicks,
    committedBudgetCents,
    bookingCount,
    posts: bookingCount,
    reactions:
      bookingCount === 0
        ? 0
        : stableInt("reactions", 40, 220) * bookingCount,
    comments:
      bookingCount === 0
        ? 0
        : stableInt("comments", 8, 48) * bookingCount,
    weekSeries: seriesFromBase(base, 7, "week"),
    monthSeries: seriesFromBase(base, 12, "month"),
    attribution,
  };
}

export function formatResultsStat(value: number) {
  return formatCompact(value);
}

export function committedBudgetLabel(cents: number, bookings: number) {
  return `${formatEuro(cents)} · ${bookings} booking${bookings === 1 ? "" : "s"}`;
}
