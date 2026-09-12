"use client";

import { useActionState, useState } from "react";
import {
  createWorkspace,
  switchWorkspace,
} from "../actions/workspace";

export type WorkspaceOption = {
  id: string;
  name: string;
  onboardingComplete: boolean;
};

export function WorkspaceSwitcher({
  currentWorkspaceId,
  workspaces,
}: {
  currentWorkspaceId: string;
  workspaces: WorkspaceOption[];
}) {
  const [open, setOpen] = useState(false);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");
  const current =
    workspaces.find((item) => item.id === currentWorkspaceId) ?? workspaces[0];

  return (
    <div className="relative mt-4">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setNaming(false);
        }}
        className="flex w-full items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="block text-[11px] uppercase tracking-wide text-neutral-500">
            Workspace
          </span>
          <span className="block truncate text-sm font-medium">
            {current?.name ?? "Workspace"}
          </span>
        </span>
        <span className="text-xs text-neutral-400" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-30 mt-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
          <ul className="space-y-1">
            {workspaces.map((workspace) => (
              <li key={workspace.id}>
                <form action={switchWorkspace}>
                  <input type="hidden" name="workspaceId" value={workspace.id} />
                  <button
                    type="submit"
                    className={`w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-neutral-50 ${
                      workspace.id === currentWorkspaceId
                        ? "bg-neutral-100 font-medium"
                        : ""
                    }`}
                  >
                    {workspace.name}
                    {!workspace.onboardingComplete ? (
                      <span className="ml-1 text-xs text-neutral-400">
                        (setup)
                      </span>
                    ) : null}
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <div className="mt-1 border-t border-neutral-100 pt-1">
            {naming ? (
              <form action={createWorkspace} className="space-y-2 p-1">
                <input
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="New brand name"
                  className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-neutral-950 px-2 py-1.5 text-sm font-medium text-white"
                >
                  Create workspace
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setNaming(true)}
                className="w-full rounded-lg px-2 py-1.5 text-left text-sm font-medium hover:bg-neutral-50"
              >
                + Create new workspace
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
