"use client";

import { useState } from "react";
import { formatEuro } from "@/lib/money";

type Invoice = {
  id: string;
  type: string;
  amountCents: number;
  description: string;
  createdAt: string;
};

const TABS = [
  { id: "all", label: "All" },
  { id: "topup", label: "Top-ups" },
  { id: "booking", label: "Bookings" },
] as const;

export function InvoiceTabs({ invoices }: { invoices: Invoice[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const rows = invoices.filter((entry) => tab === "all" || entry.type === tab);

  return (
    <div>
      <div className="flex gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              tab === item.id ? "bg-neutral-950 text-white" : "border border-neutral-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-sm text-neutral-500">No invoices yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3">
                    {new Date(entry.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3 capitalize">{entry.type}</td>
                  <td className="px-4 py-3">{entry.description}</td>
                  <td className="px-4 py-3">{formatEuro(entry.amountCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
