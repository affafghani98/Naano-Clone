"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isBookingFormat, type BookingFormat, type BookingMode } from "@/lib/booking";
import { placeBooking } from "@/lib/place-booking";

export type CreateBookingInput = {
  creatorId: string;
  format: BookingFormat;
  mode: BookingMode;
  offerCents?: number;
  dueDate?: string;
  campaignId?: string | null;
  approveBeforePublish?: boolean;
};

export type CreateBookingResult =
  | { ok: true; kind: BookingMode }
  | { ok: false; error: string };

export async function createBooking(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const current = await getCurrentUser();
  if (!current) {
    return { ok: false, error: "You need to log in." };
  }
  if (!isBookingFormat(input.format)) {
    return { ok: false, error: "Choose a booking format." };
  }
  if (input.mode !== "book" && input.mode !== "offer") {
    return { ok: false, error: "Choose Book or Negotiate." };
  }

  const result = await db.$transaction((tx) =>
    placeBooking(tx, {
      workspaceId: current.workspace.id,
      creatorId: input.creatorId,
      format: input.format,
      mode: input.mode,
      offerCents: input.offerCents,
      dueDate: input.dueDate,
      campaignId: input.campaignId,
      approveBeforePublish: input.approveBeforePublish,
    }),
  );

  if (!result.ok) {
    return result;
  }

  revalidatePath("/brand");
  revalidatePath("/brand/billing");
  revalidatePath("/brand/collaborations");
  revalidatePath("/brand/creators");
  revalidatePath("/brand/messages");
  revalidatePath("/brand/results");
  return { ok: true, kind: input.mode };
}
