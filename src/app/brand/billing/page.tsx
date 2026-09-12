import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatEuro } from "@/lib/money";
import { InvoiceTabs } from "./invoice-tabs";
import { TopUpForm } from "./top-up-form";

export default async function BillingPage() {
  const current = await getCurrentUser();
  if (!current) {
    return null;
  }

  const invoices = await db.ledgerEntry.findMany({
    where: { workspaceId: current.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-2 text-neutral-600">
          Wallet credits, not per-transaction checkout. Bookings will deduct from
          this balance later.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,18rem)_1fr]">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Available balance</p>
          <p className="mt-2 text-3xl font-semibold">
            {formatEuro(current.workspace.walletBalanceCents)}
          </p>
        </article>
        <TopUpForm />
      </div>

      <InvoiceTabs
        invoices={invoices.map((entry) => ({
          id: entry.id,
          type: entry.type,
          amountCents: entry.amountCents,
          description: entry.description,
          createdAt: entry.createdAt.toISOString(),
        }))}
      />
    </section>
  );
}
