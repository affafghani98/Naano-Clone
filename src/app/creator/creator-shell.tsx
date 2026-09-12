import { PageChat } from "../_components/page-chat";
import type { NotificationItem } from "../_components/notifications-menu";
import { CreatorSidebar } from "./creator-sidebar";
import { CreatorTopBar } from "./creator-top-bar";

type Props = {
  userName: string;
  notifications: NotificationItem[];
  children: React.ReactNode;
};

export function CreatorShell({ userName, notifications, children }: Props) {
  return (
    <div className="flex min-h-screen bg-[#f7f5f2]">
      <CreatorSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <CreatorTopBar userName={userName} notifications={notifications} />
        <main className="flex-1 px-8 py-8">{children}</main>
        <PageChat />
      </div>
    </div>
  );
}
