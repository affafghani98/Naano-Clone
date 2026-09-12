import { requireCreator } from "@/lib/auth";
import { db } from "@/lib/db";
import { OpportunitiesView } from "./opportunities-view";

export default async function CreatorOpportunitiesPage() {
  const current = await requireCreator();

  const [campaigns, applications] = await Promise.all([
    db.campaign.findMany({
      where: { status: "active" },
      include: {
        workspace: {
          select: {
            name: true,
            websiteUrl: true,
            industry: true,
            targetRegions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.campaignApplication.findMany({
      where: { creatorId: current.creator.id },
      select: { campaignId: true },
    }),
  ]);

  const applied = new Set(applications.map((row) => row.campaignId));

  return (
    <OpportunitiesView
      campaigns={campaigns.map((campaign, index) => {
        let regions: string[] = [];
        try {
          regions = campaign.workspace.targetRegions
            ? (JSON.parse(campaign.workspace.targetRegions) as string[])
            : [];
        } catch {
          regions = [];
        }
        const match = 88 + ((index * 5) % 12);
        return {
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          productSummary: campaign.productSummary,
          audienceSummary: campaign.audienceSummary,
          brandName: campaign.workspace.name,
          brandWebsite: campaign.workspace.websiteUrl,
          industry: campaign.workspace.industry,
          regions,
          matchPercent: Math.min(100, match),
          applied: applied.has(campaign.id),
          deadlineLabel: "Flexible",
        };
      })}
    />
  );
}
