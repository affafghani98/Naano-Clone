import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEMO_CREATOR_EMAIL,
  DEMO_CREATOR_PASSWORD,
  DEMO_CREATOR_SLUG,
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from "../src/lib/demo-account";

const db = new PrismaClient();

type CreatorSeed = {
  slug: string;
  name: string;
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
  jobTitleBreakdown: { label: string; percent: number }[];
  seniorityBreakdown: { label: string; percent: number }[];
  overview: string;
  post: {
    snippet: string;
    views: number;
    likes: number;
    comments: number;
    reposts: number;
    reachPoints: number[];
  };
};

const CREATORS: CreatorSeed[] = [
  {
    slug: "maya-chen",
    name: "Maya Chen",
    country: "United Kingdom",
    countryCode: "GB",
    industry: "Marketing",
    tags: ["AI", "Marketing"],
    followers: 18400,
    medianViews: 6200,
    cpmCents: 1516,
    postCostCents: 9400,
    bundleCostCents: 42000,
    matchPercent: 92,
    typicalReach: 5800,
    postsAnalyzed: 24,
    audienceMatchPercent: 78,
    jobTitleBreakdown: [
      { label: "Marketing", percent: 48 },
      { label: "Founders", percent: 29 },
      { label: "Engineering", percent: 15 },
      { label: "Other", percent: 8 },
    ],
    seniorityBreakdown: [
      { label: "Founder", percent: 58 },
      { label: "Manager", percent: 32 },
      { label: "VP", percent: 9 },
      { label: "Other", percent: 1 },
    ],
    overview:
      "B2B marketer who writes about AI tooling for growth teams. Audience is UK and EU SaaS operators.",
    post: {
      snippet:
        "We stopped briefing creators like ad agencies. One sentence on the ICP beat a 12-slide deck.",
      views: 8100,
      likes: 214,
      comments: 37,
      reposts: 19,
      reachPoints: [2100, 3400, 4100, 5600, 7200, 8100],
    },
  },
  {
    slug: "lucas-moreau",
    name: "Lucas Moreau",
    country: "France",
    countryCode: "FR",
    industry: "Sales",
    tags: ["Sales", "SaaS"],
    followers: 22100,
    medianViews: 7400,
    cpmCents: 1622,
    postCostCents: 12000,
    bundleCostCents: 54000,
    matchPercent: 84,
    typicalReach: 6900,
    postsAnalyzed: 31,
    audienceMatchPercent: 71,
    jobTitleBreakdown: [
      { label: "Sales", percent: 52 },
      { label: "Founders", percent: 22 },
      { label: "RevOps", percent: 16 },
      { label: "Other", percent: 10 },
    ],
    seniorityBreakdown: [
      { label: "Manager", percent: 44 },
      { label: "Founder", percent: 31 },
      { label: "VP", percent: 18 },
      { label: "Other", percent: 7 },
    ],
    overview:
      "Enterprise AE who posts weekly about outbound systems and deal reviews. Strong French-speaking buyer overlap.",
    post: {
      snippet:
        "If your SDR team cannot name the trigger event, the sequence is a newsletter.",
      views: 9300,
      likes: 188,
      comments: 41,
      reposts: 12,
      reachPoints: [1800, 2900, 4700, 6100, 8000, 9300],
    },
  },
  {
    slug: "priya-raman",
    name: "Priya Raman",
    country: "United States",
    countryCode: "US",
    industry: "DevTools",
    tags: ["DevTools", "Engineering"],
    followers: 31200,
    medianViews: 9800,
    cpmCents: 1837,
    postCostCents: 18000,
    bundleCostCents: 81000,
    matchPercent: 76,
    typicalReach: 9100,
    postsAnalyzed: 18,
    audienceMatchPercent: 64,
    jobTitleBreakdown: [
      { label: "Engineering", percent: 57 },
      { label: "Product", percent: 21 },
      { label: "Founders", percent: 14 },
      { label: "Other", percent: 8 },
    ],
    seniorityBreakdown: [
      { label: "Manager", percent: 39 },
      { label: "IC", percent: 34 },
      { label: "VP", percent: 19 },
      { label: "Other", percent: 8 },
    ],
    overview:
      "Platform engineer who reviews developer tools in public. Audience skews US IC and engineering managers.",
    post: {
      snippet:
        "A 'simple' SDK that needs a solutions engineer is not simple. Here is the checklist I use now.",
      views: 12400,
      likes: 301,
      comments: 54,
      reposts: 28,
      reachPoints: [3200, 5100, 7400, 8900, 11000, 12400],
    },
  },
  {
    slug: "nina-vogel",
    name: "Nina Vogel",
    country: "Germany",
    countryCode: "DE",
    industry: "HR",
    tags: ["HR", "People"],
    followers: 14600,
    medianViews: 4100,
    cpmCents: 2195,
    postCostCents: 9000,
    bundleCostCents: 40000,
    matchPercent: 69,
    typicalReach: 3900,
    postsAnalyzed: 22,
    audienceMatchPercent: 58,
    jobTitleBreakdown: [
      { label: "People", percent: 46 },
      { label: "Founders", percent: 27 },
      { label: "Ops", percent: 17 },
      { label: "Other", percent: 10 },
    ],
    seniorityBreakdown: [
      { label: "Manager", percent: 49 },
      { label: "Founder", percent: 28 },
      { label: "VP", percent: 16 },
      { label: "Other", percent: 7 },
    ],
    overview:
      "People-ops lead writing about hiring systems for German SaaS. Useful when the ICP is HR or founding teams.",
    post: {
      snippet:
        "We replaced 'culture fit' with three scored work samples. Offer-accept rate went up, not down.",
      views: 5600,
      likes: 142,
      comments: 29,
      reposts: 11,
      reachPoints: [900, 1700, 2600, 3400, 4700, 5600],
    },
  },
  {
    slug: "jonas-de-vries",
    name: "Jonas de Vries",
    country: "Netherlands",
    countryCode: "NL",
    industry: "Fintech",
    tags: ["Fintech", "Finance"],
    followers: 19800,
    medianViews: 6700,
    cpmCents: 1940,
    postCostCents: 13000,
    bundleCostCents: 58500,
    matchPercent: 73,
    typicalReach: 6400,
    postsAnalyzed: 16,
    audienceMatchPercent: 61,
    jobTitleBreakdown: [
      { label: "Finance", percent: 41 },
      { label: "Founders", percent: 24 },
      { label: "Product", percent: 22 },
      { label: "Other", percent: 13 },
    ],
    seniorityBreakdown: [
      { label: "Manager", percent: 37 },
      { label: "Founder", percent: 33 },
      { label: "VP", percent: 21 },
      { label: "Other", percent: 9 },
    ],
    overview:
      "Fintech operator covering payments and B2B billing. Audience is Benelux finance and founder-led SaaS.",
    post: {
      snippet:
        "Usage-based billing failed for us until finance could reconcile it in one export. That is the product.",
      views: 7200,
      likes: 167,
      comments: 33,
      reposts: 14,
      reachPoints: [1400, 2500, 3900, 5100, 6400, 7200],
    },
  },
  {
    slug: "amelia-brooks",
    name: "Amelia Brooks",
    country: "United Kingdom",
    countryCode: "GB",
    industry: "RevOps",
    tags: ["RevOps", "SaaS"],
    followers: 16300,
    medianViews: 5400,
    cpmCents: 1667,
    postCostCents: 9000,
    bundleCostCents: 40500,
    matchPercent: 88,
    typicalReach: 5100,
    postsAnalyzed: 27,
    audienceMatchPercent: 74,
    jobTitleBreakdown: [
      { label: "RevOps", percent: 38 },
      { label: "Sales", percent: 27 },
      { label: "Founders", percent: 23 },
      { label: "Other", percent: 12 },
    ],
    seniorityBreakdown: [
      { label: "Manager", percent: 46 },
      { label: "Founder", percent: 29 },
      { label: "VP", percent: 17 },
      { label: "Other", percent: 8 },
    ],
    overview:
      "RevOps consultant who posts CRM teardown threads. High overlap with B2B operators in the UK.",
    post: {
      snippet:
        "Your CRM is not messy. Your lifecycle stages are fictional. Fix the stages, the reports follow.",
      views: 6900,
      likes: 201,
      comments: 44,
      reposts: 22,
      reachPoints: [1200, 2300, 3600, 4800, 6000, 6900],
    },
  },
  {
    slug: "ethan-park",
    name: "Ethan Park",
    country: "United States",
    countryCode: "US",
    industry: "Product",
    tags: ["Product", "B2B"],
    followers: 27500,
    medianViews: 8600,
    cpmCents: 1744,
    postCostCents: 15000,
    bundleCostCents: 67500,
    matchPercent: 71,
    typicalReach: 8200,
    postsAnalyzed: 20,
    audienceMatchPercent: 59,
    jobTitleBreakdown: [
      { label: "Product", percent: 49 },
      { label: "Engineering", percent: 23 },
      { label: "Founders", percent: 18 },
      { label: "Other", percent: 10 },
    ],
    seniorityBreakdown: [
      { label: "Manager", percent: 41 },
      { label: "IC", percent: 28 },
      { label: "VP", percent: 22 },
      { label: "Other", percent: 9 },
    ],
    overview:
      "Product lead posting teardown notes on B2B onboarding. US-heavy PM audience.",
    post: {
      snippet:
        "Activation is not a tooltip tour. It is the first moment the buyer sees their own data.",
      views: 10100,
      likes: 256,
      comments: 39,
      reposts: 17,
      reachPoints: [2400, 4300, 6100, 7800, 9200, 10100],
    },
  },
  {
    slug: "camille-bernard",
    name: "Camille Bernard",
    country: "France",
    countryCode: "FR",
    industry: "Cyber",
    tags: ["Cyber", "Security"],
    followers: 13200,
    medianViews: 3900,
    cpmCents: 2564,
    postCostCents: 10000,
    bundleCostCents: 45000,
    matchPercent: 63,
    typicalReach: 3600,
    postsAnalyzed: 14,
    audienceMatchPercent: 52,
    jobTitleBreakdown: [
      { label: "Security", percent: 44 },
      { label: "IT", percent: 26 },
      { label: "Founders", percent: 19 },
      { label: "Other", percent: 11 },
    ],
    seniorityBreakdown: [
      { label: "Manager", percent: 42 },
      { label: "VP", percent: 27 },
      { label: "Founder", percent: 21 },
      { label: "Other", percent: 10 },
    ],
    overview:
      "Security PM who writes about vendor diligence without the fear-mongering. FR/EU security buyers.",
    post: {
      snippet:
        "If your security questionnaire cannot be answered from the docs, you do not have a security product yet.",
      views: 4700,
      likes: 119,
      comments: 21,
      reposts: 8,
      reachPoints: [800, 1500, 2300, 3100, 4000, 4700],
    },
  },
  {
    slug: "owen-clarke",
    name: "Owen Clarke",
    country: "United Kingdom",
    countryCode: "GB",
    industry: "SaaS",
    tags: ["SaaS", "Founders"],
    followers: 40900,
    medianViews: 15200,
    cpmCents: 1974,
    postCostCents: 30000,
    bundleCostCents: 135000,
    matchPercent: 81,
    typicalReach: 14000,
    postsAnalyzed: 36,
    audienceMatchPercent: 69,
    jobTitleBreakdown: [
      { label: "Founders", percent: 51 },
      { label: "Marketing", percent: 20 },
      { label: "Sales", percent: 17 },
      { label: "Other", percent: 12 },
    ],
    seniorityBreakdown: [
      { label: "Founder", percent: 62 },
      { label: "VP", percent: 21 },
      { label: "Manager", percent: 12 },
      { label: "Other", percent: 5 },
    ],
    overview:
      "SaaS founder with a large UK operator following. Better for category-level narrative than niche tooling.",
    post: {
      snippet:
        "Creator-led pipeline is not cheaper LinkedIn ads. You are buying a trusted explanation, not impressions.",
      views: 18400,
      likes: 412,
      comments: 67,
      reposts: 41,
      reachPoints: [4200, 7100, 9800, 12600, 15900, 18400],
    },
  },
  {
    slug: "lea-hoffmann",
    name: "Lea Hoffmann",
    country: "Germany",
    countryCode: "DE",
    industry: "Data",
    tags: ["Data", "Analytics"],
    followers: 11700,
    medianViews: 3600,
    cpmCents: 2222,
    postCostCents: 8000,
    bundleCostCents: 36000,
    matchPercent: 67,
    typicalReach: 3300,
    postsAnalyzed: 19,
    audienceMatchPercent: 55,
    jobTitleBreakdown: [
      { label: "Analytics", percent: 43 },
      { label: "Product", percent: 25 },
      { label: "Engineering", percent: 20 },
      { label: "Other", percent: 12 },
    ],
    seniorityBreakdown: [
      { label: "IC", percent: 38 },
      { label: "Manager", percent: 36 },
      { label: "Founder", percent: 17 },
      { label: "Other", percent: 9 },
    ],
    overview:
      "Analytics lead who posts about attribution without the dashboard theatre. DACH data and product readers.",
    post: {
      snippet:
        "Last-click attribution on a 40-day B2B cycle is a random number generator. Stop reporting it as truth.",
      views: 5100,
      likes: 136,
      comments: 31,
      reposts: 15,
      reachPoints: [700, 1400, 2200, 3300, 4400, 5100],
    },
  },
  {
    slug: "sofia-alvarez",
    name: "Sofia Alvarez",
    country: "Spain",
    countryCode: "ES",
    industry: "Marketing",
    tags: ["Growth", "Marketing"],
    followers: 20800,
    medianViews: 7100,
    cpmCents: 1549,
    postCostCents: 11000,
    bundleCostCents: 49500,
    matchPercent: 79,
    typicalReach: 6800,
    postsAnalyzed: 25,
    audienceMatchPercent: 66,
    jobTitleBreakdown: [
      { label: "Marketing", percent: 50 },
      { label: "Founders", percent: 26 },
      { label: "Sales", percent: 14 },
      { label: "Other", percent: 10 },
    ],
    seniorityBreakdown: [
      { label: "Manager", percent: 40 },
      { label: "Founder", percent: 35 },
      { label: "VP", percent: 16 },
      { label: "Other", percent: 9 },
    ],
    overview:
      "Growth marketer writing in English and Spanish. Useful for Southern Europe SaaS buyers.",
    post: {
      snippet:
        "We killed the 'thought leadership' calendar and posted one customer workflow a week. Demo rate doubled.",
      views: 8600,
      likes: 198,
      comments: 35,
      reposts: 16,
      reachPoints: [1600, 2900, 4500, 6100, 7500, 8600],
    },
  },
  {
    slug: "marcus-hale",
    name: "Marcus Hale",
    country: "United States",
    countryCode: "US",
    industry: "Customer Success",
    tags: ["Customer Success", "SaaS"],
    followers: 15400,
    medianViews: 4800,
    cpmCents: 1875,
    postCostCents: 9000,
    bundleCostCents: 40500,
    matchPercent: 70,
    typicalReach: 4500,
    postsAnalyzed: 21,
    audienceMatchPercent: 57,
    jobTitleBreakdown: [
      { label: "CS", percent: 47 },
      { label: "Founders", percent: 21 },
      { label: "Product", percent: 20 },
      { label: "Other", percent: 12 },
    ],
    seniorityBreakdown: [
      { label: "Manager", percent: 45 },
      { label: "Founder", percent: 24 },
      { label: "VP", percent: 20 },
      { label: "Other", percent: 11 },
    ],
    overview:
      "CS leader who writes about expansion without the QBR theatre. US SaaS operators.",
    post: {
      snippet:
        "If expansion depends on a QBR slide, you do not have expansion. You have a meeting.",
      views: 6200,
      likes: 154,
      comments: 27,
      reposts: 10,
      reachPoints: [1100, 2000, 3100, 4200, 5400, 6200],
    },
  },
];

