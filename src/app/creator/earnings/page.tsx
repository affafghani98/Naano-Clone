import { requireCreator } from "@/lib/auth";
import { formatEuro } from "@/lib/money";

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

export default async function CreatorEarningsPage() {
  await requireCreator();

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Earnings</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Track revenue from your paid collaborations and withdraw available funds.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total earned"
          amount={0}
          note="0 paid collaborations · €0 average"
        />
        <StatCard
          title="In transit"
          amount={0}
          note="International transfers can take a few days"
        />
        <StatCard title="Available now" amount={0} note="Ready to withdraw" />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Earnings over time</h2>
        <div className="mt-6 flex h-40 items-end gap-3">
          {MONTHS.map((month) => (
            <div key={month} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t bg-neutral-100" style={{ height: 8 }} />
              <span className="text-xs text-neutral-500">{month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Withdraw earnings</h2>
          <p className="mt-4 text-sm text-neutral-500">
            No earnings are currently waiting for release.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <p className="mt-4 text-sm text-neutral-500">No movements yet.</p>
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
