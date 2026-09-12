"use client";

import { useActionState } from "react";
import {
  withdrawCreatorEarnings,
  type WithdrawState,
} from "../../actions/creator-earnings";
import { formatEuro } from "@/lib/money";

export function WithdrawForm({ availableCents }: { availableCents: number }) {
  const [state, formAction, pending] = useActionState(
    withdrawCreatorEarnings,
    {} as WithdrawState,
  );

  if (availableCents <= 0) {
    return (
      <p className="mt-4 text-sm text-neutral-500">
        No earnings are currently available to withdraw. Accept a booking or get
        an application accepted first.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <p className="text-sm text-neutral-600">
        Demo withdraw only. Funds leave your in app balance with no bank
        transfer.
      </p>
      <label className="block space-y-1 text-sm">
        <span>Amount (EUR)</span>
        <input
          name="amountEuro"
          type="number"
          min={1}
          step="0.01"
          max={(availableCents / 100).toFixed(2)}
          defaultValue={(availableCents / 100).toFixed(2)}
          required
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
        />
      </label>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state.ok ? (
        <p className="text-sm text-green-700">
          Withdraw recorded. Available balance updated.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Withdrawing…" : `Withdraw up to ${formatEuro(availableCents)}`}
      </button>
    </form>
  );
}