async function reset() {
  await db.attributionStat.deleteMany();
  await db.dailyMetric.deleteMany();
  await db.message.deleteMany();
  await db.messageThread.deleteMany();
  await db.ledgerEntry.deleteMany();
  await db.collaboration.deleteMany();
  await db.campaignApplication.deleteMany();
  await db.shortlistItem.deleteMany();
  await db.contentPost.deleteMany();
  await db.campaign.deleteMany();
  await db.icp.deleteMany();
  await db.workspaceInvite.deleteMany();
  await db.workspaceMember.deleteMany();
  await db.creatorProfile.deleteMany();
  await db.workspace.deleteMany();
  await db.user.deleteMany();
  await db.creator.deleteMany();
}

async function seedCreators() {
  for (const creator of CREATORS) {
    const created = await db.creator.create({
      data: {
        slug: creator.slug,
        name: creator.name,
        photoUrl: `https://i.pravatar.cc/160?u=${creator.slug}`,
        country: creator.country,
        countryCode: creator.countryCode,
        industry: creator.industry,
        tags: JSON.stringify(creator.tags),
        followers: creator.followers,
        medianViews: creator.medianViews,
        cpmCents: creator.cpmCents,
        postCostCents: creator.postCostCents,
        bundleCostCents: creator.bundleCostCents,
        matchPercent: creator.matchPercent,
        typicalReach: creator.typicalReach,
        postsAnalyzed: creator.postsAnalyzed,
        audienceMatchPercent: creator.audienceMatchPercent,
        jobTitleBreakdown: JSON.stringify(creator.jobTitleBreakdown),
        seniorityBreakdown: JSON.stringify(creator.seniorityBreakdown),
        overview: creator.overview,
      },
    });

    await db.contentPost.create({
      data: {
        creatorId: created.id,
        snippet: creator.post.snippet,
        photoUrl: `https://i.pravatar.cc/640?u=${creator.slug}-post`,
        views: creator.post.views,
        likes: creator.post.likes,
        comments: creator.post.comments,
        reposts: creator.post.reposts,
        originalUrl: `https://www.linkedin.com/feed/update/${creator.slug}`,
        postedAt: new Date("2026-08-20T10:00:00.000Z"),
        reachPoints: JSON.stringify(creator.post.reachPoints),
      },
    });
  }
}

