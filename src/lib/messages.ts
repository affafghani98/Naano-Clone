import type { PrismaClient } from "@prisma/client";
import { formatLabel } from "./booking";

type Db = Pick<PrismaClient, "collaboration" | "messageThread">;

/** Backfill creator threads for bookings made before Messages existed. */
export async function ensureCollaborationThreads(
  db: Db,
  workspaceId: string,
) {
  const orphaned = await db.collaboration.findMany({
    where: { workspaceId, thread: null },
    include: { creator: true },
  });

  for (const collaboration of orphaned) {
    await db.messageThread.create({
      data: {
        workspaceId,
        creatorId: collaboration.creatorId,
        collaborationId: collaboration.id,
        isSystem: false,
        title: collaboration.creator.name,
        messages: {
          create: {
            sender: "system",
            body: `Booking with ${collaboration.creator.name} for ${formatLabel(collaboration.format)}. Waiting for them to accept or decline within 48 hours.`,
          },
        },
      },
    });
  }
}
