import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { BrandShell } from "./brand-shell";

export default async function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await requireUser();
  if (!current.workspace.onboardingComplete) {
    redirect("/onboarding-brand");
  }

  const workspaces = current.user.memberships.map((membership) => ({
    id: membership.workspace.id,
    name: membership.workspace.name,
    onboardingComplete: membership.workspace.onboardingComplete,
  }));

  const notifications = await db.notification.findMany({
    where: { userId: current.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <BrandShell
      userName={current.user.name}
      currentWorkspaceId={current.workspace.id}
      workspaces={workspaces}
      walletBalanceCents={current.workspace.walletBalanceCents}
      notifications={notifications.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        href: item.href,
        createdAt: item.createdAt.toISOString(),
        readAt: item.readAt?.toISOString() ?? null,
      }))}
    >
      {children}
    </BrandShell>
  );
}
