"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  brandRespondToApplication,
  type CollabActionState,
} from "../../actions/collaborations";
import { COLLAB_STATUS, COLLAB_STATUS_LABELS } from "@/lib/booking";
import { formatEuro } from "@/lib/money";

export type CollaborationRow = {
  id: string;
  creatorName: string;
  creatorPhotoUrl: string;
  campaignTitle: string | null;
  status: string;
  nextAction: string | null;
  dueDate: string | null;
  amountCents: number;
  updatedAt: string;
};

const TABS: {
  id: "all" | "active" | "received" | "sent" | "todo" | "completed" | "declined";
  label: string;
  statuses: string[] | null;
}[] = [
  { id: "all", label: "All", statuses: null },
  { id: "active", label: "Active", statuses: ["active"] },
  {
    id: "received",
    label: "Invitations received",
    statuses: ["invitation_received"],
  },
  { id: "sent", label: "Invitations sent", statuses: ["invitation_sent"] },
  { id: "todo", label: "To do", statuses: ["todo"] },
  { id: "completed", label: "Completed", statuses: ["completed"] },
  { id: "declined", label: "Declined", statuses: ["declined"] },
];

export function CollaborationsView({
  rows,
  notice,
}: {
  rows: CollaborationRow[];
  notice: string | null;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [campaign, setCampaign] = useState("all");
  const [showNotice, setShowNotice] = useState(Boolean(notice));

  const campaigns = Array.from(
    new Set(
      rows
        .map((row) => row.campaignTitle)
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort();

  const searched = rows.filter((row) => {
    if (campaign !== "all" && row.campaignTitle !== campaign) {
      return false;
    }
    const q = query.trim().toLowerCase();
    if (!q) {
      return true;
    }
    return (
      row.creatorName.toLowerCase().includes(q) ||
      (row.campaignTitle?.toLowerCase().includes(q) ?? false) ||
      (row.nextAction?.toLowerCase().includes(q) ?? false)
    );
  });

  const filter = TABS.find((item) => item.id === tab);
  const visible = searched.filter((row) => {
    const statuses = filter?.statuses;
    if (!statuses) {
      return true;
    }
    return statuses.includes(row.status);
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Collaborations</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Bookings and offers waiting on the creator, plus applications you can accept.
        </p>
      </div>

      {showNotice && notice ? (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm">
          <p>{notice}</p>
          <button
            type="button"
            onClick={() => setShowNotice(false)}
            className="text-neutral-500 underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search creator, campaign, or next action"
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm sm:max-w-sm"
        />
        <select
          value={campaign}
          onChange={(event) => setCampaign(event.target.value)}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All campaigns</option>
          {campaigns.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => {
          const count = item.statuses
            ? searched.filter((row) => item.statuses!.includes(row.status)).length
            : searched.length;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                tab === item.id
                  ? "bg-neutral-950 text-white"
                  : "border border-neutral-300"
              }`}
            >
              {item.label} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-12 text-center text-sm text-neutral-500">
          {rows.length === 0 ? (
            <>
              No collaborations yet.{" "}
              <Link href="/brand/creators" className="underline">
                Book a creator
              </Link>
              .
            </>
          ) : (
            "No collaborations in this tab."
          )}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Creator</th>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Next action</th>
                <th className="px-4 py-3 font-medium">Due date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.creatorPhotoUrl}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      {row.creatorName}
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.campaignTitle ?? "—"}</td>
                  <td className="px-4 py-3">
                    {COLLAB_STATUS_LABELS[row.status] ?? row.status}
                  </td>
                  <td className="px-4 py-3">{row.nextAction ?? "—"}</td>
                  <td className="px-4 py-3">
                    {row.dueDate
                      ? new Date(row.dueDate).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{formatEuro(row.amountCents)}</td>
                  <td className="px-4 py-3">
                    {row.status === COLLAB_STATUS.invitationReceived ? (
                      <RespondButtons collaborationId={row.id} />
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function RespondButtons({ collaborationId }: { collaborationId: string }) {
  const [state, formAction, pending] = useActionState(
    brandRespondToApplication,
    {} as CollabActionState,
  );

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        <form action={formAction}>
          <input type="hidden" name="collaborationId" value={collaborationId} />
          <input type="hidden" name="decision" value="accept" />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
          >
            Accept
          </button>
        </form>
        <form action={formAction}>
          <input type="hidden" name="collaborationId" value={collaborationId} />
          <input type="hidden" name="decision" value="decline" />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full border border-neutral-300 px-3 py-1 text-xs disabled:opacity-60"
          >
            Decline
          </button>
        </form>
      </div>
      {state.error ? <p className="text-xs text-red-700">{state.error}</p> : null}
    </div>
  );
}
