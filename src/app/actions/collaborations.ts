"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCreator, getCurrentUser } from "@/lib/auth";
import { COLLAB_STATUS } from "@/lib/booking";
import { db } from "@/lib/db";

export type CollabActionState = {
  error?: string;
  ok?: boolean;
};

function revalidateBothSides() {
  revalidatePath("/brand/collaborations");
  revalidatePath("/brand/messages");
  revalidatePath("/brand");
  revalidatePath("/brand/billing");
  revalidatePath("/creator/collaborations");
  revalidatePath("/creator/messages");
  revalidatePath("/creator");
  revalidatePath("/creator/opportunities");
}

/** Brand accepts a creator application (invitation_received → active). */
export async function brandRespondToApplication(
  _prev: CollabActionState,
  formData: FormData,
): Promise<CollabActionState> {
  const current = await getCurrentUser();
  if (!current) {
    return { error: "You need to log in." };
  }

  const collaborationId = String(formData.get("collaborationId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!collaborationId || (decision !== "accept" && decision !== "decline")) {
    return { error: "Missing collaboration or decision." };
  }

  const collaboration = await db.collaboration.findFirst({
    where: {
      id: collaborationId,
      workspaceId: current.workspace.id,
      status: COLLAB_STATUS.invitationReceived,
    },
    include: { creator: true, campaign: true },
  });
  if (!collaboration) {
    return { error: "Application not found." };
  }

  if (decision === "accept") {
    await db.$transaction(async (tx) => {
      await tx.collaboration.update({
        where: { id: collaboration.id },
        data: {
          status: COLLAB_STATUS.active,
          nextAction: "Creator to draft and publish post",
        },
      });
      if (collaboration.campaignId) {
        await tx.campaignApplication.updateMany({
          where: {
            campaignId: collaboration.campaignId,
            creatorId: collaboration.creatorId,
          },
          data: { status: "accepted" },
        });
      }
      const thread = await tx.messageThread.findFirst({
        where: { collaborationId: collaboration.id },
      });
      if (thread) {
        await tx.message.create({
          data: {
            threadId: thread.id,
            sender: "system",
            body: `${current.workspace.name} accepted ${collaboration.creator.name}'s application${collaboration.campaign ? ` to “${collaboration.campaign.title}”` : ""}. Collaboration is now active.`,
          },
        });
      }
    });
  } else {
    await db.$transaction(async (tx) => {
      await tx.collaboration.update({
        where: { id: collaboration.id },
        data: {
          status: COLLAB_STATUS.declined,
          nextAction: null,
        },
      });
      if (collaboration.campaignId) {
        await tx.campaignApplication.updateMany({
          where: {
            campaignId: collaboration.campaignId,
            creatorId: collaboration.creatorId,
          },
          data: { status: "declined" },
        });
      }
      const thread = await tx.messageThread.findFirst({
        where: { collaborationId: collaboration.id },
      });
      if (thread) {
        await tx.message.create({
          data: {
            threadId: thread.id,
            sender: "system",
            body: `${current.workspace.name} declined ${collaboration.creator.name}'s application.`,
          },
        });
      }
    });
  }

  revalidateBothSides();
  return { ok: true };
}

/** Creator accepts or declines a brand booking/offer (invitation_sent → active/declined). */
export async function creatorRespondToBooking(
  _prev: CollabActionState,
  formData: FormData,
): Promise<CollabActionState> {
  const current = await getCurrentCreator();
  if (!current) {
    return { error: "You need to log in as a creator." };
  }

  const collaborationId = String(formData.get("collaborationId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!collaborationId || (decision !== "accept" && decision !== "decline")) {
    return { error: "Missing collaboration or decision." };
  }

  const collaboration = await db.collaboration.findFirst({
    where: {
      id: collaborationId,
      creatorId: current.creator.id,
      status: COLLAB_STATUS.invitationSent,
    },
    include: { workspace: true },
  });
  if (!collaboration) {
    return { error: "Booking not found." };
  }

  if (decision === "accept") {
    await db.$transaction(async (tx) => {
      await tx.collaboration.update({
        where: { id: collaboration.id },
        data: {
          status: COLLAB_STATUS.active,
          nextAction: "Draft and publish sponsored post",
        },
      });
      const thread = await tx.messageThread.findFirst({
        where: { collaborationId: collaboration.id },
      });
      if (thread) {
        await tx.message.create({
          data: {
            threadId: thread.id,
            sender: "system",
            body: `${current.creator.name} accepted the booking with ${collaboration.workspace.name}. Collaboration is now active.`,
          },
        });
      }
    });
  } else {
    await db.$transaction(async (tx) => {
      await tx.collaboration.update({
        where: { id: collaboration.id },
        data: {
          status: COLLAB_STATUS.declined,
          nextAction: null,
        },
      });

      // Refund wallet for declined bookings/offers.
      await tx.workspace.update({
        where: { id: collaboration.workspaceId },
        data: { walletBalanceCents: { increment: collaboration.agreedPriceCents } },
      });
      await tx.ledgerEntry.create({
        data: {
          workspaceId: collaboration.workspaceId,
          type: "refund",
          amountCents: collaboration.agreedPriceCents,
          description: `Refund · ${current.creator.name} declined booking`,
          collaborationId: collaboration.id,
        },
      });

      const thread = await tx.messageThread.findFirst({
        where: { collaborationId: collaboration.id },
      });
      if (thread) {
        await tx.message.create({
          data: {
            threadId: thread.id,
            sender: "system",
            body: `${current.creator.name} declined the booking. The brand wallet was refunded.`,
          },
        });
      }
    });
  }

  revalidateBothSides();
  return { ok: true };
}
