"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export type SendMessageState = {
  error?: string;
};

export async function sendThreadMessage(
  _prev: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const current = await getCurrentUser();
  if (!current) {
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

  const thread = await db.messageThread.findFirst({
    where: { id: threadId, workspaceId: current.workspace.id },
  });
  if (!thread) {
    return { error: "Conversation not found." };
  }
  if (thread.isSystem) {
    return { error: "NaanoBot replies are mocked — it does not take replies yet." };
  }

  await db.message.create({
    data: {
      threadId: thread.id,
      sender: "brand",
      body,
    },
  });

  revalidatePath("/brand/messages");
  return {};
}
