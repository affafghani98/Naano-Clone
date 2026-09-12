import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABELS } from "@/lib/campaigns";
import { db } from "@/lib/db";
import { formatEuro } from "@/lib/money";
import { CampaignStatusActions } from "./campaign-status-actions";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const current = await requireUser();
  const { id } = await params;
  const campaign = await db.campaign.findFirst({
    where: { id, workspaceId: current.workspace.id },
    include: {
      collaborations: {
        include: { creator: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  const committed = campaign.collaborations.reduce(
    (sum, row) => sum + row.agreedPriceCents,
    0,
  );

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Link href="/brand/campaigns" className="text-sm underline">
        Back to campaigns
      </Link>
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium">
            {CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status}
          </span>
          <CampaignStatusActions
            campaignId={campaign.id}
            status={campaign.status}
          />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {campaign.title}
        </h1>
        <p className="text-sm text-neutral-600">{campaign.description}</p>
        {campaign.status === CAMPAIGN_STATUS.draft ? (
          <p className="text-sm text-neutral-500">
            Drafts are not visible to creators. Publish to open applications.
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs text-neutral-500">Creators</p>
          <p className="mt-1 text-xl font-semibold">
            {campaign.collaborations.length}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Committed budget</p>
          <p className="mt-1 text-xl font-semibold">{formatEuro(committed)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Created</p>
          <p className="mt-1 text-xl font-semibold">
            {campaign.createdAt.toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>

      <article className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">My brief</h2>
        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="text-neutral-500">Product</dt>
            <dd className="mt-1">
              {campaign.productSummary ?? "No product summary yet."}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Audience</dt>
            <dd className="mt-1">
              {campaign.audienceSummary ?? "No audience summary yet."}
            </dd>
          </div>
        </dl>
      </article>

      <article className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Booked creators</h2>
        {campaign.collaborations.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            No bookings on this brief yet.{" "}
            <Link href="/brand/creators" className="underline">
              Invite a creator
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {campaign.collaborations.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.creator.photoUrl}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  {row.creator.name}
                </span>
                <span>{formatEuro(row.agreedPriceCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
