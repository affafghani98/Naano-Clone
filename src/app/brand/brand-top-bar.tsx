"use client";

import Link from "next/link";
import { useState } from "react";
import { logout } from "../actions/auth";
import { formatEuro } from "@/lib/money";

const CHECKLIST = [
  { href: "/brand/creators", label: "Discover Marketplace" },
  { href: "/brand/campaigns", label: "Create your first brief" },
  { href: "/brand/creators", label: "Book/negotiate with a creator" },
] as const;

type Props = {
  userName: string;
  walletBalanceCents: number;
};

export function BrandTopBar({ userName, walletBalanceCents }: Props) {
  const [open, setOpen] = useState<"started" | "bell" | "profile" | null>(null);

  function toggle(next: typeof open) {
    setOpen((current) => (current === next ? null : next));
  }

  return (
    <header className="flex items-center justify-end gap-3 border-b border-neutral-200 bg-white px-6 py-3">
      <Link
        href="/brand/billing"
        className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium"
      >
        {formatEuro(walletBalanceCents)}
      </Link>

      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("started")}
          className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-semibold tracking-wide text-white"
        >
          GET STARTED
        </button>
        {open === "started" ? (
          <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Guided setup
            </p>
            <ol className="mt-2 space-y-2">
              {CHECKLIST.map((item, index) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(null)}
                    className="block rounded-lg px-2 py-1.5 text-sm hover:bg-neutral-50"
                  >
                    {index + 1}. {item.label}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("bell")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-sm"
          aria-label="Notifications"
        >
          <span aria-hidden>🔔</span>
        </button>
        {open === "bell" ? (
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-3 text-sm text-neutral-600 shadow-sm">
            No notifications yet.
          </div>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("profile")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold"
          aria-label="Profile menu"
        >
          {userName.slice(0, 1).toUpperCase()}
        </button>
        {open === "profile" ? (
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-neutral-200 bg-white p-2 text-sm shadow-sm">
            <p className="px-2 py-1 text-xs text-neutral-500">{userName}</p>
            <Link
              href="/brand/creators"
              className="block rounded-lg px-2 py-1.5 hover:bg-neutral-50"
              onClick={() => setOpen(null)}
            >
              Invite Creators
            </Link>
            <a
              href="https://cal.com"
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg px-2 py-1.5 hover:bg-neutral-50"
            >
              Book a call
            </a>
            <p className="rounded-lg px-2 py-1.5 text-neutral-400">
              Integrations — out of scope
            </p>
            <Link
              href="/brand/settings"
              className="block rounded-lg px-2 py-1.5 hover:bg-neutral-50"
              onClick={() => setOpen(null)}
            >
              Settings
            </Link>
            <form action={logout}>
              <button type="submit" className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-neutral-50">
                Sign out
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}