async function seedDemoBrand() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await db.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash,
      name: "Jordan Hale",
    },
  });

  const workspace = await db.workspace.create({
    data: {
      name: "Relayed",
      websiteUrl: "https://www.relayed.example",
      valueProposition:
        "Relayed helps B2B SaaS teams turn customer conversations into a searchable source of truth for product, CS, and sales.",
      industry: "SaaS",
      companySize: "11-50",
      onboardingComplete: true,
      walletBalanceCents: 0,
      members: {
        create: { userId: user.id, role: "owner" },
      },
      icps: {
        create: [
          {
            sortOrder: 1,
            title: "VP Product at Series A–C SaaS",
            description:
              "Owns onboarding and activation. Tired of insights living in Gong clips and Slack threads.",
          },
          {
            sortOrder: 2,
            title: "Head of Customer Success",
            description:
              "Needs expansion signals without another dashboard. Wants quotes and themes their team already heard.",
          },
          {
            sortOrder: 3,
            title: "Founder-led GTM teams",
            description:
              "Still close to customers. Will sponsor a creator who can explain the workflow in their own voice.",
          },
        ],
      },
    },
  });

  await db.campaign.create({
    data: {
      workspaceId: workspace.id,
      title: "Relayed creator brief",
      description:
        "Find operators who can explain how Relayed turns customer calls into a shared product and CS record.",
      status: "draft",
      productSummary:
        "Relayed records and clusters customer conversations so product and CS share one narrative, not twelve tools.",
      audienceSummary:
        "VP Product, Head of CS, and founder-led GTM teams at B2B SaaS companies in the US, UK, and EU.",
    },
  });

  await db.messageThread.create({
    data: {
      workspaceId: workspace.id,
      isSystem: true,
      title: "NaanoBot",
      messages: {
        create: {
          sender: "system",
          body: "Invite a creator — in this demo the thread opens as soon as the first booking is sent.",
        },
      },
    },
  });

  return workspace.id;
}

