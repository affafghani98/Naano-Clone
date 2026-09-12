import { getCurrentUser } from "@/lib/auth";

export default async function BrandOverviewPage() {
  const current = await getCurrentUser();
  if (!current) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight">
        Hello {current.user.name}, here&apos;s what&apos;s happening for{" "}
        {current.workspace.name} on Naano.
      </h1>
      <p className="text-neutral-600">
        Overview widgets land in a later step. The shell, wallet, and navigation
        are live.
      </p>
    </section>
  );
}
