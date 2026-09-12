"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerCreator, type AuthState } from "../actions/auth";
import { formatEuro } from "@/lib/money";

export function CreatorRegisterView() {
  const [name, setName] = useState("");
  const [state, formAction, pending] = useActionState(
    registerCreator,
    {} as AuthState,
  );

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl gap-10 px-6 py-10 lg:grid-cols-2">
      <section className="flex flex-col">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Naano
        </Link>
        <div className="mt-16 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Join Naano</h1>
            <p className="mt-2 text-neutral-600">
              Get paid to create LinkedIn content for B2B brands you actually use.
              Email and password only — each email is creator or brand, not both.
            </p>
          </div>
          <form action={formAction} className="space-y-4">
            <label className="block space-y-1 text-sm">
              <span>Name</span>
              <input
                name="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
              />
            </label>
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
            {state.error ? (
              <p className="text-sm text-red-700">{state.error}</p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Please wait…" : "Continue"}
            </button>
          </form>
          <p className="text-sm text-neutral-600">
            Already registered?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </p>
        </div>
      </section>

      <aside className="flex items-center">
        <MarketplaceCardPreview name={name.trim() || "Your name"} />
      </aside>
    </main>
  );
}

export function MarketplaceCardPreview({
  name,
  headline = "LinkedIn headline placeholder",
  followers,
  impressions,
  postCostCents,
}: {
  name: string;
  headline?: string;
  followers?: number | null;
  impressions?: number | null;
  postCostCents?: number | null;
}) {
  return (
    <div className="w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        Your marketplace card
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-sm text-neutral-400">
          Photo
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-neutral-500">{headline}</p>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded-xl bg-neutral-50 px-2 py-3">
          <dt className="text-xs text-neutral-500">Followers</dt>
          <dd className="mt-1 font-medium">
            {followers != null && followers > 0 ? followers.toLocaleString() : "—"}
          </dd>
        </div>
        <div className="rounded-xl bg-neutral-50 px-2 py-3">
          <dt className="text-xs text-neutral-500">Est. impressions</dt>
          <dd className="mt-1 font-medium">
            {impressions != null && impressions > 0
              ? impressions.toLocaleString()
              : "—"}
          </dd>
        </div>
        <div className="rounded-xl bg-neutral-50 px-2 py-3">
          <dt className="text-xs text-neutral-500">Cost per post</dt>
          <dd className="mt-1 font-medium">
            {postCostCents != null && postCostCents > 0
              ? formatEuro(postCostCents)
              : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
