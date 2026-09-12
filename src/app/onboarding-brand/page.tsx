import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { switchWorkspace } from "../actions/workspace";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingBrandPage() {
  const current = await requireUser();
  if (current.workspace.onboardingComplete) {
    redirect("/brand");
  }

  const otherWorkspaces = current.user.memberships
    .map((membership) => membership.workspace)
    .filter(
      (workspace) =>
        workspace.id !== current.workspace.id && workspace.onboardingComplete,
    );

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-semibold tracking-tight">Naano</p>
        {otherWorkspaces.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-neutral-500">Switch to</span>
            {otherWorkspaces.map((workspace) => (
              <form action={switchWorkspace} key={workspace.id}>
                <input type="hidden" name="workspaceId" value={workspace.id} />
                <button
                  type="submit"
                  className="rounded-full border border-neutral-300 px-3 py-1 hover:bg-neutral-50"
                >
                  {workspace.name}
                </button>
              </form>
            ))}
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-neutral-500">
        Setting up {current.workspace.name}
      </p>
      <OnboardingWizard />
    </main>
  );
}

