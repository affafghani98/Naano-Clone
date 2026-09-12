"use client";

import { FormEvent, useState } from "react";

export function ChatStub() {
  const [note, setNote] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNote("Chat is a stub. It does not call a model.");
  }

  return (
    <div className="border-t border-neutral-200 bg-white px-8 py-4">
      <form onSubmit={onSubmit} className="mx-auto flex max-w-3xl gap-2">
        <input
          name="prompt"
          placeholder="What would you like to see?"
          className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white"
        >
          Ask
        </button>
      </form>
      {note ? <p className="mx-auto mt-2 max-w-3xl text-xs text-neutral-500">{note}</p> : null}
    </div>
  );
}
