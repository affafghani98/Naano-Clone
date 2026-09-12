import { BrandSidebar } from "./brand-sidebar";
import { BrandTopBar } from "./brand-top-bar";
import { ChatStub } from "./chat-stub";
import type { WorkspaceOption } from "./workspace-switcher";

type Props = {
  userName: string;
  currentWorkspaceId: string;
  workspaces: WorkspaceOption[];
  walletBalanceCents: number;
  children: React.ReactNode;
};

export function BrandShell({
  userName,
  currentWorkspaceId,
  workspaces,
  walletBalanceCents,
  children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-[#f7f5f2]">
      <BrandSidebar
        currentWorkspaceId={currentWorkspaceId}
        workspaces={workspaces}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <BrandTopBar userName={userName} walletBalanceCents={walletBalanceCents} />
        <main className="flex-1 px-8 py-8">{children}</main>
        <ChatStub />
      </div>
    </div>
  );
}
