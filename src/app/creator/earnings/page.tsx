import { requireCreator } from "@/lib/auth";
import { earningNote } from "@/lib/creator-earnings";
import { db } from "@/lib/db";
import { formatEuro } from "@/lib/money";
import { WithdrawForm } from "./withdraw-form";

export default async function CreatorEarningsPage() {
  const current = await requireCreator();

  const [ledger, earningAgg] = await Promise.all([
    db.creatorLedgerEntry.findMany({
      where: { creatorProfileId: current.profile.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    db.creatorLedgerEntry.aggregate({
      where: { creatorProfileId: current.profile.id, type: "earning" },
      _sum: { amountCents: true },
      _count: true,
    }),
  ]);

  const totalEarned = earningAgg._sum.amountCents ?? 0;
  const paidCount = earningAgg._count;
  const average =
    paidCount > 0 ? Math.round(totalEarned / paidCount) : 0;
  const available = current.profile.walletBalanceCents;

  const monthBuckets = buildMonthBuckets(ledger.filter((row) => row.type === "earning"));

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Earnings</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Track revenue from paid collaborations and withdraw available funds
          (demo wallet, no bank).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total earned"
          amount={totalEarned}
          note={earningNote(paidCount, average)}
        />
        <StatCard
          title="In transit"
          amount={0}
          note="Demo pays into Available immediately"
        />
        <StatCard
          title="Available now"
          amount={available}
          note="Ready to withdraw"
        />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Earnings over time</h2>
        <div className="mt-6 flex h-40 items-end gap-3">
          {monthBuckets.map((bucket) => (
            <div key={bucket.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t bg-neutral-900/80"
                style={{ height: Math.max(8, bucket.height) }}
              />
              <span className="text-xs text-neutral-500">{bucket.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Withdraw earnings</h2>
          <WithdrawForm availableCents={available} />
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          {ledger.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No movements yet.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {ledger.map((row) => (
                <li
                  key={row.id}
                  className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{row.description}</p>
                    <p className="text-xs text-neutral-500">
                      {row.createdAt.toLocaleString()} · {row.type}
                    </p>
                  </div>
                  <p
                    className={
                      row.amountCents >= 0 ? "text-green-700" : "text-neutral-800"
                    }
                  >
                    {row.amountCents >= 0 ? "+" : ""}
                    {formatEuro(row.amountCents)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  title,
  amount,
  note,
}: {
  title: string;
  amount: number;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{formatEuro(amount)}</p>
      <p className="mt-1 text-xs text-neutral-500">{note}</p>
    </div>
  );
}

function buildMonthBuckets(
  earnings: { amountCents: number; createdAt: Date }[],
) {
  const now = new Date();
  const months: { key: string; label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    months.push({
      key,
      label: date.toLocaleString("en", { month: "short" }),
      total: 0,
    });
  }
  for (const row of earnings) {
    const key = `${row.createdAt.getFullYear()}-${row.createdAt.getMonth()}`;
    const bucket = months.find((item) => item.key === key);
    if (bucket) {
      bucket.total += row.amountCents;
    }
  }
  const max = Math.max(...months.map((item) => item.total), 1);
  return months.map((item) => ({
    label: item.label,
    height: Math.round((item.total / max) * 140),
  }));
}
