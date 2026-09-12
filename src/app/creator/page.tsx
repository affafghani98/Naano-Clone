import Link from "next/link";
import { requireCreator } from "@/lib/auth";
import { COLLAB_STATUS, COLLAB_STATUS_LABELS } from "@/lib/booking";
import { parseTags } from "@/lib/creator-profile";
import { db } from "@/lib/db";
import { formatEuro } from "@/lib/money";
import { CopyButton } from "./_components/copy-button";

export default async function CreatorOverviewPage() {
  const current = await requireCreator();
  const creatorId = current.creator.id;

  const [collaborations, applications, opportunities] = await Promise.all([
    db.collaboration.findMany({
      where: { creatorId },
      include: {
        workspace: { select: { name: true } },
        campaign: { select: { title: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.campaignApplication.findMany({
      where: { creatorId },
      select: { campaignId: true },
    }),
    db.campaign.findMany({
      where: { status: "active" },
      include: { workspace: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const appliedIds = new Set(applications.map((row) => row.campaignId));
  const activeCollabs = collaborations.filter(
    (row) =>
      row.status === COLLAB_STATUS.active ||
      row.status === COLLAB_STATUS.todo ||
      row.status === COLLAB_STATUS.invitationReceived ||
      row.status === COLLAB_STATUS.invitationSent,
  );
  const tags = parseTags(current.creator.tags);
  const dealLink = `https://naano.clone/c/${current.creator.slug}`;

  const stats = [
    { label: "Public post reach", value: "—" },
    { label: "Public posts", value: String(current.creator.postsAnalyzed || 0) },
    { label: "Public engagements", value: "—" },
    {
      label: "LinkedIn followers",
      value: current.creator.followers.toLocaleString(),
    },
  ];

  const launchGuide = [
    {
      label: "Card and price ready",
      done: current.profile.onboardingComplete && current.creator.postCostCents > 0,
    },
    {
      label: "Apply to an opportunity",
      done: applications.length > 0,
    },
    {
      label: "Share your Deal Link",
      done: false,
    },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Good to see you, {current.user.name}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Your creator activity, at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Your creator card</h2>
              <p className="mt-1 text-sm text-neutral-600">
                {current.creator.headline ?? "Marketplace profile"}
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.creator.photoUrl}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          </div>
          <p className="mt-3 text-sm text-neutral-600">
            {tags.join(" · ") || "No industries yet"} ·{" "}
            {formatEuro(current.creator.postCostCents)}/post
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/creator/card"
              className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-medium text-white"
            >
              Open card
            </Link>
            <CopyButton label="Copy card link" value={dealLink} />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Your launch guide</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {launchGuide.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <span className={item.done ? "text-neutral-950" : "text-neutral-400"}>
                  {item.done ? "✓" : "○"}
                </span>
                <span>
                  {item.label}
                  {item.done ? (
                    <span className="text-neutral-500"> — Complete</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recommended opportunities</h2>
          <Link href="/creator/opportunities" className="text-sm underline">
            View all
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {opportunities.length === 0 ? (
            <li className="text-sm text-neutral-500">No open campaigns yet.</li>
          ) : (
            opportunities.map((campaign) => (
              <li
                key={campaign.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-100 px-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{campaign.title}</p>
                  <p className="text-neutral-500">{campaign.workspace.name}</p>
                </div>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
                  {appliedIds.has(campaign.id) ? "Applied" : "Strong match"}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Active collaborations</h2>
          <Link href="/creator/collaborations" className="text-sm underline">
            View all
          </Link>
        </div>
        {activeCollabs.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">No active collaborations</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="pb-2 font-medium">Brand</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Next action</th>
                  <th className="pb-2 font-medium">Due</th>
                  <th className="pb-2 font-medium">Net</th>
                </tr>
              </thead>
              <tbody>
                {activeCollabs.map((row) => (
                  <tr key={row.id} className="border-t border-neutral-100">
                    <td className="py-3">{row.workspace.name}</td>
                    <td className="py-3">
                      {COLLAB_STATUS_LABELS[row.status] ?? row.status}
                    </td>
                    <td className="py-3">{row.nextAction ?? "—"}</td>
                    <td className="py-3">
                      {row.dueDate ? row.dueDate.toISOString().slice(0, 10) : "—"}
                    </td>
                    <td className="py-3">{formatEuro(row.agreedPriceCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
