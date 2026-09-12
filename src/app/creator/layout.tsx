import { redirect } from "next/navigation";
import { requireCreator } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreatorShell } from "./creator-shell";

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await requireCreator();
  if (!current.profile.onboardingComplete) {
    redirect("/onboarding");
  }

  const notifications = await db.notification.findMany({
    where: { userId: current.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <CreatorShell
      userName={current.user.name}
      notifications={notifications.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        href: item.href,
        createdAt: item.createdAt.toISOString(),
        readAt: item.readAt?.toISOString() ?? null,
      }))}
    >
      {children}
    </CreatorShell>
  );
}
