import { redirect } from "next/navigation";
import { requireCreator } from "@/lib/auth";
import { CreatorOnboardingWizard } from "./onboarding-wizard";

export default async function CreatorOnboardingPage() {
  const current = await requireCreator();
  if (current.profile.onboardingComplete) {
    redirect("/creator");
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <p className="text-lg font-semibold tracking-tight">Naano</p>
      <p className="mt-2 text-sm text-neutral-500">Creator onboarding</p>
      <CreatorOnboardingWizard
        initialName={current.user.name}
        initialPhotoUrl={current.creator.photoUrl}
      />
    </main>
  );
}
