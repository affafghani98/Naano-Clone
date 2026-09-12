"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { CAMPAIGN_STATUS } from "@/lib/campaigns";
import { db } from "@/lib/db";

export type CampaignActionState = {
  error?: string;
  ok?: boolean;
};

export async function createCampaign(
  _prev: CampaignActionState,
  formData: FormData,
): Promise<CampaignActionState> {
  const current = await getCurrentUser();
  if (!current) {
    return { error: "You need to log in." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const productSummary = String(formData.get("productSummary") ?? "").trim();
  const audienceSummary = String(formData.get("audienceSummary") ?? "").trim();
  const publish = String(formData.get("publish") ?? "") === "1";

  if (!title || !description) {
    return { error: "Title and description are required." };
  }

  await db.campaign.create({
    data: {
      workspaceId: current.workspace.id,
      title,
      description,
      productSummary: productSummary || null,
      audienceSummary: audienceSummary || null,
      status: publish ? CAMPAIGN_STATUS.active : CAMPAIGN_STATUS.draft,
    },
  });

  revalidatePath("/brand/campaigns");
  revalidatePath("/brand");
  revalidatePath("/creator/opportunities");
  revalidatePath("/creator");
  return { ok: true };
}

export async function setCampaignStatus(
  _prev: CampaignActionState,
  formData: FormData,
): Promise<CampaignActionState> {
  const current = await getCurrentUser();
  if (!current) {
    return { error: "You need to log in." };
  }

  const campaignId = String(formData.get("campaignId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!campaignId) {
    return { error: "Missing campaign." };
  }
  if (
    status !== CAMPAIGN_STATUS.draft &&
    status !== CAMPAIGN_STATUS.active &&
    status !== CAMPAIGN_STATUS.completed
  ) {
    return { error: "Pick a valid status." };
  }

  const campaign = await db.campaign.findFirst({
    where: { id: campaignId, workspaceId: current.workspace.id },
  });
  if (!campaign) {
    return { error: "Campaign not found." };
  }

  await db.campaign.update({
    where: { id: campaign.id },
    data: { status },
  });

  revalidatePath("/brand/campaigns");
  revalidatePath(`/brand/campaigns/${campaign.id}`);
  revalidatePath("/brand");
  revalidatePath("/creator/opportunities");
  revalidatePath("/creator");
  return { ok: true };
}

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
  revalidatePath("/creator/opportunities");
  return {};
}
