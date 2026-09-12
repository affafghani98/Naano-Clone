import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
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

  return (
    <BrandShell
      userName={current.user.name}
      currentWorkspaceId={current.workspace.id}
      workspaces={workspaces}
      walletBalanceCents={current.workspace.walletBalanceCents}
    >
      {children}
    </BrandShell>
  );
}
