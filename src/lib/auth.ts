import { db } from "./db";
import { getSession } from "./session";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      memberships: {
        include: {
          workspace: {
            include: { icps: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const membership =
    user.memberships.find((item) => item.workspaceId === session.workspaceId) ??
    user.memberships[0];

  if (!membership) {
    return null;
  }

  return { user, workspace: membership.workspace };
}
