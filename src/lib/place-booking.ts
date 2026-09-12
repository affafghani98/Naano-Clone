import type { Prisma } from "@prisma/client";
import {
  COLLAB_STATUS,
  daysFromNow,
  formatLabel,
  insufficientWalletMessage,
  isBookingFormat,
  isPastDateOnly,
  listedPriceCents,
  parseDateOnly,
  resolveChargeCents,
  type BookingFormat,
  type BookingMode,
} from "./booking";
import { formatEuro } from "./money";
import { notifyUsers } from "./notifications";

export type PlaceBookingInput = {
  workspaceId: string;
  creatorId: string;
  format: BookingFormat;
  mode: BookingMode;
  offerCents?: number;
  dueDate?: string;
  campaignId?: string | null;
  approveBeforePublish?: boolean;
};

export type PlaceBookingResult =
  | { ok: true; collaborationId: string; chargeCents: number }
  | { ok: false; error: string };

export async function placeBooking(
  tx: Prisma.TransactionClient,
  input: PlaceBookingInput,
): Promise<PlaceBookingResult> {
  if (!isBookingFormat(input.format)) {
    return { ok: false, error: "Choose a booking format." };
  }

  const creator = await tx.creator.findUnique({
    where: { id: input.creatorId },
  });
  if (!creator) {
    return { ok: false, error: "That creator is not available." };
  }

  const listedCents = listedPriceCents(creator, input.format);
  const charge = resolveChargeCents({
    mode: input.mode,
    listedCents,
    offerCents: input.offerCents,
  });
  if (!charge.ok) {
    return charge;
  }

  let dueDate = input.dueDate ? parseDateOnly(input.dueDate) : null;
  if (input.mode === "offer") {
    if (!input.dueDate || !dueDate) {
      return { ok: false, error: "Choose a post-by date." };
    }
    if (isPastDateOnly(input.dueDate)) {
      return { ok: false, error: "The post-by date cannot be in the past." };
    }
  } else {
    dueDate = dueDate ?? daysFromNow(14);
  }

  let campaignId: string | null = null;
  if (input.campaignId) {
    const campaign = await tx.campaign.findFirst({
      where: { id: input.campaignId, workspaceId: input.workspaceId },
    });
    if (!campaign) {
      return { ok: false, error: "That campaign brief is not available." };
    }
    campaignId = campaign.id;
  }

  const workspace = await tx.workspace.findUnique({
    where: { id: input.workspaceId },
  });
  if (!workspace) {
    return { ok: false, error: "Workspace not found." };
  }
  if (workspace.walletBalanceCents < charge.chargeCents) {
    return {
      ok: false,
      error: insufficientWalletMessage(
        workspace.walletBalanceCents,
        charge.chargeCents,
      ),
    };
  }

  const debited = await tx.workspace.updateMany({
    where: {
      id: input.workspaceId,
      walletBalanceCents: { gte: charge.chargeCents },
    },
    data: { walletBalanceCents: { decrement: charge.chargeCents } },
  });
  if (debited.count !== 1) {
    return {
      ok: false,
      error: insufficientWalletMessage(
        workspace.walletBalanceCents,
        charge.chargeCents,
      ),
    };
  }

  const collaboration = await tx.collaboration.create({
    data: {
      workspaceId: input.workspaceId,
      creatorId: creator.id,
      campaignId,
      format: input.format,
      listedPriceCents: listedCents,
      agreedPriceCents: charge.chargeCents,
      status: COLLAB_STATUS.invitationSent,
      nextAction: "Waiting for creator to accept (48h)",
      dueDate,
      approveBeforePublish: Boolean(input.approveBeforePublish),
    },
  });

  const kind = input.mode === "offer" ? "Offer" : "Booking";
  await tx.ledgerEntry.create({
    data: {
      workspaceId: input.workspaceId,
      type: "booking",
      amountCents: -charge.chargeCents,
      description: `${kind} · ${creator.name} · ${formatLabel(input.format)}`,
      collaborationId: collaboration.id,
    },
  });

  await tx.messageThread.create({
    data: {
      workspaceId: input.workspaceId,
      creatorId: creator.id,
      collaborationId: collaboration.id,
      isSystem: false,
      title: creator.name,
      messages: {
        create: {
          sender: "system",
          body:
            input.mode === "offer"
              ? `Offer sent to ${creator.name} for ${formatLabel(input.format)}. Waiting for them to accept or decline within 48 hours.`
              : `Booking sent to ${creator.name} for ${formatLabel(input.format)}. Waiting for them to accept or decline within 48 hours.`,
        },
      },
    },
  });

  const profile = await tx.creatorProfile.findUnique({
    where: { creatorId: creator.id },
  });
  if (profile) {
    await notifyUsers(tx, {
      userIds: [profile.userId],
      title: input.mode === "offer" ? "New offer" : "New booking",
      body: `${workspace.name} sent a ${input.mode === "offer" ? "offer" : "booking"} for ${formatLabel(input.format)} (${formatEuro(charge.chargeCents)}).`,
      href: "/creator/collaborations",
    });
  }

  return {
    ok: true,
    collaborationId: collaboration.id,
    chargeCents: charge.chargeCents,
  };
}

export function bookingSuccessNote(mode: BookingMode) {
  const verb = mode === "offer" ? "Offer sent" : "Booking sent";
  return `${verb}. The creator has 48 hours to accept or decline.`;
}
