import { formatEuro } from "./money";

export type OverviewStat = {
  label: string;
  value: string;
};

export type OverviewTodo = {
  id: string;
  label: string;
  href: string;
  state: "blocked" | "suggested" | "done";
  external?: boolean;
};

export function overviewStats(input: {
  creatorsActivated: number;
  postsPublished: number;
  profilesEngaged: number;
  impressions: number;
}): OverviewStat[] {
  return [
    { label: "Creators activated", value: String(input.creatorsActivated) },
    { label: "Posts published", value: String(input.postsPublished) },
    { label: "Profiles engaged", value: String(input.profilesEngaged) },
    { label: "Impressions", value: String(input.impressions) },
  ];
}

export function overviewTodos(input: {
  walletBalanceCents: number;
  collaborationCount: number;
}): OverviewTodo[] {
  const walletDone = input.walletBalanceCents > 0;
  return [
    {
      id: "top-up",
      label: walletDone
        ? `Wallet funded (${formatEuro(input.walletBalanceCents)})`
        : "Top up wallet",
      href: "/brand/billing",
      state: walletDone ? "done" : "blocked",
    },
    {
      id: "book-call",
      label: "Book a call",
      href: "https://cal.com",
      state: "suggested",
      external: true,
    },
    {
      id: "find-creators",
      label:
        input.collaborationCount === 0
          ? "Find new creators"
          : "Find more creators",
      href: "/brand/creators",
      state: "suggested",
    },
  ];
}
