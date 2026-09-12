import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseJsonList } from "@/lib/settings";
import { SettingsView } from "./settings-view";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const current = await requireUser();
  const { tab } = await searchParams;

  const [members, invites] = await Promise.all([
    db.workspaceMember.findMany({
      where: { workspaceId: current.workspace.id },
      include: { user: true },
      orderBy: { role: "asc" },
    }),
    db.workspaceInvite.findMany({
      where: {
        workspaceId: current.workspace.id,
        status: "pending",
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <SettingsView
      initialTab={tab ?? "profile"}
      profile={{
        name: current.workspace.name,
        websiteUrl: current.workspace.websiteUrl ?? "",
        valueProposition: current.workspace.valueProposition ?? "",
        industry: current.workspace.industry ?? "",
        companySize: current.workspace.companySize ?? "",
      }}
      targetIndustries={parseJsonList(current.workspace.targetIndustries)}
      targetRegions={parseJsonList(current.workspace.targetRegions)}
      members={members.map((membership) => ({
        id: membership.id,
        name: membership.user.name,
        email: membership.user.email,
        role: membership.role,
        isYou: membership.userId === current.user.id,
      }))}
      invites={invites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        status: invite.status,
        expiresAt: invite.expiresAt.toISOString(),
      }))}
      workspaces={current.user.memberships.map((membership) => ({
        id: membership.workspace.id,
        name: membership.workspace.name,
      }))}
      currentWorkspaceId={current.workspace.id}
    />
  );
}
