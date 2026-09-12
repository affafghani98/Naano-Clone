import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "../actions/auth";

export default async function BrandOverviewPage() {
  const current = await getCurrentUser();
  if (!current) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <header className="flex items-center justify-between">
        <p className="text-lg font-semibold tracking-tight">Naano</p>
        <form action={logout}>
          <button type="submit" className="text-sm underline">
            Sign out
          </button>
        </form>
      </header>
      <section className="mt-16 space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Hello {current.user.name}, here&apos;s what&apos;s happening for{" "}
          {current.workspace.name} on Naano.
        </h1>
        <p className="text-neutral-600">
          Overview widgets land in a later step. Onboarding is complete and you are
          in the brand workspace.
        </p>
      </section>
    </main>
  );
}
