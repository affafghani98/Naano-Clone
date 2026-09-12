export type AudienceSlice = {
  label: string;
  percent: number;
};

export type CreatorPost = {
  snippet: string;
  photoUrl: string;
  views: number;
  likes: number;
  comments: number;
  reposts: number;
  originalUrl: string;
  reachPoints: number[];
};

export type MarketplaceCreator = {
  id: string;
  slug: string;
  name: string;
  photoUrl: string;
  country: string;
  countryCode: string;
  industry: string;
  tags: string[];
  followers: number;
  medianViews: number;
  cpmCents: number;
  postCostCents: number;
  bundleCostCents: number;
  matchPercent: number;
  typicalReach: number;
  postsAnalyzed: number;
  audienceMatchPercent: number;
  jobTitleBreakdown: AudienceSlice[];
  seniorityBreakdown: AudienceSlice[];
  overview: string;
  shortlisted: boolean;
  post: CreatorPost | null;
};

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function toMarketplaceCreator(
  creator: {
    id: string;
    slug: string;
    name: string;
    photoUrl: string;
    country: string;
    countryCode: string;
    industry: string;
    tags: string;
    followers: number;
    medianViews: number;
    cpmCents: number;
    postCostCents: number;
    bundleCostCents: number;
    matchPercent: number;
    typicalReach: number;
    postsAnalyzed: number;
    audienceMatchPercent: number;
    jobTitleBreakdown: string;
    seniorityBreakdown: string;
    overview: string;
    contentPosts: {
      snippet: string;
      photoUrl: string;
      views: number;
      likes: number;
      comments: number;
      reposts: number;
      originalUrl: string;
      reachPoints: string;
    }[];
    shortlist: { creatorId: string }[];
  },
): MarketplaceCreator {
  const post = creator.contentPosts[0];
  return {
    id: creator.id,
    slug: creator.slug,
    name: creator.name,
    photoUrl: creator.photoUrl,
    country: creator.country,
    countryCode: creator.countryCode,
    industry: creator.industry,
    tags: parseJson<string[]>(creator.tags, []),
    followers: creator.followers,
    medianViews: creator.medianViews,
    cpmCents: creator.cpmCents,
    postCostCents: creator.postCostCents,
    bundleCostCents: creator.bundleCostCents,
    matchPercent: creator.matchPercent,
    typicalReach: creator.typicalReach,
    postsAnalyzed: creator.postsAnalyzed,
    audienceMatchPercent: creator.audienceMatchPercent,
    jobTitleBreakdown: parseJson<AudienceSlice[]>(creator.jobTitleBreakdown, []),
    seniorityBreakdown: parseJson<AudienceSlice[]>(creator.seniorityBreakdown, []),
    overview: creator.overview,
    shortlisted: creator.shortlist.length > 0,
    post: post
      ? {
          snippet: post.snippet,
          photoUrl: post.photoUrl,
          views: post.views,
          likes: post.likes,
          comments: post.comments,
          reposts: post.reposts,
          originalUrl: post.originalUrl,
          reachPoints: parseJson<number[]>(post.reachPoints, []),
        }
      : null,
  };
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function tagLine(creator: MarketplaceCreator) {
  return `${creator.tags.join(" · ")} ${creator.countryCode}`;
}

export const PRICE_FILTERS = [
  { id: "any", label: "Any price" },
  { id: "under-100", label: "Under €100", max: 10000 },
  { id: "100-150", label: "€100–€150", min: 10000, max: 15000 },
  { id: "150-200", label: "€150–€200", min: 15000, max: 20000 },
  { id: "200-plus", label: "€200+", min: 20000 },
] as const;

export type PriceFilterId = (typeof PRICE_FILTERS)[number]["id"];

export function matchesPrice(cents: number, filter: PriceFilterId) {
  const rule = PRICE_FILTERS.find((item) => item.id === filter);
  if (!rule || rule.id === "any") {
    return true;
  }
  const min = "min" in rule ? rule.min : 0;
  const max = "max" in rule ? rule.max : Number.POSITIVE_INFINITY;
  return cents >= (min ?? 0) && cents < (max ?? Number.POSITIVE_INFINITY);
}
