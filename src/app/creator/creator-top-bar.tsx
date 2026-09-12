"use client";

import { useState } from "react";
import {
  addBrandWorkspaceToAccount,
  logout,
  switchAccountRole,
} from "../actions/auth";

type Props = {
  userName: string;
  canSwitchToBrand?: boolean;
};

export function CreatorTopBar({
  userName,
  canSwitchToBrand = false,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-end gap-3 border-b border-neutral-200 bg-white px-6 py-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold"
          aria-label="Profile menu"
        >
          {userName.slice(0, 1).toUpperCase()}
        </button>
        {open ? (
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-neutral-200 bg-white p-2 text-sm shadow-sm">
            <p className="px-2 py-1 text-xs text-neutral-500">{userName}</p>
            {canSwitchToBrand ? (
              <form action={switchAccountRole}>
                <input type="hidden" name="role" value="brand" />
                <button
                  type="submit"
                  className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-neutral-50"
                >
                  Switch to brand
                </button>
              </form>
            ) : (
              <form action={addBrandWorkspaceToAccount}>
                <button
                  type="submit"
                  className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-neutral-50"
                >
                  Add brand workspace
                </button>
              </form>
            )}
            <form action={logout}>
              <button
                type="submit"
                className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-neutral-50"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}
