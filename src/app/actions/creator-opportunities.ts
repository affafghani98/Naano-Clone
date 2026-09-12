"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCreator } from "@/lib/auth";
import { COLLAB_STATUS, daysFromNow } from "@/lib/booking";
import { db } from "@/lib/db";

export type ApplyState = {
  error?: string;
  ok?: boolean;
};

export async function applyToCampaign(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const current = await getCurrentCreator();
  if (!current) {
    return { error: "You need to log in as a creator." };
  }

  const campaignId = String(formData.get("campaignId") ?? "");
  if (!campaignId) {
    return { error: "Missing campaign." };
  }

  const campaign = await db.campaign.findFirst({
    where: { id: campaignId, status: "active" },
    include: { workspace: true },
  });
  if (!campaign) {
    return { error: "That campaign is not open." };
  }

  const existingApp = await db.campaignApplication.findUnique({
    where: {
      campaignId_creatorId: {
        campaignId,
        creatorId: current.creator.id,
      },
    },
  });
  if (existingApp) {
    return { error: "You already applied to this campaign." };
  }

  const existingCollab = await db.collaboration.findFirst({
    where: {
      campaignId,
      creatorId: current.creator.id,
      workspaceId: campaign.workspaceId,
    },
  });
  if (existingCollab) {
    return { error: "You already have a collaboration on this campaign." };
  }

  await db.$transaction(async (tx) => {
    await tx.campaignApplication.create({
      data: {
        campaignId,
        creatorId: current.creator.id,
        status: "pending",
      },
    });

    const collaboration = await tx.collaboration.create({
      data: {
        workspaceId: campaign.workspaceId,
        creatorId: current.creator.id,
        campaignId,
        format: "single_post",
        listedPriceCents: current.creator.postCostCents,
        agreedPriceCents: current.creator.postCostCents,
        status: COLLAB_STATUS.invitationReceived,
        nextAction: "Brand to review application",
        dueDate: daysFromNow(21),
      },
    });

    await tx.messageThread.create({
      data: {
        workspaceId: campaign.workspaceId,
        creatorId: current.creator.id,
        collaborationId: collaboration.id,
        isSystem: false,
        title: current.creator.name,
        messages: {
          create: {
            sender: "system",
            body: `${current.creator.name} applied to “${campaign.title}”. Waiting for ${campaign.workspace.name} to accept or decline.`,
          },
        },
      },
    });
  });

  revalidatePath("/creator/opportunities");
  revalidatePath("/creator/collaborations");
  revalidatePath("/creator/messages");
  revalidatePath("/brand/collaborations");
  revalidatePath("/brand/messages");
  return { ok: true };
}
