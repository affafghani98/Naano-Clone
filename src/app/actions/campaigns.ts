"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export type CampaignActionState = {
  error?: string;
};

export async function deleteCampaign(
  _prev: CampaignActionState,
  formData: FormData,
): Promise<CampaignActionState> {
  const current = await getCurrentUser();
  if (!current) {
    return { error: "You need to log in." };
  }

  const campaignId = String(formData.get("campaignId") ?? "");
  if (!campaignId) {
    return { error: "Missing campaign." };
  }

  const campaign = await db.campaign.findFirst({
    where: { id: campaignId, workspaceId: current.workspace.id },
  });
  if (!campaign) {
    return { error: "Campaign not found." };
  }

  await db.campaign.delete({ where: { id: campaign.id } });
  revalidatePath("/brand/campaigns");
  revalidatePath("/brand");
  revalidatePath("/brand/creators");
  return {};
}
