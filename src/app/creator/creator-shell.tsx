import { CreatorSidebar } from "./creator-sidebar";
import { CreatorTopBar } from "./creator-top-bar";

type Props = {
  userName: string;
  canSwitchToBrand?: boolean;
  children: React.ReactNode;
};

export function CreatorShell({
  userName,
  canSwitchToBrand = false,
  children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-[#f7f5f2]">
      <CreatorSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <CreatorTopBar
          userName={userName}
          canSwitchToBrand={canSwitchToBrand}
        />
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
