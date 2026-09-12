import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookingSuccessNote } from "@/lib/place-booking";
import { CollaborationsView } from "./collaborations-view";

export default async function CollaborationsPage({
  searchParams,
}: {
  searchParams: Promise<{ booked?: string }>;
}) {
  const current = await requireUser();
  const { booked } = await searchParams;

  const rows = await db.collaboration.findMany({
    where: { workspaceId: current.workspace.id },
    include: { creator: true, campaign: true },
    orderBy: { updatedAt: "desc" },
  });

  const notice =
    booked === "book"
      ? bookingSuccessNote("book")
      : booked === "offer"
        ? bookingSuccessNote("offer")
        : null;

  return (
    <CollaborationsView
      notice={notice}
      rows={rows.map((row) => ({
        id: row.id,
        creatorName: row.creator.name,
        creatorPhotoUrl: row.creator.photoUrl,
        campaignTitle: row.campaign?.title ?? null,
        status: row.status,
        nextAction: row.nextAction,
        dueDate: row.dueDate?.toISOString() ?? null,
        amountCents: row.agreedPriceCents,
        updatedAt: row.updatedAt.toISOString(),
      }))}
    />
  );
}
