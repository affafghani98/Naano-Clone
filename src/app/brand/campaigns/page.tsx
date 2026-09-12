import { requireUser } from "@/lib/auth";
import { COLLAB_STATUS } from "@/lib/booking";
import { db } from "@/lib/db";
import { CampaignsView } from "./campaigns-view";

export default async function CampaignsPage() {
  const current = await requireUser();
  const campaigns = await db.campaign.findMany({
    where: { workspaceId: current.workspace.id },
    include: {
      collaborations: {
        select: { agreedPriceCents: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const showFirstBriefBanner = campaigns.some(
    (campaign) => campaign.status === "draft",
  );

  return (
    <CampaignsView
      showFirstBriefBanner={showFirstBriefBanner}
      campaigns={campaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        status: campaign.status,
        createdAt: campaign.createdAt.toISOString(),
        creators: campaign.collaborations.length,
        published: campaign.collaborations.filter(
          (row) => row.status === COLLAB_STATUS.completed,
        ).length,
        committedBudgetCents: campaign.collaborations.reduce(
          (sum, row) => sum + row.agreedPriceCents,
          0,
        ),
      }))}
    />
  );
}
