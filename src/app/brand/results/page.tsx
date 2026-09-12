import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildResultsSnapshot } from "@/lib/results";
import { ResultsView } from "./results-view";

export default async function ResultsPage() {
  const current = await requireUser();
  const workspaceId = current.workspace.id;

  const [campaigns, collaborations] = await Promise.all([
    db.campaign.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
    db.collaboration.findMany({
      where: { workspaceId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            typicalReach: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const allSnapshot = buildResultsSnapshot(
    collaborations.map((row) => ({
      id: row.id,
      agreedPriceCents: row.agreedPriceCents,
      creator: row.creator,
    })),
  );

  const snapshots: Record<string, ReturnType<typeof buildResultsSnapshot>> = {};
  for (const campaign of campaigns) {
    const rows = collaborations.filter(
      (row) => row.campaignId === campaign.id,
    );
    snapshots[campaign.id] = buildResultsSnapshot(
      rows.map((row) => ({
        id: row.id,
        agreedPriceCents: row.agreedPriceCents,
        creator: row.creator,
      })),
    );
  }

  return (
    <ResultsView
      campaigns={campaigns}
      snapshots={snapshots}
      allSnapshot={allSnapshot}
    />
  );
}
