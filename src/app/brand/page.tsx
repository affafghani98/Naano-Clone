import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { COLLAB_STATUS } from "@/lib/booking";
import { toMarketplaceCreator } from "@/lib/creators";
import { db } from "@/lib/db";
import { formatEuro } from "@/lib/money";
import { overviewStats, overviewTodos } from "@/lib/overview";
import { NewCreatorsRow } from "./new-creators-row";

export default async function BrandOverviewPage() {
  const current = await requireUser();
  const workspaceId = current.workspace.id;

  const [
    collaborations,
    shortlistCount,
    creatorCount,
    impressionAgg,
    creators,
    threads,
  ] = await Promise.all([
    db.collaboration.findMany({
      where: { workspaceId },
      select: { creatorId: true, status: true },
    }),
    db.shortlistItem.count({ where: { workspaceId } }),
    db.creator.count(),
    db.dailyMetric.aggregate({
      where: { workspaceId },
      _sum: { estimatedReach: true },
    }),
    db.creator.findMany({
      take: 6,
      orderBy: { matchPercent: "desc" },
      include: {
        contentPosts: { take: 1, orderBy: { postedAt: "desc" } },
        shortlist: {
          where: { workspaceId },
          select: { creatorId: true },
        },
      },
    }),
    db.messageThread.findMany({
      where: { workspaceId },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { id: "asc" },
    }),
  ]);

  const creatorsActivated = new Set(
    collaborations
      .filter((row) => row.status !== COLLAB_STATUS.invitationReceived)
      .map((row) => row.creatorId),
  ).size;
  const postsPublished = collaborations.filter(
    (row) => row.status === COLLAB_STATUS.completed,
  ).length;
  const impressions = impressionAgg._sum.estimatedReach ?? 0;
  const stats = overviewStats({
    creatorsActivated,
    postsPublished,
    profilesEngaged: shortlistCount,
    impressions,
  });
  const todos = overviewTodos({
    walletBalanceCents: current.workspace.walletBalanceCents,
    collaborationCount: collaborations.length,
  });

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Hello {current.user.name}, here&apos;s what&apos;s happening for{" "}
          {current.workspace.name} on Naano.
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Wallet {formatEuro(current.workspace.walletBalanceCents)} ·{" "}
          {creatorCount} creators in marketplace · {collaborations.length}{" "}
          collaboration
          {collaborations.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-neutral-200 bg-white p-5"
          >
            <p className="text-sm text-neutral-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">To do</h2>
          <ul className="mt-4 space-y-3">
            {todos.map((todo) => (
              <li key={todo.id}>
                {todo.external ? (
                  <a
                    href={todo.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-sm hover:bg-neutral-50"
                  >
                    <span>{todo.label}</span>
                    <TodoBadge state={todo.state} />
                  </a>
                ) : (
                  <Link
                    href={todo.href}
                    className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-sm hover:bg-neutral-50"
                  >
                    <span>{todo.label}</span>
                    <TodoBadge state={todo.state} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">Recently engaged companies</h2>
          <p className="mt-6 text-sm text-neutral-500">
            No company has engaged yet.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold">Messages</h2>
            <Link href="/brand/messages" className="text-sm underline">
              Open
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {threads.length === 0 ? (
              <li className="text-sm text-neutral-500">
                No conversations yet.
              </li>
            ) : (
              threads.slice(0, 3).map((thread) => {
                const latest = thread.messages[0];
                return (
                  <li key={thread.id} className="rounded-xl bg-neutral-50 px-3 py-2">
                    <p className="text-sm font-medium">{thread.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-600">
                      {latest?.body ?? "No messages yet."}
                    </p>
                  </li>
                );
              })
            )}
          </ul>
        </article>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">New creators</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Recommended matches for {current.workspace.name}.
            </p>
          </div>
          <Link href="/brand/creators" className="text-sm underline">
            See all
          </Link>
        </div>
        <NewCreatorsRow creators={creators.map(toMarketplaceCreator)} />
      </div>
    </section>
  );
}

function TodoBadge({ state }: { state: "blocked" | "suggested" | "done" }) {
  const label =
    state === "blocked" ? "Blocked" : state === "done" ? "Done" : "Suggested";
  const className =
    state === "blocked"
      ? "bg-amber-100 text-amber-900"
      : state === "done"
        ? "bg-emerald-100 text-emerald-900"
        : "bg-neutral-100 text-neutral-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}>
      {label}
    </span>
  );
}
