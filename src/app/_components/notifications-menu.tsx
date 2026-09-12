"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { markNotificationsRead } from "../actions/notifications";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  createdAt: string;
  readAt: string | null;
};

export function NotificationsMenu({
  items,
}: {
  items: NotificationItem[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const unread = items.filter((item) => !item.readAt).length;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      startTransition(() => {
        void markNotificationsRead();
      });
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-sm"
        aria-label="Notifications"
      >
        <span aria-hidden>🔔</span>
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-neutral-200 bg-white p-2 text-sm shadow-sm">
          <p className="px-2 py-1 text-xs uppercase tracking-wide text-neutral-500">
            Notifications {pending ? "…" : ""}
          </p>
          {items.length === 0 ? (
            <p className="px-2 py-3 text-neutral-500">No notifications yet.</p>
          ) : (
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-2 py-2 hover:bg-neutral-50"
                    >
                      <NotificationBody item={item} />
                    </Link>
                  ) : (
                    <div className="rounded-xl px-2 py-2">
                      <NotificationBody item={item} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function NotificationBody({ item }: { item: NotificationItem }) {
  return (
    <>
      <p className="font-medium text-neutral-900">{item.title}</p>
      <p className="mt-0.5 text-xs text-neutral-600">{item.body}</p>
      <p className="mt-1 text-[10px] text-neutral-400">
        {new Date(item.createdAt).toLocaleString()}
      </p>
    </>
  );
}
