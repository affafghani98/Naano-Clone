"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import {
  sendThreadMessage,
  type SendMessageState,
} from "../../actions/messages";

export type MessageItem = {
  id: string;
  sender: string;
  body: string;
  createdAt: string;
};

export type ThreadItem = {
  id: string;
  title: string;
  isSystem: boolean;
  creatorName: string | null;
  creatorPhotoUrl: string | null;
  campaignId: string | null;
  campaignTitle: string | null;
  preview: string;
  updatedAt: string;
  messages: MessageItem[];
};

type CampaignOption = { id: string; title: string };

export function MessagesView({
  threads,
  campaigns,
  hasCreatorThreads,
}: {
  threads: ThreadItem[];
  campaigns: CampaignOption[];
  hasCreatorThreads: boolean;
}) {
  const [query, setQuery] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    threads[0]?.id ?? null,
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return threads.filter((thread) => {
      if (campaignFilter !== "all") {
        if (thread.isSystem) {
          return false;
        }
        if (thread.campaignId !== campaignFilter) {
          return false;
        }
      }
      if (!needle) {
        return true;
      }
      const haystack = [
        thread.title,
        thread.creatorName ?? "",
        thread.campaignTitle ?? "",
        thread.preview,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [campaignFilter, query, threads]);

  const selected =
    visible.find((thread) => thread.id === selectedId) ??
    visible[0] ??
    null;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-neutral-600">
          NaanoBot is always here. Creator threads open when you book.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search conversations"
          className="min-w-56 flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm"
        />
        <select
          value={campaignFilter}
          onChange={(event) => {
            setCampaignFilter(event.target.value);
            setSelectedId(null);
          }}
          className="rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All messages</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.title}
            </option>
          ))}
        </select>
      </div>

      {!hasCreatorThreads ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
          No conversations yet. Invite a creator — the thread opens as soon as
          the first booking is sent.{" "}
          <Link href="/brand/creators" className="underline">
            Go to Marketplace
          </Link>
          .
        </p>
      ) : null}

      <div className="grid min-h-[28rem] overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="border-b border-neutral-200 lg:border-b-0 lg:border-r">
          {visible.length === 0 ? (
            <p className="px-4 py-8 text-sm text-neutral-500">
              No conversations match that search or filter.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {visible.map((thread) => {
                const active = (selected?.id ?? null) === thread.id;
                return (
                  <li key={thread.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(thread.id)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left ${
                        active ? "bg-neutral-100" : "hover:bg-neutral-50"
                      }`}
                    >
                      {thread.isSystem ? (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
                          N
                        </span>
                      ) : (
                        <img
                          src={thread.creatorPhotoUrl ?? ""}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {thread.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-neutral-500">
                          {thread.preview}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <div className="flex min-h-[22rem] flex-col">
          {selected ? (
            <>
              <header className="border-b border-neutral-200 px-4 py-3">
                <h2 className="font-semibold">{selected.title}</h2>
                {selected.campaignTitle ? (
                  <p className="text-xs text-neutral-500">
                    {selected.campaignTitle}
                  </p>
                ) : selected.isSystem ? (
                  <p className="text-xs text-neutral-500">System assistant</p>
                ) : null}
              </header>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {selected.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      message.sender === "brand"
                        ? "ml-auto bg-neutral-950 text-white"
                        : "bg-neutral-100 text-neutral-900"
                    }`}
                  >
                    <p>{message.body}</p>
                    <p
                      className={`mt-1 text-[11px] ${
                        message.sender === "brand"
                          ? "text-neutral-300"
                          : "text-neutral-500"
                      }`}
                    >
                      {message.sender === "brand"
                        ? "You"
                        : message.sender === "system"
                          ? "System"
                          : "Creator"}{" "}
                      ·{" "}
                      {new Date(message.createdAt).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                ))}
              </div>
              {selected.isSystem ? (
                <p className="border-t border-neutral-200 px-4 py-3 text-xs text-neutral-500">
                  NaanoBot is read-only in this demo.
                </p>
              ) : (
                <ComposeForm threadId={selected.id} />
              )}
            </>
          ) : (
            <p className="px-4 py-12 text-sm text-neutral-500">
              Select a conversation.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function ComposeForm({ threadId }: { threadId: string }) {
  const [state, formAction, pending] = useActionState(
    sendThreadMessage,
    {} as SendMessageState,
  );

  return (
    <form
      action={formAction}
      className="border-t border-neutral-200 px-4 py-3"
      key={threadId}
    >
      <input type="hidden" name="threadId" value={threadId} />
      <div className="flex gap-2">
        <input
          name="body"
          required
          placeholder="Write a message"
          className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
      {state.error ? (
        <p className="mt-2 text-xs text-red-700">{state.error}</p>
      ) : null}
    </form>
  );
}
