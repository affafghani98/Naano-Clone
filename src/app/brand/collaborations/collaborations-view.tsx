"use client";

import { useState } from "react";
import Link from "next/link";
import { COLLAB_STATUS_LABELS } from "@/lib/booking";
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
  id: "all" | "active" | "received" | "sent" | "todo" | "completed";
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
];

export function CollaborationsView({
  rows,
  notice,
}: {
  rows: CollaborationRow[];
  notice: string | null;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [showNotice, setShowNotice] = useState(Boolean(notice));
  const filter = TABS.find((item) => item.id === tab);
  const visible = rows.filter((row) => {
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
          Bookings and offers waiting on the creator, then active work.
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

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
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
            {item.label}
          </button>
        ))}
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
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
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
                    {new Date(row.updatedAt).toLocaleDateString("en-GB")}
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
