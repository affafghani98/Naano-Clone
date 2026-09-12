"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createCampaign,
  type CampaignActionState,
} from "../../../actions/campaigns";

export function CreateCampaignForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createCampaign,
    {} as CampaignActionState,
  );

  useEffect(() => {
    if (state.ok) {
      router.push("/brand/campaigns");
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
      <label className="block space-y-1 text-sm">
        <span>Campaign title</span>
        <input
          name="title"
          required
          className="w-full rounded-xl border border-neutral-300 px-3 py-2"
          placeholder="Q4 LinkedIn launch"
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Description</span>
        <textarea
          name="description"
          required
          rows={4}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2"
          placeholder="What should creators talk about?"
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Product summary</span>
        <textarea
          name="productSummary"
          rows={3}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2"
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Audience summary</span>
        <textarea
          name="audienceSummary"
          rows={3}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="publish" value="1" defaultChecked />
        Publish now (visible to creators as an open opportunity)
      </label>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save campaign"}
      </button>
    </form>
  );
}
