"use client";

import { useActionState } from "react";
import {
  createCampaignWithAi,
  type AiCampaignState,
} from "../../../../actions/campaign-ai";

export function AiCampaignForm() {
  const [state, formAction, pending] = useActionState(
    createCampaignWithAi,
    {} as AiCampaignState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-1 text-sm">
        <span>What should creators talk about?</span>
        <textarea
          name="prompt"
          required
          rows={5}
          minLength={20}
          placeholder="e.g. We help B2B SaaS teams turn customer calls into a shared product record. Want LinkedIn posts for VP Product and Head of CS."
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="publish" value="1" defaultChecked />
        Publish now so creators can apply
      </label>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Drafting brief…" : "Generate brief with AI"}
      </button>
    </form>
  );
}
