import { requireUser } from "@/lib/auth";
import { toMarketplaceCreator } from "@/lib/creators";
import { db } from "@/lib/db";
import { CreatorsMarketplace } from "./creators-marketplace";

export default async function CreatorsPage() {
  const current = await requireUser();
  const rows = await db.creator.findMany({
    include: {
      contentPosts: { take: 1, orderBy: { postedAt: "desc" } },
      shortlist: {
        where: { workspaceId: current.workspace.id },
        select: { creatorId: true },
      },
    },
    orderBy: { matchPercent: "desc" },
  });

  return (
    <CreatorsMarketplace
      workspaceName={current.workspace.name}
      creators={rows.map(toMarketplaceCreator)}
    />
  );
}
