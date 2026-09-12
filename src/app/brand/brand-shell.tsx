import { BrandSidebar } from "./brand-sidebar";
import { BrandTopBar } from "./brand-top-bar";
import { ChatStub } from "./chat-stub";

type Props = {
  userName: string;
  workspaceName: string;
  walletBalanceCents: number;
  children: React.ReactNode;
};

export function BrandShell({
  userName,
  workspaceName,
  walletBalanceCents,
  children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-[#f7f5f2]">
      <BrandSidebar workspaceName={workspaceName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <BrandTopBar userName={userName} walletBalanceCents={walletBalanceCents} />
        <main className="flex-1 px-8 py-8">{children}</main>
        <ChatStub />
      </div>
    </div>
  );
}
