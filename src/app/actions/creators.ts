"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function toggleShortlist(creatorId: string) {
  const current = await requireUser();
  const key = {
    workspaceId: current.workspace.id,
    creatorId,
  };
  const existing = await db.shortlistItem.findUnique({
    where: { workspaceId_creatorId: key },
  });

  if (existing) {
    await db.shortlistItem.delete({ where: { workspaceId_creatorId: key } });
  } else {
    await db.shortlistItem.create({ data: key });
  }

  revalidatePath("/brand/creators");
}

export async function shortlistMany(creatorIds: string[]) {
  const current = await requireUser();
  await db.shortlistItem.createMany({
    data: creatorIds.map((creatorId) => ({
      workspaceId: current.workspace.id,
      creatorId,
    })),
    skipDuplicates: true,
  });
  revalidatePath("/brand/creators");
}