async function seedOpenOpportunities(relayedWorkspaceId: string) {
  await db.campaign.createMany({
    data: [
      {
        workspaceId: relayedWorkspaceId,
        title: "Relayed LinkedIn launch",
        description:
          "Sponsored LinkedIn posts that explain Relayed’s conversation-to-insight workflow for SaaS operators.",
        status: "active",
        productSummary:
          "Show how Relayed turns Gong clips and Slack threads into one searchable narrative for product and CS.",
        audienceSummary:
          "VP Product and Head of CS at Series A–C B2B SaaS in the US, UK, and EU.",
      },
      {
        workspaceId: relayedWorkspaceId,
        title: "Relayed CS expansion proof",
        description:
          "Creator posts that make expansion feel inevitable — without another dashboard.",
        status: "active",
        productSummary:
          "Highlight expansion signals Relayed surfaces from real customer conversations.",
        audienceSummary: "Customer Success leaders and founder-led GTM teams.",
      },
    ],
  });

  const northstar = await db.workspace.create({
    data: {
      name: "Northstar CRM",
      websiteUrl: "https://www.northstar-crm.example",
      valueProposition: "Pipeline clarity for mid-market sales teams.",
      industry: "SaaS",
      companySize: "51-200",
      onboardingComplete: true,
      walletBalanceCents: 0,
      targetRegions: JSON.stringify(["US", "UK"]),
    },
  });

  await db.campaign.create({
    data: {
      workspaceId: northstar.id,
      title: "Northstar outbound operators",
      description:
        "Looking for LinkedIn creators who can talk honestly about outbound systems and CRM hygiene.",
      status: "active",
      productSummary:
        "Northstar CRM helps mid-market AEs keep next steps and deal risk visible without spreadsheet theatre.",
      audienceSummary: "Sales managers and RevOps leads in US/UK SaaS.",
    },
  });
}

