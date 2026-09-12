"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function markNotificationsRead() {
  const session = await getSession();
  if (!session) {
    return;
  }
  await db.notification.updateMany({
    where: { userId: session.userId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/brand");
  revalidatePath("/creator");
}
