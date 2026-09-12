"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCreator, getCurrentUser } from "@/lib/auth";
import { COLLAB_STATUS, insufficientWalletMessage } from "@/lib/booking";
import { creditCreatorEarning } from "@/lib/creator-earnings";
import { db } from "@/lib/db";
import { formatEuro } from "@/lib/money";
import { notifyUsers, workspaceMemberUserIds } from "@/lib/notifications";

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
  revalidatePath("/creator/earnings");
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
    include: {
      creator: { include: { profile: true } },
      campaign: true,
    },
  });
  if (!collaboration) {
    return { error: "Application not found." };
  }

  if (decision === "accept") {
    const chargeCents = collaboration.agreedPriceCents;
    if (current.workspace.walletBalanceCents < chargeCents) {
      return {
        error: insufficientWalletMessage(
          current.workspace.walletBalanceCents,
          chargeCents,
        ),
      };
    }

    try {
      await db.$transaction(async (tx) => {
        const debited = await tx.workspace.updateMany({
          where: {
            id: current.workspace.id,
            walletBalanceCents: { gte: chargeCents },
          },
          data: { walletBalanceCents: { decrement: chargeCents } },
        });
        if (debited.count !== 1) {
          throw new Error("INSUFFICIENT");
        }

        await tx.ledgerEntry.create({
          data: {
            workspaceId: current.workspace.id,
            type: "booking",
            amountCents: -chargeCents,
            description: `Accepted application · ${collaboration.creator.name}`,
            collaborationId: collaboration.id,
          },
        });

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

        await creditCreatorEarning(tx, {
          creatorId: collaboration.creatorId,
          amountCents: chargeCents,
          collaborationId: collaboration.id,
          description: `Earning · ${current.workspace.name}${collaboration.campaign ? ` · ${collaboration.campaign.title}` : ""}`,
        });

        const thread = await tx.messageThread.findFirst({
          where: { collaborationId: collaboration.id },
        });
        if (thread) {
          await tx.message.create({
            data: {
              threadId: thread.id,
              sender: "system",
              body: `${current.workspace.name} accepted ${collaboration.creator.name}'s application${collaboration.campaign ? ` to "${collaboration.campaign.title}"` : ""}. Collaboration is now active. ${formatEuro(chargeCents)} moved to the creator wallet.`,
            },
          });
        }

        if (collaboration.creator.profile) {
          await notifyUsers(tx, {
            userIds: [collaboration.creator.profile.userId],
            title: "Application accepted",
            body: `${current.workspace.name} accepted your application${collaboration.campaign ? ` for ${collaboration.campaign.title}` : ""}. ${formatEuro(chargeCents)} is available to withdraw.`,
            href: "/creator/collaborations",
          });
        }
      });
    } catch {
      return {
        error: insufficientWalletMessage(
          current.workspace.walletBalanceCents,
          chargeCents,
        ),
      };
    }
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
      if (collaboration.creator.profile) {
        await notifyUsers(tx, {
          userIds: [collaboration.creator.profile.userId],
          title: "Application declined",
          body: `${current.workspace.name} declined your application${collaboration.campaign ? ` for ${collaboration.campaign.title}` : ""}.`,
          href: "/creator/opportunities",
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

      await creditCreatorEarning(tx, {
        creatorId: current.creator.id,
        amountCents: collaboration.agreedPriceCents,
        collaborationId: collaboration.id,
        description: `Earning · ${collaboration.workspace.name}`,
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

      const brandUsers = await workspaceMemberUserIds(tx, collaboration.workspaceId);
      await notifyUsers(tx, {
        userIds: brandUsers,
        title: "Booking accepted",
        body: `${current.creator.name} accepted your booking (${formatEuro(collaboration.agreedPriceCents)}).`,
        href: "/brand/collaborations",
      });
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

      const brandUsers = await workspaceMemberUserIds(tx, collaboration.workspaceId);
      await notifyUsers(tx, {
        userIds: brandUsers,
        title: "Booking declined",
        body: `${current.creator.name} declined your booking. ${formatEuro(collaboration.agreedPriceCents)} was refunded to your wallet.`,
        href: "/brand/billing",
      });
    });
  }

  revalidateBothSides();
  return { ok: true };
}
