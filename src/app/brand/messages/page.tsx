import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureCollaborationThreads } from "@/lib/messages";
import { MessagesView } from "./messages-view";

export default async function MessagesPage() {
  const current = await requireUser();
  const workspaceId = current.workspace.id;

  await ensureCollaborationThreads(db, workspaceId);

  const [threads, campaigns] = await Promise.all([
    db.messageThread.findMany({
      where: { workspaceId },
      include: {
        creator: { select: { name: true, photoUrl: true } },
        collaboration: {
          select: {
            campaignId: true,
            campaign: { select: { title: true } },
          },
        },
        messages: { orderBy: { createdAt: "asc" } },
      },
      orderBy: [{ isSystem: "desc" }, { id: "asc" }],
    }),
    db.campaign.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  const sorted = [...threads].sort((left, right) => {
    if (left.isSystem !== right.isSystem) {
      return left.isSystem ? -1 : 1;
    }
    const leftAt = left.messages.at(-1)?.createdAt?.getTime() ?? 0;
    const rightAt = right.messages.at(-1)?.createdAt?.getTime() ?? 0;
    return rightAt - leftAt;
  });

  const hasCreatorThreads = sorted.some((thread) => !thread.isSystem);

  return (
    <MessagesView
      campaigns={campaigns}
      hasCreatorThreads={hasCreatorThreads}
      threads={sorted.map((thread) => {
        const latest = thread.messages.at(-1);
        return {
          id: thread.id,
          title: thread.title,
          isSystem: thread.isSystem,
          creatorName: thread.creator?.name ?? null,
          creatorPhotoUrl: thread.creator?.photoUrl ?? null,
          campaignId: thread.collaboration?.campaignId ?? null,
          campaignTitle: thread.collaboration?.campaign?.title ?? null,
          preview: latest?.body ?? "No messages yet.",
          updatedAt: (latest?.createdAt ?? new Date()).toISOString(),
          messages: thread.messages.map((message) => ({
            id: message.id,
            sender: message.sender,
            body: message.body,
            createdAt: message.createdAt.toISOString(),
          })),
        };
      })}
    />
  );
}
