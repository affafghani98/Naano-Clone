import { requireCreator } from "@/lib/auth";
import { db } from "@/lib/db";
import { CollaborationsView } from "./collaborations-view";

export default async function CreatorCollaborationsPage() {
  const current = await requireCreator();

  const rows = await db.collaboration.findMany({
    where: { creatorId: current.creator.id },
    include: {
      workspace: { select: { name: true } },
      campaign: { select: { title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <CollaborationsView
      rows={rows.map((row) => ({
        id: row.id,
        brandName: row.workspace.name,
        campaignTitle: row.campaign?.title ?? null,
        status: row.status,
        nextAction: row.nextAction,
        dueDate: row.dueDate?.toISOString() ?? null,
        netCents: row.agreedPriceCents,
      }))}
    />
  );
}
