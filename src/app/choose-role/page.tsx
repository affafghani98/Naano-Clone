import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { chooseAccountRole } from "../actions/auth";

export default async function ChooseRolePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      memberships: { include: { workspace: true } },
      creatorProfile: { include: { creator: true } },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const hasBrand = user.memberships.length > 0;
  const hasCreator = Boolean(user.creatorProfile);

  if (!hasBrand || !hasCreator) {
    if (hasCreator) {
      redirect(
        user.creatorProfile!.onboardingComplete ? "/creator" : "/onboarding",
      );
    }
    if (hasBrand) {
      const workspace = user.memberships[0]!.workspace;
      redirect(workspace.onboardingComplete ? "/brand" : "/onboarding-brand");
    }
    redirect("/login");
  }

  const brandName = user.memberships[0]!.workspace.name;
  const creatorName = user.creatorProfile!.creator.name;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <p className="text-lg font-semibold tracking-tight">Naano</p>
      <section className="mt-16 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Continue as…
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            This email has both a brand workspace and a creator profile.
          </p>
        </div>
        <div className="grid gap-3">
          <form action={chooseAccountRole}>
            <input type="hidden" name="role" value="brand" />
            <button
              type="submit"
              className="w-full rounded-2xl border border-neutral-300 bg-white p-5 text-left hover:border-neutral-950"
            >
              <p className="text-sm uppercase tracking-wide text-neutral-500">
                Brand
              </p>
              <p className="mt-1 text-lg font-medium">{brandName}</p>
            </button>
          </form>
          <form action={chooseAccountRole}>
            <input type="hidden" name="role" value="creator" />
            <button
              type="submit"
              className="w-full rounded-2xl border border-neutral-300 bg-white p-5 text-left hover:border-neutral-950"
            >
              <p className="text-sm uppercase tracking-wide text-neutral-500">
                Creator
              </p>
              <p className="mt-1 text-lg font-medium">{creatorName}</p>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
