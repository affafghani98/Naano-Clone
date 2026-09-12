"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatEuro } from "@/lib/money";

export type BillingState = {
  error?: string;
};

export async function addBudget(
  _prev: BillingState,
  formData: FormData,
): Promise<BillingState> {
  const current = await getCurrentUser();
  if (!current) {
    return { error: "You need to log in." };
  }

  const raw = String(formData.get("amountEuros") ?? "").trim();
  const euros = Number(raw);
  if (!Number.isFinite(euros) || euros <= 0) {
    return { error: "Enter a top-up amount greater than 0." };
  }
  if (euros > 1_000_000) {
    return { error: "That top-up is larger than this demo allows." };
  }

  const amountCents = Math.round(euros * 100);

  await db.$transaction(async (tx) => {
    await tx.workspace.update({
      where: { id: current.workspace.id },
      data: { walletBalanceCents: { increment: amountCents } },
    });
    await tx.ledgerEntry.create({
      data: {
        workspaceId: current.workspace.id,
        type: "topup",
        amountCents,
        description: `Wallet top-up ${formatEuro(amountCents)}`,
      },
    });
  });

  revalidatePath("/brand");
  revalidatePath("/brand/billing");
  revalidatePath("/brand/collaborations");
  return {};
}
