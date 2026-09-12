"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCreator, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyUsers, workspaceMemberUserIds } from "@/lib/notifications";

export type SendMessageState = {
  error?: string;
};

export async function sendThreadMessage(
  _prev: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const brand = await getCurrentUser();
  const creator = brand ? null : await getCurrentCreator();
  if (!brand && !creator) {
    return { error: "You need to log in." };
  }

  const threadId = String(formData.get("threadId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!threadId) {
    return { error: "Missing conversation." };
  }
  if (!body) {
    return { error: "Write a message first." };
  }
  if (body.length > 2000) {
    return { error: "Keep messages under 2,000 characters." };
  }

  if (brand) {
    const thread = await db.messageThread.findFirst({
      where: { id: threadId, workspaceId: brand.workspace.id },
      include: { creator: { include: { profile: true } } },
    });
    if (!thread) {
      return { error: "Conversation not found." };
    }
    if (thread.isSystem) {
      return {
        error: "NaanoBot replies are mocked. It does not take replies yet.",
      };
    }

    await db.$transaction(async (tx) => {
      await tx.message.create({
        data: {
          threadId: thread.id,
          sender: "brand",
          body,
        },
      });
      if (thread.creator?.profile) {
        await notifyUsers(tx, {
          userIds: [thread.creator.profile.userId],
          title: "New message",
          body: `${brand.workspace.name}: ${body.slice(0, 120)}`,
          href: "/creator/messages",
        });
      }
    });
    revalidatePath("/brand/messages");
    revalidatePath("/creator/messages");
    return {};
  }

  const thread = await db.messageThread.findFirst({
    where: { id: threadId, creatorId: creator!.creator.id },
  });
  if (!thread) {
    return { error: "Conversation not found." };
  }
  if (thread.isSystem) {
    return {
      error: "NaanoBot replies are mocked. It does not take replies yet.",
    };
  }
  if (!thread.workspaceId) {
    return { error: "Conversation not found." };
  }

  await db.$transaction(async (tx) => {
    await tx.message.create({
      data: {
        threadId: thread.id,
        sender: "creator",
        body,
      },
    });
    const brandUsers = await workspaceMemberUserIds(tx, thread.workspaceId!);
    await notifyUsers(tx, {
      userIds: brandUsers,
      title: "New message",
      body: `${creator!.creator.name}: ${body.slice(0, 120)}`,
      href: "/brand/messages",
    });
  });
  revalidatePath("/creator/messages");
  revalidatePath("/brand/messages");
  return {};
}
