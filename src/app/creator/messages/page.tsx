import { requireCreator } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreatorMessagesView } from "./messages-view";

export default async function CreatorMessagesPage() {
  const current = await requireCreator();
  const creatorId = current.creator.id;

  const threads = await db.messageThread.findMany({
    where: { creatorId },
    include: {
      workspace: { select: { name: true } },
      collaboration: {
        select: {
          campaign: { select: { title: true } },
        },
      },
      messages: { orderBy: { createdAt: "asc" } },
    },
    orderBy: [{ isSystem: "desc" }, { id: "asc" }],
  });

  const sorted = [...threads].sort((left, right) => {
    if (left.isSystem !== right.isSystem) {
      return left.isSystem ? -1 : 1;
    }
    const leftAt = left.messages.at(-1)?.createdAt?.getTime() ?? 0;
    const rightAt = right.messages.at(-1)?.createdAt?.getTime() ?? 0;
    return rightAt - leftAt;
  });

  const hasBrandThreads = sorted.some((thread) => !thread.isSystem);

  return (
    <CreatorMessagesView
      hasBrandThreads={hasBrandThreads}
      threads={sorted.map((thread) => {
        const latest = thread.messages.at(-1);
        return {
          id: thread.id,
          title: thread.isSystem
            ? thread.title
            : thread.workspace?.name ?? thread.title,
          isSystem: thread.isSystem,
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
