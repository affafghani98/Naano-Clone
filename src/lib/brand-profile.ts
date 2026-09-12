import { callGroqChat, parseJsonObject } from "./groq";

export type BrandProfile = {
  companyName: string;
  valueProposition: string;
  icps: { title: string; description: string }[];
  productSummary: string;
  audienceSummary: string;
  briefTitle: string;
  briefDescription: string;
  /** True when output came from the non-AI template fallback. */
  usedFallback?: boolean;
};

function titleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function companyNameFromUrl(rawUrl: string) {
  let hostname = rawUrl.trim();
  try {
    const parsed = new URL(rawUrl.includes("://") ? rawUrl : `https://${rawUrl}`);
    hostname = parsed.hostname;
  } catch {
    hostname = rawUrl.replace(/^https?:\/\//, "").split("/")[0] ?? rawUrl;
  }
  const host = hostname.replace(/^www\./, "").toLowerCase();
  const slug = host.split(".")[0] || "your-company";
  return titleCase(slug);
}

export function profileFromWebsite(
  rawUrl: string,
  companyDescription = "",
): BrandProfile {
  const companyName = companyNameFromUrl(rawUrl);
  const host = rawUrl.toLowerCase();

  if (host.includes("relayed")) {
    return {
      companyName: "Relayed",
      valueProposition:
        "Relayed helps B2B SaaS teams turn customer conversations into a searchable source of truth for product, CS, and sales.",
      icps: [
        {
          title: "VP Product at Series A–C SaaS",
          description:
            "Owns onboarding and activation. Tired of insights living in Gong clips and Slack threads.",
        },
        {
          title: "Head of Customer Success",
          description:
            "Needs expansion signals without another dashboard. Wants quotes and themes their team already heard.",
        },
        {
          title: "Founder-led GTM teams",
          description:
            "Still close to customers. Will sponsor a creator who can explain the workflow in their own voice.",
        },
      ],
      productSummary:
        "Relayed records and clusters customer conversations so product and CS share one narrative, not twelve tools.",
      audienceSummary:
        "VP Product, Head of CS, and founder-led GTM teams at B2B SaaS companies in the US, UK, and EU.",
      briefTitle: "Relayed creator brief",
      briefDescription:
        "Find operators who can explain how Relayed turns customer calls into a shared product and CS record.",
      usedFallback: true,
    };
  }

  const hint = companyDescription.trim();
  return {
    companyName,
    valueProposition: hint
      ? `${companyName} — ${hint.slice(0, 220)}`
      : `${companyName} helps B2B teams explain what they do in the rooms their buyers already trust — LinkedIn, in a practitioner's voice.`,
    icps: [
      {
        title: `VP Marketing evaluating ${companyName}`,
        description:
          "Owns pipeline from creator and community channels. Wants a clear category story, not another ad.",
      },
      {
        title: "Founder selling into their own ICP",
        description:
          "Still close to the product. Will book a creator who can describe the workflow without a slide deck.",
      },
      {
        title: "Head of Sales / RevOps",
        description:
          "Needs a trusted explanation their buyers already believe. Measures the post by conversations, not vanity reach.",
      },
    ],
    productSummary: hint
      ? hint.slice(0, 280)
      : `${companyName} is a B2B product for operators who want a sharper story than generic outbound.`,
    audienceSummary:
      "Marketing leaders, founder-led GTM teams, and RevOps at B2B SaaS companies.",
    briefTitle: `${companyName} creator brief`,
    briefDescription: `Find creators who can explain ${companyName} in their own voice to the buyers already following them.`,
    usedFallback: true,
  };
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function parseIcps(value: unknown, fallback: BrandProfile["icps"]) {
  if (!Array.isArray(value) || value.length < 3) {
    return fallback;
  }
  const icps = value.slice(0, 3).map((item, index) => {
    const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      title: asString(row.title, fallback[index]?.title ?? `ICP ${index + 1}`),
      description: asString(
        row.description,
        fallback[index]?.description ?? "Buyer who cares about this product.",
      ),
    };
  });
  return icps;
}

export async function generateBrandProfile(input: {
  websiteUrl: string;
  companyDescription?: string;
}): Promise<BrandProfile> {
  const fallback = profileFromWebsite(
    input.websiteUrl,
    input.companyDescription ?? "",
  );

  const result = await callGroqChat({
    system: `You write Naano-style B2B brand onboarding profiles for a LinkedIn creator marketplace.
Return ONLY valid JSON with keys:
companyName, valueProposition, icps (array of exactly 3 objects with title+description),
productSummary, audienceSummary, briefTitle, briefDescription.
Be specific to the company context. No markdown.`,
    user: `Website URL: ${input.websiteUrl}
Company description (may be empty): ${input.companyDescription?.trim() || "(none provided — infer carefully from the URL/domain)"}
Write a sharp value proposition, 3 ICPs, and a starter creator brief.`,
    maxTokens: 1100,
  });

  if (!result.ok) {
    console.info("[naano-onboarding] brand AI fallback:", result.error);
    return fallback;
  }

  const json = parseJsonObject(result.text);
  if (!json) {
    console.info("[naano-onboarding] brand AI malformed JSON");
    return fallback;
  }

  return {
    companyName: asString(json.companyName, fallback.companyName),
    valueProposition: asString(json.valueProposition, fallback.valueProposition),
    icps: parseIcps(json.icps, fallback.icps),
    productSummary: asString(json.productSummary, fallback.productSummary),
    audienceSummary: asString(json.audienceSummary, fallback.audienceSummary),
    briefTitle: asString(json.briefTitle, fallback.briefTitle),
    briefDescription: asString(json.briefDescription, fallback.briefDescription),
    usedFallback: false,
  };
}

export function normalizeWebsiteUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error("Enter a company website URL.");
  }
  const withProtocol = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Use an http or https URL.");
  }
  return parsed.toString();
}

export function parseBrandProfileJson(raw: string): BrandProfile | null {
  try {
    const parsed = JSON.parse(raw) as BrandProfile;
    if (
      !parsed?.companyName ||
      !parsed.valueProposition ||
      !Array.isArray(parsed.icps) ||
      parsed.icps.length < 1
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
