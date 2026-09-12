"use client";

import { useActionState, useMemo, useState } from "react";
import {
  creatorRespondToBooking,
  type CollabActionState,
} from "../../actions/collaborations";
import { COLLAB_STATUS, COLLAB_STATUS_LABELS } from "@/lib/booking";
import { formatEuro } from "@/lib/money";

export type CreatorCollabRow = {
  id: string;
  brandName: string;
  campaignTitle: string | null;
  status: string;
  nextAction: string | null;
  dueDate: string | null;
  netCents: number;
};

const TABS: {
  id: string;
  label: string;
  statuses: string[] | null;
}[] = [
  { id: "all", label: "All", statuses: null },
  {
    id: "active",
    label: "Active",
    statuses: ["active", "todo"],
  },
  {
    id: "needs",
    label: "Needs action",
    statuses: ["invitation_sent"],
  },
  {
    id: "applications",
    label: "Applications sent",
    statuses: ["invitation_received"],
  },
  { id: "declined", label: "Declined", statuses: ["declined"] },
  { id: "completed", label: "Completed", statuses: ["completed"] },
];

export function CollaborationsView({ rows }: { rows: CreatorCollabRow[] }) {
  const [tab, setTab] = useState("all");
  const filter = TABS.find((item) => item.id === tab);

  const visible = useMemo(() => {
    const statuses = filter?.statuses;
    if (!statuses) {
      return rows;
    }
    return rows.filter((row) => statuses.includes(row.status));
  }, [filter?.statuses, rows]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Collaborations</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Accept brand bookings, or track applications waiting on the brand.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => {
          const count = item.statuses
            ? rows.filter((row) => item.statuses!.includes(row.status)).length
            : rows.length;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                tab === item.id
                  ? "bg-neutral-950 text-white"
                  : "border border-neutral-200 bg-white"
              }`}
            >
              {item.label} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-sm text-neutral-500">
          No collaborations yet. Brand invitations and your accepted applications land
          here.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Next action</th>
                <th className="px-4 py-3 font-medium">Due date</th>
                <th className="px-4 py-3 font-medium">Your net</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-t border-neutral-50">
                  <td className="px-4 py-3">{row.brandName}</td>
                  <td className="px-4 py-3">{row.campaignTitle ?? "—"}</td>
                  <td className="px-4 py-3">
                    {COLLAB_STATUS_LABELS[row.status] ?? row.status}
                  </td>
                  <td className="px-4 py-3">{row.nextAction ?? "—"}</td>
                  <td className="px-4 py-3">
                    {row.dueDate ? row.dueDate.slice(0, 10) : "—"}
                  </td>
                  <td className="px-4 py-3">{formatEuro(row.netCents)}</td>
                  <td className="px-4 py-3">
                    {row.status === COLLAB_STATUS.invitationSent ? (
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
    creatorRespondToBooking,
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
