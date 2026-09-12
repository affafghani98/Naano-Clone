"use client";

import { useActionState } from "react";
import { addBudget, type BillingState } from "../../actions/billing";
import { QUICK_TOP_UPS_CENTS } from "@/lib/money";

export function TopUpForm() {
  const [state, formAction, pending] = useActionState(addBudget, {} as BillingState);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-sm font-medium">Add budget</p>
      <p className="mt-1 text-sm text-neutral-600">
        Fake top-up. No payment processor.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_TOP_UPS_CENTS.map((cents) => (
          <form action={formAction} key={cents}>
            <input type="hidden" name="amountEuros" value={String(cents / 100)} />
            <button
              type="submit"
              disabled={pending}
              className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-60"
            >
              +€{(cents / 100).toLocaleString("en-IE")}
            </button>
          </form>
        ))}
      </div>
      <form action={formAction} className="mt-4 space-y-3">
        <label className="block space-y-1 text-sm">
          <span>Amount (EUR)</span>
          <input
            name="amountEuros"
            type="number"
            min="1"
            step="1"
            required
            className="w-full rounded-xl border border-neutral-300 px-3 py-2"
          />
        </label>
        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add budget"}
        </button>
      </form>
    </div>
  );
}
