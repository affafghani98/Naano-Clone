import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingBrandPage() {
  const current = await requireUser();
  if (current.workspace.onboardingComplete) {
    redirect("/brand");
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <p className="text-lg font-semibold tracking-tight">Naano</p>
      <OnboardingWizard />
    </main>
  );
}
