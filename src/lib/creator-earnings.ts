import type { Prisma } from "@prisma/client";
import { formatEuro } from "./money";

/** Credit creator available balance when a collaboration becomes paid/active. */
export async function creditCreatorEarning(
  tx: Prisma.TransactionClient,
  input: {
    creatorId: string;
    amountCents: number;
    collaborationId: string;
    description: string;
  },
) {
  if (input.amountCents <= 0) {
    return;
  }
  const profile = await tx.creatorProfile.findUnique({
    where: { creatorId: input.creatorId },
  });
  if (!profile) {
    return;
  }
  await tx.creatorProfile.update({
    where: { id: profile.id },
    data: { walletBalanceCents: { increment: input.amountCents } },
  });
  await tx.creatorLedgerEntry.create({
    data: {
      creatorProfileId: profile.id,
      type: "earning",
      amountCents: input.amountCents,
      description: input.description,
      collaborationId: input.collaborationId,
    },
  });
}

export function earningNote(paidCount: number, averageCents: number) {
  const avg = paidCount > 0 ? formatEuro(averageCents) : formatEuro(0);
  return `${paidCount} paid collaborations · ${avg} average`;
}
