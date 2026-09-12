import { callGroqChat, parseJsonObject } from "./groq";

export const CREATOR_INDUSTRIES = [
  "B2B",
  "B2C",
  "AI",
  "SaaS",
  "Software",
  "Sales",
  "Marketing",
  "SEO",
  "Outreach",
  "CRM",
  "Creative",
  "Fintech",
  "HealthTech",
  "EdTech",
  "Cybersecurity",
  "Growth/GTM",
  "HR",
  "E-commerce",
  "Developer Tools",
  "Data/Analytics",
  "Customer Support",
  "Design",
  "Real Estate/PropTech",
  "LegalTech",
] as const;

export const CREATOR_COUNTRIES = [
  { label: "France", code: "FR" },
  { label: "United Kingdom", code: "GB" },
  { label: "United States", code: "US" },
  { label: "Germany", code: "DE" },
  { label: "Netherlands", code: "NL" },
  { label: "Spain", code: "ES" },
  { label: "Belgium", code: "BE" },
  { label: "Ireland", code: "IE" },
  { label: "Canada", code: "CA" },
  { label: "Other / Outside EU", code: "XX" },
] as const;

export type MockLinkedInProfile = {
  name: string;
  headline: string;
  country: string;
  countryCode: string;
  followers: number;
  photoUrl: string;
  linkedInUrl: string;
  industries: string[];
  suggestedPriceCents: number;
  usedFallback?: boolean;
};

const INDUSTRY_SET = new Set<string>(CREATOR_INDUSTRIES);

/** Rough starting price from follower count (demo heuristic). */
export function suggestedPostPriceCents(followers: number) {
  if (followers <= 0) {
    return 15000;
  }
  const base = 12000 + Math.round((followers / 100) * 12);
  return Math.min(85000, Math.max(15000, Math.round(base / 1000) * 1000));
}

/** Template import when AI is unavailable — no live scrape. */
export function profileFromLinkedInUrl(
  rawUrl: string,
  fallbackName: string,
  bio = "",
): MockLinkedInProfile {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error("Paste your public LinkedIn profile URL.");
  }

  let path = trimmed;
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    path = url.pathname;
  } catch {
    path = trimmed;
  }

  const slugMatch = path.match(/\/in\/([^/?#]+)/i);
  const handle = (slugMatch?.[1] ?? fallbackName)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const name =
    handle
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ") || fallbackName;

  const seed = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const followers = 3500 + (seed % 28000);
  const country =
    CREATOR_COUNTRIES[seed % (CREATOR_COUNTRIES.length - 1)] ?? CREATOR_COUNTRIES[0];
  const bioLine = bio.trim();

  return {
    name,
    headline: bioLine
      ? bioLine.slice(0, 160)
      : `B2B creator · ${name.split(" ")[0]} shares operator insights on LinkedIn`,
    country: country.label,
    countryCode: country.code,
    followers,
    photoUrl: `https://i.pravatar.cc/160?u=${encodeURIComponent(name.toLowerCase())}`,
    linkedInUrl: trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
    industries: ["B2B", "SaaS", "Marketing"].slice(0, 3),
    suggestedPriceCents: suggestedPostPriceCents(followers),
    usedFallback: true,
  };
}

export async function generateCreatorProfile(input: {
  linkedInUrl: string;
  fallbackName: string;
  bio?: string;
}): Promise<MockLinkedInProfile> {
  const fallback = profileFromLinkedInUrl(
    input.linkedInUrl,
    input.fallbackName,
    input.bio ?? "",
  );

  const industryList = CREATOR_INDUSTRIES.join(", ");
  const countryList = CREATOR_COUNTRIES.map((item) => item.label).join(", ");

  const result = await callGroqChat({
    system: `You draft LinkedIn creator marketplace cards for Naano.
Return ONLY valid JSON with keys:
name, headline, country (must be one of: ${countryList}),
followers (integer 2000-80000), industries (1-3 tags from: ${industryList}),
suggestedPriceEuros (integer 50-850).
No markdown. Infer a plausible professional profile from the URL + bio.`,
    user: `LinkedIn URL: ${input.linkedInUrl}
Display name hint: ${input.fallbackName}
Headline/bio (may be empty): ${input.bio?.trim() || "(none — infer carefully from the URL handle)"}`,
    maxTokens: 700,
  });

  if (!result.ok) {
    console.info("[naano-onboarding] creator AI fallback:", result.error);
    return fallback;
  }

  const json = parseJsonObject(result.text);
  if (!json) {
    console.info("[naano-onboarding] creator AI malformed JSON");
    return fallback;
  }

  const countryLabel =
    typeof json.country === "string"
      ? CREATOR_COUNTRIES.find(
          (item) =>
            item.label.toLowerCase() === String(json.country).toLowerCase(),
        )?.label
      : undefined;
  const country =
    CREATOR_COUNTRIES.find((item) => item.label === countryLabel) ??
    CREATOR_COUNTRIES.find((item) => item.label === fallback.country) ??
    CREATOR_COUNTRIES[0];

  const industries = Array.isArray(json.industries)
    ? json.industries
        .map(String)
        .filter((tag) => INDUSTRY_SET.has(tag))
        .slice(0, 3)
    : fallback.industries;

  const followersRaw = Number(json.followers);
  const followers =
    Number.isFinite(followersRaw) && followersRaw > 0
      ? Math.min(120000, Math.max(1500, Math.round(followersRaw)))
      : fallback.followers;

  const eurosRaw = Number(json.suggestedPriceEuros);
  const suggestedPriceCents =
    Number.isFinite(eurosRaw) && eurosRaw > 0
      ? Math.min(85000, Math.max(5000, Math.round(eurosRaw) * 100))
      : suggestedPostPriceCents(followers);

  const name =
    typeof json.name === "string" && json.name.trim()
      ? json.name.trim()
      : fallback.name;
  const headline =
    typeof json.headline === "string" && json.headline.trim()
      ? json.headline.trim().slice(0, 180)
      : fallback.headline;

  return {
    name,
    headline,
    country: country.label,
    countryCode: country.code,
    followers,
    photoUrl: `https://i.pravatar.cc/160?u=${encodeURIComponent(name.toLowerCase())}`,
    linkedInUrl: fallback.linkedInUrl,
    industries: industries.length ? industries : fallback.industries,
    suggestedPriceCents,
    usedFallback: false,
  };
}

export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
