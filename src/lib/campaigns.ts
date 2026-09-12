export const CAMPAIGN_STATUS = {
  draft: "draft",
  active: "active",
  completed: "completed",
} as const;

export type CampaignStatus =
  (typeof CAMPAIGN_STATUS)[keyof typeof CAMPAIGN_STATUS];

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
};

export type CampaignListItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  creators: number;
  published: number;
  committedBudgetCents: number;
};

export function isCampaignStatus(value: string): value is CampaignStatus {
  return (
    value === CAMPAIGN_STATUS.draft ||
    value === CAMPAIGN_STATUS.active ||
    value === CAMPAIGN_STATUS.completed
  );
}
