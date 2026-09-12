import type { Prisma } from "@prisma/client";

export async function notifyUsers(
  tx: Prisma.TransactionClient,
  input: {
    userIds: string[];
    title: string;
    body: string;
    href?: string;
  },
) {
  const unique = [...new Set(input.userIds.filter(Boolean))];
  if (unique.length === 0) {
    return;
  }
  await tx.notification.createMany({
    data: unique.map((userId) => ({
      userId,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
    })),
  });
}

export async function workspaceMemberUserIds(
  tx: Prisma.TransactionClient,
  workspaceId: string,
) {
  const members = await tx.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true },
  });
  return members.map((member) => member.userId);
}
