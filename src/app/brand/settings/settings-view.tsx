"use client";

import { useActionState, useState } from "react";
import {
  inviteColleague,
  saveAudienceSettings,
  saveWorkspaceProfile,
  type SettingsState,
} from "../../actions/workspace";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "audience", label: "Audience" },
  { id: "team", label: "Team & access" },
  { id: "integrations", label: "Integrations" },
] as const;

const PROFILE_INDUSTRIES = [
  "SaaS",
  "B2B",
  "Marketing",
  "Fintech",
  "Healthcare",
  "Other",
] as const;

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000+",
] as const;

const AUDIENCE_INDUSTRIES = [
  "SaaS",
  "Fintech",
  "Marketing",
  "Healthcare",
  "E-commerce",
  "Cybersecurity",
  "HR Tech",
  "Other",
] as const;

const REGIONS = [
  "Europe",
  "North America",
  "Latin America",
  "Asia",
  "Africa",
  "Oceania",
  "Middle East",
  "Worldwide",
] as const;

export type SettingsProfile = {
  name: string;
  websiteUrl: string;
  valueProposition: string;
  industry: string;
  companySize: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  isYou: boolean;
};

export type TeamInvite = {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
};

export type WorkspaceChoice = {
  id: string;
  name: string;
};

export function SettingsView({
  initialTab,
  profile,
  targetIndustries,
  targetRegions,
  members,
  invites,
  workspaces,
  currentWorkspaceId,
}: {
  initialTab: string;
  profile: SettingsProfile;
  targetIndustries: string[];
  targetRegions: string[];
  members: TeamMember[];
  invites: TeamInvite[];
  workspaces: WorkspaceChoice[];
  currentWorkspaceId: string;
}) {
  const tab = TABS.find((item) => item.id === initialTab)?.id ?? "profile";

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Naano workspace
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Manage your company profile and the audience you want to reach.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <nav className="space-y-1">
          {TABS.map((item) => (
            <a
              key={item.id}
              href={`/brand/settings?tab=${item.id}`}
              className={`block rounded-lg px-3 py-2 text-sm ${
                tab === item.id
                  ? "bg-neutral-950 font-medium text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div>
          {tab === "profile" ? <ProfilePanel profile={profile} /> : null}
          {tab === "audience" ? (
            <AudiencePanel
              industries={targetIndustries}
              regions={targetRegions}
            />
          ) : null}
          {tab === "team" ? (
            <TeamPanel
              members={members}
              invites={invites}
              workspaces={workspaces}
              currentWorkspaceId={currentWorkspaceId}
            />
          ) : null}
          {tab === "integrations" ? <IntegrationsPanel /> : null}
        </div>
      </div>
    </section>
  );
}

function ProfilePanel({ profile }: { profile: SettingsProfile }) {
  const [size, setSize] = useState(profile.companySize || "11-50");
  const [industry, setIndustry] = useState(profile.industry || "SaaS");
  const [state, formAction, pending] = useActionState(
    saveWorkspaceProfile,
    {} as SettingsState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="companySize" value={size} />
      <input type="hidden" name="industry" value={industry} />

      <article className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Company identity</h2>
        <div className="mt-4 grid gap-4">
          <label className="block space-y-1 text-sm">
            <span>Company name</span>
            <input
              name="name"
              defaultValue={profile.name}
              required
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Website</span>
            <input
              name="websiteUrl"
              type="url"
              defaultValue={profile.websiteUrl}
              placeholder="https://"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Tagline</span>
            <textarea
              name="valueProposition"
              defaultValue={profile.valueProposition}
              rows={3}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
            />
          </label>
        </div>
      </article>

      <article className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Sector & size</h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm text-neutral-600">Industry</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PROFILE_INDUSTRIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setIndustry(item)}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    industry === item
                      ? "bg-neutral-950 text-white"
                      : "border border-neutral-300"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-neutral-600">Company size</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {COMPANY_SIZES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSize(item)}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    size === item
                      ? "bg-neutral-950 text-white"
                      : "border border-neutral-300"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </article>

      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state.saved ? (
        <p className="text-sm text-emerald-700">Changes saved.</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function AudiencePanel({
  industries: initialIndustries,
  regions: initialRegions,
}: {
  industries: string[];
  regions: string[];
}) {
  const [industries, setIndustries] = useState(initialIndustries);
  const [regions, setRegions] = useState(initialRegions);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    saveAudienceSettings,
    {} as SettingsState,
  );

  function toggleRegion(region: string) {
    setRegions((current) =>
      current.includes(region)
        ? current.filter((item) => item !== region)
        : [...current, region],
    );
  }

  function addIndustry(industry: string) {
    setIndustries((current) =>
      current.includes(industry) ? current : [...current, industry],
    );
    setPickerOpen(false);
  }

  function removeIndustry(industry: string) {
    setIndustries((current) => current.filter((item) => item !== industry));
  }

  return (
    <form action={formAction} className="rounded-2xl border border-neutral-200 bg-white p-5">
      {industries.map((item) => (
        <input key={item} type="hidden" name="industries" value={item} />
      ))}
      {regions.map((item) => (
        <input key={item} type="hidden" name="regions" value={item} />
      ))}

      <h2 className="font-semibold">Target: ICP</h2>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Target industries</p>
          <p className="text-xs text-neutral-500">
            {industries.length} selected
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {industries.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => removeIndustry(item)}
              className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm"
            >
              {item} ×
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPickerOpen((open) => !open)}
            className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm"
          >
            + Add an industry
          </button>
        </div>
        {pickerOpen ? (
          <div className="mt-2 flex flex-wrap gap-2 rounded-xl border border-neutral-200 p-3">
            {AUDIENCE_INDUSTRIES.filter((item) => !industries.includes(item)).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => addIndustry(item)}
                  className="rounded-full border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-50"
                >
                  {item}
                </button>
              ),
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Target regions</p>
          <p className="text-xs text-neutral-500">{regions.length} selected</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => toggleRegion(region)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                regions.includes(region)
                  ? "bg-neutral-950 text-white"
                  : "border border-neutral-300"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {state.error ? (
        <p className="mt-4 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state.saved ? (
        <p className="mt-4 text-sm text-emerald-700">Audience saved.</p>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function TeamPanel({
  members,
  invites,
  workspaces,
  currentWorkspaceId,
}: {
  members: TeamMember[];
  invites: TeamInvite[];
  workspaces: WorkspaceChoice[];
  currentWorkspaceId: string;
}) {
  const [selected, setSelected] = useState<string[]>([currentWorkspaceId]);
  const [state, formAction, pending] = useActionState(
    inviteColleague,
    {} as SettingsState,
  );

  function toggleWorkspace(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-5">
      <div>
        <h2 className="text-xl font-semibold">Team & access</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Invite colleagues and review who can access this workspace.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="font-semibold">Invite a colleague</h3>
        <p className="mt-1 text-sm text-neutral-600">
          They&apos;ll receive a secure link that expires after 14 days.
        </p>

        <form action={formAction} className="mt-4 space-y-4">
          {selected.map((id) => (
            <input key={id} type="hidden" name="workspaceIds" value={id} />
          ))}

          <div>
            <p className="text-sm font-medium">Choose workspaces</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => toggleWorkspace(workspace.id)}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    selected.includes(workspace.id)
                      ? "bg-neutral-950 text-white"
                      : "border border-neutral-300 bg-white"
                  }`}
                >
                  {selected.includes(workspace.id) ? "✓ " : ""}
                  {workspace.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-56 flex-1 space-y-1 text-sm">
              <span>Work email</span>
              <input
                name="email"
                type="email"
                required
                placeholder="colleague@company.com"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={pending || selected.length === 0}
              className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Sending…" : "+ Send Invitation"}
            </button>
          </div>

          <p className="text-xs text-neutral-500">
            New users create their account from the private email link. Existing
            Naano users get access immediately. This demo stores the invite — it
            does not send email.
          </p>

          {state.error ? (
            <p className="text-sm text-red-700">{state.error}</p>
          ) : null}
          {state.message ? (
            <p className="text-sm text-emerald-700">{state.message}</p>
          ) : null}
        </form>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">People with access</h3>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
            {members.length} people
          </span>
        </div>
        <ul className="mt-3 space-y-2">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold">
                  {member.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-neutral-500">
                    {member.email}
                    {member.isYou ? " — You" : ""}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs capitalize">
                {member.role}
              </span>
            </li>
          ))}
          {invites.map((invite) => (
            <li
              key={invite.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-neutral-200 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">{invite.email}</p>
                <p className="text-xs text-neutral-500">
                  Invitation pending · expires{" "}
                  {new Date(invite.expiresAt).toLocaleDateString("en-GB")}
                </p>
              </div>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-900">
                Invited
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-neutral-500">
          Members receive administrator access. Only you, the owner, can invite
          or remove people.
        </p>
      </div>
    </div>
  );
}

function IntegrationsPanel() {
  const [copied, setCopied] = useState(false);
  const [pixelOpen, setPixelOpen] = useState(false);
  const mcpUrl = "https://naano.clone/api/mcp";

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(mcpUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          Use Naano from your AI assistant
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Search creators, build campaigns and manage collaborations from Claude,
          ChatGPT or any compatible MCP client.
        </p>
      </div>

      <article className="rounded-2xl bg-neutral-950 p-5 text-white">
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          Remote MCP endpoint
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <code className="rounded-lg bg-neutral-900 px-3 py-2 text-sm">
            {mcpUrl}
          </code>
          <button
            type="button"
            onClick={() => void copyUrl()}
            className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-neutral-950"
          >
            {copied ? "Copied" : "Copy MCP URL"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-300">
          <span className="rounded-full border border-neutral-700 px-2 py-0.5">
            STREAMABLE HTTP
          </span>
          <span className="rounded-full border border-neutral-700 px-2 py-0.5">
            SSE/REST 2.1
          </span>
          <span className="rounded-full border border-neutral-700 px-2 py-0.5">
            NO API key
          </span>
          <span className="rounded-full border border-emerald-700 px-2 py-0.5 text-emerald-300">
            ● ONLINE
          </span>
        </div>
      </article>

      <div>
        <h3 className="font-semibold">Choose your client</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[
            {
              title: "Claude",
              body: "Use Naano from Claude and Cowork.",
            },
            {
              title: "ChatGPT",
              body: "Use Naano from a custom ChatGPT app.",
            },
            {
              title: "Any MCP client",
              body: "Connect another OAuth-compatible client.",
            },
          ].map((client) => (
            <article
              key={client.title}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <h4 className="font-medium">{client.title}</h4>
              <p className="mt-1 text-sm text-neutral-600">{client.body}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-neutral-200 bg-white p-4">
          <h3 className="font-semibold">What it can review</h3>
          <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
            Read access
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-600">
            <li>Active workspace, wallet, and campaigns</li>
            <li>Available creators and marketplace filters</li>
            <li>Application and booking status</li>
          </ul>
        </article>
        <article className="rounded-2xl border border-neutral-200 bg-white p-4">
          <h3 className="font-semibold">Actions it can prepare</h3>
          <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
            Confirmation required
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-600">
            <li>Draft or launch campaigns</li>
            <li>Invite creators</li>
            <li>Review submitted content</li>
          </ul>
        </article>
      </div>

      <p className="text-xs text-neutral-500">
        The assistant only sees the active workspace. Every write action would
        require server confirmation. This rebuild shows the Integrations UI —
        the MCP server itself is not implemented.
      </p>

      <article className="rounded-2xl border border-neutral-200 bg-white">
        <button
          type="button"
          onClick={() => setPixelOpen((open) => !open)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="font-semibold">Pixel Naano</span>
          <span className="text-sm text-amber-700">● Not installed yet</span>
        </button>
        {pixelOpen ? (
          <div className="border-t border-neutral-100 px-4 py-3 text-sm text-neutral-600">
            Pixel Naano tracks visits, sign-ups, and revenue per post. Install is
            mocked in this demo — no script is injected.
          </div>
        ) : null}
      </article>
    </div>
  );
}
