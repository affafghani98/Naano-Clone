"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCreator } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatEuro } from "@/lib/money";

export type WithdrawState = {
  error?: string;
  ok?: boolean;
};

export async function withdrawCreatorEarnings(
  _prev: WithdrawState,
  formData: FormData,
): Promise<WithdrawState> {
  const current = await getCurrentCreator();
  if (!current) {
    return { error: "You need to log in as a creator." };
  }

  const raw = String(formData.get("amountEuro") ?? "").trim();
  const euros = Number(raw);
  if (!Number.isFinite(euros) || euros <= 0) {
    return { error: "Enter a withdrawal amount greater than zero." };
  }
  const amountCents = Math.round(euros * 100);
  if (amountCents > current.profile.walletBalanceCents) {
    return {
      error: `Available balance is ${formatEuro(current.profile.walletBalanceCents)}.`,
    };
  }

  const updated = await db.$transaction(async (tx) => {
    const result = await tx.creatorProfile.updateMany({
      where: {
        id: current.profile.id,
        walletBalanceCents: { gte: amountCents },
      },
      data: { walletBalanceCents: { decrement: amountCents } },
    });
    if (result.count !== 1) {
      return false;
    }
    await tx.creatorLedgerEntry.create({
      data: {
        creatorProfileId: current.profile.id,
        type: "withdraw",
        amountCents: -amountCents,
        description: "Demo withdraw (no bank transfer)",
      },
    });
    return true;
  });

  if (!updated) {
    return { error: "Not enough available balance." };
  }

  revalidatePath("/creator/earnings");
  revalidatePath("/creator");
  return { ok: true };
}
