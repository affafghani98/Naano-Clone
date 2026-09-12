import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingBrandPage() {
  const current = await getCurrentUser();
  if (!current) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <p className="text-lg font-semibold tracking-tight">Naano</p>
      <OnboardingWizard />
    </main>
  );
}
