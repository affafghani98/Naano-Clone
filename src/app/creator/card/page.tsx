import { requireCreator } from "@/lib/auth";
import { parseTags } from "@/lib/creator-profile";
import { formatEuro } from "@/lib/money";
import { CopyButton } from "../_components/copy-button";
import { CardPreview } from "./card-preview";

export default async function CreatorCardPage() {
  const current = await requireCreator();
  const dealLink = `https://naano.clone/c/${current.creator.slug}`;
  const referralLink = `https://naano.clone/r/${current.profile.referralCode}`;
  const tags = parseTags(current.creator.tags);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Your Naano card, ready to travel
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Your card fields come from onboarding. Share the Deal Link with brands.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6">
          <div>
            <h2 className="text-lg font-semibold">Your card is your Deal Link</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Share this card with brands. When a brand joins through it, you earn a
              share of Naano&apos;s commission for three months. Send it when a brand
              contacts you.
            </p>
          </div>
          <CopyButton
            label="Copy or share my Deal Link"
            value={dealLink}
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white"
          />
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Referral earnings
          </p>
          <p className="mt-4 text-3xl font-semibold">Your share: 25%</p>
          <p className="mt-2 text-sm text-neutral-600">Reward period: 3 months</p>
          <CopyButton
            label="Copy referral link"
            value={referralLink}
            className="mt-6 rounded-full border border-neutral-200 px-4 py-2 text-sm"
          />
        </div>
      </div>

      <CardPreview
        name={current.creator.name}
        photoUrl={current.creator.photoUrl}
        headline={current.creator.headline ?? "Creator on Naano"}
        country={current.creator.country}
        tags={tags}
        followers={current.creator.followers}
        impressions={current.creator.typicalReach}
        postCostLabel={`${formatEuro(current.creator.postCostCents)}/post`}
      />
    </section>
  );
}
