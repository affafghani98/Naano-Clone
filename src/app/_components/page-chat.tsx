"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendPageChat } from "../actions/chat";
import type { ChatMessage } from "@/lib/groq-chat";

export function PageChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
    inputRef.current?.focus();
  }, [open, messages, pending]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || pending) {
      return;
    }

    const history = messages;
    setInput("");
    setError(null);
    setMessages((current) => [...current, { role: "user", content: prompt }]);

    startTransition(async () => {
      const result = await sendPageChat({ prompt, history });
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.reply) {
        setMessages((current) => [
          ...current,
          { role: "assistant", content: result.reply! },
        ]);
      }
    });
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open ? (
        <div className="pointer-events-auto flex h-[500px] w-[min(100vw-2.5rem,380px)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
          <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Naano assistant</p>
              <p className="text-xs text-neutral-500">Ask anything about Naano</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <p className="px-1 text-xs text-neutral-500">
                Try “How do I book a creator?” or “Where are my opportunities?”
              </p>
            ) : null}
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                    message.role === "user"
                      ? "bg-neutral-950 text-white"
                      : "bg-neutral-100 text-neutral-900"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {pending ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-neutral-100 px-3 py-2 text-xs text-neutral-500">
                  Thinking…
                </div>
              </div>
            ) : null}
            {error ? (
              <p className="px-1 text-xs text-red-700">{error}</p>
            ) : null}
          </div>

          <form
            onSubmit={onSubmit}
            className="flex gap-2 border-t border-neutral-200 p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a question…"
              className="min-w-0 flex-1 rounded-full border border-neutral-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white shadow-lg hover:bg-neutral-800"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? "×" : "Chat"}
      </button>
    </div>
  );
}
