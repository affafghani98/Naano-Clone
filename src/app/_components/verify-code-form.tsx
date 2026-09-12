"use client";

import { useActionState } from "react";
import {
  resendLoginCode,
  verifyLoginCode,
  type AuthState,
} from "../actions/auth";
import type { AuthIntent } from "@/lib/login-code";

type Props = {
  email: string;
  intent: AuthIntent;
  name?: string;
  showDevHint?: boolean;
};

export function VerifyCodeForm({ email, intent, name, showDevHint }: Props) {
  const [state, formAction, pending] = useActionState(
    verifyLoginCode,
    {} as AuthState,
  );
  const [resendState, resendAction, resending] = useActionState(
    resendLoginCode,
    {} as AuthState,
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="intent" value={intent} />
        {name ? <input type="hidden" name="name" value={name} /> : null}
        <label className="block space-y-1 text-sm">
          <span>6-digit code</span>
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            placeholder="000000"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 tracking-[0.3em]"
          />
        </label>
        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Checking…" : "Verify and continue"}
        </button>
      </form>

      <form action={resendAction} className="space-y-2">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="intent" value={intent} />
        {name ? <input type="hidden" name="name" value={name} /> : null}
        <button
          type="submit"
          disabled={resending}
          className="text-sm underline disabled:opacity-60"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
        {resendState.error ? (
          <p className="text-sm text-red-700">{resendState.error}</p>
        ) : null}
      </form>

      {showDevHint ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          No Resend key configured — check your terminal for{" "}
          <code className="font-mono">[naano-auth]</code> and the login code.
        </p>
      ) : null}
    </div>
  );
}
