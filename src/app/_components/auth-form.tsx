"use client";

import { useActionState } from "react";
import type { AuthState } from "../actions/auth";

type Props = {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  submitLabel: string;
  includeName?: boolean;
};

export function AuthForm({ action, submitLabel, includeName = false }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
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
      <label className="block space-y-1 text-sm">
        <span>Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
        />
      </label>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Please wait…" : submitLabel}
      </button>
    </form>
  );
}
