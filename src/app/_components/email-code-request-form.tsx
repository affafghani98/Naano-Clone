"use client";

import { useActionState } from "react";
import {
  requestLoginCode,
  type AuthState,
} from "../actions/auth";
import type { AuthIntent } from "@/lib/login-code";

type Props = {
  intent: AuthIntent;
  includeName?: boolean;
  submitLabel: string;
};

export function EmailCodeRequestForm({
  intent,
  includeName = false,
  submitLabel,
}: Props) {
  const [state, formAction, pending] = useActionState(
    requestLoginCode,
    {} as AuthState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="intent" value={intent} />
      {includeName ? (
        <label className="block space-y-1 text-sm">
          <span>Name</span>
          <input
            name="name"
            required
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
      ) : null}
      <label className="block space-y-1 text-sm">
        <span>Email</span>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
        />
      </label>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Sending code…" : submitLabel}
      </button>
    </form>
  );
}
