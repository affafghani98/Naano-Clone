import { redirect } from "next/navigation";
import { db } from "./db";
import { getSession } from "./session";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session || session.accountType !== "brand" || !session.workspaceId) {
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

export async function requireUser() {
  const current = await getCurrentUser();
  if (current) {
    return current;
  }
  redirect("/api/session/clear");
}

export async function getCurrentCreator() {
  const session = await getSession();
  if (!session || session.accountType !== "creator" || !session.creatorId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      creatorProfile: {
        include: { creator: true },
      },
    },
  });

  if (!user?.creatorProfile || user.creatorProfile.creatorId !== session.creatorId) {
    return null;
  }

  return {
    user,
    profile: user.creatorProfile,
    creator: user.creatorProfile.creator,
  };
}

export async function requireCreator() {
  const current = await getCurrentCreator();
  if (current) {
    return current;
  }
  redirect("/api/session/clear");
}

export async function redirectIfAuthenticated() {
  const session = await getSession();
  if (!session) {
    return;
  }

  if (session.accountType === "creator") {
    redirect(session.onboardingComplete ? "/creator" : "/onboarding");
    return;
  }

  const current = await getCurrentUser();
  if (!current) {
    return;
  }
  redirect(current.workspace.onboardingComplete ? "/brand" : "/onboarding-brand");
}
