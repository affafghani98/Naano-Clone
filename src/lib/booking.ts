import { formatEuro } from "./money";

export const BOOKING_FORMATS = ["single_post", "bundle_5"] as const;
export type BookingFormat = (typeof BOOKING_FORMATS)[number];
export type BookingMode = "book" | "offer";

export const COLLAB_STATUS = {
  invitationSent: "invitation_sent",
  invitationReceived: "invitation_received",
  active: "active",
  todo: "todo",
  completed: "completed",
  declined: "declined",
} as const;

export const COLLAB_STATUS_LABELS: Record<string, string> = {
  invitation_sent: "Invitation sent",
  invitation_received: "Invitation received",
  active: "Active",
  todo: "To do",
  completed: "Completed",
  declined: "Declined",
};

export const DISCOUNT_TIERS = [10, 20, 30] as const;

export function isBookingFormat(value: string): value is BookingFormat {
  return value === "single_post" || value === "bundle_5";
}

export function formatLabel(format: string) {
  return format === "bundle_5" ? "Bundle · 5" : "Single post";
}

export function listedPriceCents(
  creator: { postCostCents: number; bundleCostCents: number },
  format: BookingFormat,
) {
  return format === "bundle_5" ? creator.bundleCostCents : creator.postCostCents;
}

export function applyDiscount(listedCents: number, percent: number) {
  return Math.round((listedCents * (100 - percent)) / 100);
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function isPastDateOnly(value: string) {
  const parsed = parseDateOnly(value);
  const today = parseDateOnly(toDateInputValue(new Date()));
  if (!parsed || !today) {
    return true;
  }
  return parsed < today;
}

export function resolveChargeCents(input: {
  mode: BookingMode;
  listedCents: number;
  offerCents?: number;
}): { ok: true; chargeCents: number } | { ok: false; error: string } {
  if (input.listedCents <= 0) {
    return { ok: false, error: "This format does not have a listed rate." };
  }

  if (input.mode === "book") {
    return { ok: true, chargeCents: input.listedCents };
  }

  const offerCents = input.offerCents;
  if (offerCents == null || !Number.isInteger(offerCents) || offerCents <= 0) {
    return { ok: false, error: "Enter an offer greater than €0." };
  }
  if (offerCents > input.listedCents) {
    return {
      ok: false,
      error: "Your offer must be at or below the listed rate.",
    };
  }
  return { ok: true, chargeCents: offerCents };
}

export function insufficientWalletMessage(
  balanceCents: number,
  chargeCents: number,
) {
  const shortfall = chargeCents - balanceCents;
  return `Insufficient wallet balance. You have ${formatEuro(balanceCents)} and this booking needs ${formatEuro(chargeCents)}. Top up at least ${formatEuro(shortfall)} before booking.`;
}
