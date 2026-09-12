"use client";

import { useActionState } from "react";
import {
  setCampaignStatus,
  type CampaignActionState,
} from "../../../actions/campaigns";
import { CAMPAIGN_STATUS } from "@/lib/campaigns";

export function CampaignStatusActions({
  campaignId,
  status,
}: {
  campaignId: string;
  status: string;
}) {
  const [state, formAction, pending] = useActionState(
    setCampaignStatus,
    {} as CampaignActionState,
  );

  if (status === CAMPAIGN_STATUS.active) {
    return (
      <form action={formAction} className="inline">
        <input type="hidden" name="campaignId" value={campaignId} />
        <input type="hidden" name="status" value={CAMPAIGN_STATUS.draft} />
        <button
          type="submit"
          disabled={pending}
          className="text-xs underline disabled:opacity-60"
        >
          Unpublish
        </button>
        {state.error ? (
          <span className="ml-2 text-xs text-red-700">{state.error}</span>
        ) : null}
      </form>
    );
  }

  if (status === CAMPAIGN_STATUS.draft) {
    return (
      <form action={formAction} className="inline">
        <input type="hidden" name="campaignId" value={campaignId} />
        <input type="hidden" name="status" value={CAMPAIGN_STATUS.active} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
        >
          {pending ? "Publishing…" : "Publish to creators"}
        </button>
        {state.error ? (
          <span className="ml-2 text-xs text-red-700">{state.error}</span>
        ) : null}
      </form>
    );
  }

  return null;
}
