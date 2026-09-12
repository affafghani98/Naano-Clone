import { PageChat } from "../_components/page-chat";
import type { NotificationItem } from "../_components/notifications-menu";
import { BrandSidebar } from "./brand-sidebar";
import { BrandTopBar } from "./brand-top-bar";
import type { WorkspaceOption } from "./workspace-switcher";

type Props = {
  userName: string;
  currentWorkspaceId: string;
  workspaces: WorkspaceOption[];
  walletBalanceCents: number;
  notifications: NotificationItem[];
  children: React.ReactNode;
};

export function BrandShell({
  userName,
  currentWorkspaceId,
  workspaces,
  walletBalanceCents,
  notifications,
  children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-[#f7f5f2]">
      <BrandSidebar
        currentWorkspaceId={currentWorkspaceId}
        workspaces={workspaces}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <BrandTopBar
          userName={userName}
          walletBalanceCents={walletBalanceCents}
          notifications={notifications}
        />
        <main className="flex-1 px-8 py-8">{children}</main>
        <PageChat />
      </div>
    </div>
  );
}
