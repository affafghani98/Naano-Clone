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
};

/** Mock import from a pasted public LinkedIn URL — no live scrape. */
export function profileFromLinkedInUrl(rawUrl: string, fallbackName: string): MockLinkedInProfile {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error("Paste your public LinkedIn profile URL.");
  }

  let host = "";
  let path = trimmed;
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    host = url.hostname.toLowerCase();
    path = url.pathname;
  } catch {
    path = trimmed;
  }

  if (host && !host.includes("linkedin")) {
    // Still accept non-LinkedIn strings for the demo mock.
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

  return {
    name,
    headline: `B2B creator · ${name.split(" ")[0]} shares operator insights on LinkedIn`,
    country: country.label,
    countryCode: country.code,
    followers,
    photoUrl: `https://i.pravatar.cc/160?u=${encodeURIComponent(name.toLowerCase())}`,
    linkedInUrl: trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
  };
}

/** Rough starting price from follower count (demo heuristic). */
export function suggestedPostPriceCents(followers: number) {
  if (followers <= 0) {
    return 15000;
  }
  const base = 12000 + Math.round((followers / 100) * 12);
  return Math.min(85000, Math.max(15000, Math.round(base / 1000) * 1000));
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
