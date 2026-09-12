import { redirect } from "next/navigation";
import { requireCreator } from "@/lib/auth";
import { CreatorShell } from "./creator-shell";

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await requireCreator();
  if (!current.profile.onboardingComplete) {
    redirect("/onboarding");
  }

  return (
    <CreatorShell userName={current.user.name}>{children}</CreatorShell>
  );
}
