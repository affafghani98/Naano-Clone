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

  return (
    <BrandShell
      userName={current.user.name}
      workspaceName={current.workspace.name}
      walletBalanceCents={current.workspace.walletBalanceCents}
    >
      {children}
    </BrandShell>
  );
}