async function seedDemoCreator() {
  const maya = await db.creator.findUnique({ where: { slug: DEMO_CREATOR_SLUG } });
  if (!maya) {
    throw new Error(`Missing seeded creator ${DEMO_CREATOR_SLUG}`);
  }

  await db.creator.update({
    where: { id: maya.id },
    data: {
      headline: "B2B marketer writing about AI tooling for growth teams",
      linkedInUrl: "https://www.linkedin.com/in/maya-chen",
    },
  });

  const passwordHash = await bcrypt.hash(DEMO_CREATOR_PASSWORD, 10);
  const user = await db.user.create({
    data: {
      email: DEMO_CREATOR_EMAIL,
      passwordHash,
      name: maya.name,
      creatorProfile: {
        create: {
          creatorId: maya.id,
          linkedInUrl: "https://www.linkedin.com/in/maya-chen",
          headline: "B2B marketer writing about AI tooling for growth teams",
          onboardingComplete: true,
          referralCode: "ref-maya-demo",
        },
      },
    },
  });

  await db.messageThread.create({
    data: {
      creatorId: maya.id,
      isSystem: true,
      title: "NaanoBot",
      messages: {
        create: {
          sender: "system",
          body: "No conversations yet — the thread opens with your first Booking.",
        },
      },
    },
  });

  return user.id;
}

async function main() {
  await reset();
  await seedCreators();
  const relayedId = await seedDemoBrand();
  await seedOpenOpportunities(relayedId);
  await seedDemoCreator();

  const creators = await db.creator.count();
  const users = await db.user.count();
  const campaigns = await db.campaign.count();
  const activeCampaigns = await db.campaign.count({ where: { status: "active" } });

  console.log("Seed complete.");
  console.log(`  users: ${users}`);
  console.log(`  creators: ${creators}`);
  console.log(`  campaigns: ${campaigns} (${activeCampaigns} active)`);
  console.log(`  brand demo: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  creator demo: ${DEMO_CREATOR_EMAIL} / ${DEMO_CREATOR_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
