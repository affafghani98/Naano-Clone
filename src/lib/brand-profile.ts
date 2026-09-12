export type BrandProfile = {
  companyName: string;
  valueProposition: string;
  icps: { title: string; description: string }[];
  productSummary: string;
  audienceSummary: string;
  briefTitle: string;
  briefDescription: string;
};

function titleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function profileFromWebsite(rawUrl: string): BrandProfile {
  let hostname = rawUrl.trim();
  try {
    const parsed = new URL(rawUrl.includes("://") ? rawUrl : `https://${rawUrl}`);
    hostname = parsed.hostname;
  } catch {
    hostname = rawUrl.replace(/^https?:\/\//, "").split("/")[0] ?? rawUrl;
  }

  const host = hostname.replace(/^www\./, "").toLowerCase();
  const slug = host.split(".")[0] || "your-company";
  const companyName = titleCase(slug);

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
    };
  }

  return {
    companyName,
    valueProposition: `${companyName} helps B2B teams explain what they do in the rooms their buyers already trust — LinkedIn, in a practitioner's voice.`,
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
    productSummary: `${companyName} is a B2B product for operators who are tired of generic outbound and want a sharper story.`,
    audienceSummary:
      "Marketing leaders, founder-led GTM teams, and RevOps at B2B SaaS companies.",
    briefTitle: `${companyName} creator brief`,
    briefDescription: `Find creators who can explain ${companyName} in their own voice to the buyers already following them.`,
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
