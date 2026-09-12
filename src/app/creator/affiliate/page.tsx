import { requireCreator } from "@/lib/auth";
import { formatEuro } from "@/lib/money";
import { CopyButton } from "../_components/copy-button";

export default async function CreatorAffiliatePage() {
  const current = await requireCreator();
  const referralLink = `https://naano.clone/r/${current.profile.referralCode}`;
  const dealLink = `https://naano.clone/c/${current.creator.slug}`;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Affiliate program</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Recommend Naano. Earn for 3 months.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <p className="text-sm text-neutral-600">
          Share a personal referral link with a company. If they join and launch paid
          campaigns, you get 25% of Naano&apos;s commission for 3 months.
        </p>
        <div className="mt-4">
          <CopyButton
            label="Copy my referral link"
            value={referralLink}
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Rewards earned
          </p>
          <p className="mt-2 text-2xl font-semibold">{formatEuro(0)}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Brands introduced
          </p>
          <p className="mt-2 text-2xl font-semibold">0</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Earning now
          </p>
          <p className="mt-2 text-2xl font-semibold">0</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Recommend Naano</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Generic referral link for any company.
          </p>
          <CopyButton
            label="Copy referral link"
            value={referralLink}
            className="mt-4 rounded-full border border-neutral-200 px-4 py-2 text-sm"
          />
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Share your Creator Card</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Your existing card link — brands discover you and Naano together.
          </p>
          <CopyButton
            label="Copy card link"
            value={dealLink}
            className="mt-4 rounded-full border border-neutral-200 px-4 py-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-semibold">How you get paid</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          <li>
            <p className="font-medium">1. Share the right link</p>
            <p className="mt-1 text-neutral-600">
              Referral link or your creator card.
            </p>
          </li>
          <li>
            <p className="font-medium">2. They launch a campaign</p>
            <p className="mt-1 text-neutral-600">
              Paid bookings start the reward window.
            </p>
          </li>
          <li>
            <p className="font-medium">3. Earn for 3 months</p>
            <p className="mt-1 text-neutral-600">
              25% of Naano&apos;s commission.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}
