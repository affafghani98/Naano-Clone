"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND_NAV } from "./nav";
import {
  WorkspaceSwitcher,
  type WorkspaceOption,
} from "./workspace-switcher";

export function BrandSidebar({
  currentWorkspaceId,
  workspaces,
}: {
  currentWorkspaceId: string;
  workspaces: WorkspaceOption[];
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-white px-4 py-5">
      <p className="px-2 text-lg font-semibold tracking-tight">Naano</p>
      <WorkspaceSwitcher
        currentWorkspaceId={currentWorkspaceId}
        workspaces={workspaces}
      />
      <nav className="mt-6 space-y-1">
        {BRAND_NAV.map((item) => {
          const active =
            item.href === "/brand"
              ? pathname === "/brand"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm ${
                active
                  ? "bg-neutral-950 text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
