"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import {
  DEMO_CREATOR_EMAIL,
  DEMO_EMAIL,
} from "@/lib/demo-account";
import { db } from "@/lib/db";
import { clearSession, getSession, setSession } from "@/lib/session";

export type AuthState = {
  error?: string;
};

function brandLanding(onboardingComplete: boolean) {
  return onboardingComplete ? "/brand" : "/onboarding-brand";
}

function creatorLanding(onboardingComplete: boolean) {
  return onboardingComplete ? "/creator" : "/onboarding";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function registerBrand(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }
  if (!email.includes("@")) {
    return { error: "Enter a valid email." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await db.user.findUnique({
    where: { email },
    include: { memberships: true, creatorProfile: true },
  });
  if (existing?.creatorProfile) {
    return {
      error:
        "That email is already a creator account. Use a different email for a brand workspace.",
    };
  }
  if (existing) {
    return { error: "That email is already registered." };
  }

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      memberships: {
        create: {
          role: "owner",
          workspace: {
            create: {
              name: `${name}'s workspace`,
              onboardingComplete: false,
              walletBalanceCents: 0,
              threads: {
                create: {
                  isSystem: true,
                  title: "NaanoBot",
                  messages: {
                    create: {
                      sender: "system",
                      body: "Invite a creator — the thread opens as soon as the first booking is accepted.",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    include: { memberships: true },
  });

  const workspaceId = user.memberships[0]?.workspaceId;
  if (!workspaceId) {
    return { error: "Could not create a workspace." };
  }

  await setSession({
    userId: user.id,
    accountType: "brand",
    workspaceId,
    onboardingComplete: false,
  });
  redirect("/onboarding-brand");
}

export async function registerCreator(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }
  if (!email.includes("@")) {
    return { error: "Enter a valid email." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await db.user.findUnique({
    where: { email },
    include: { memberships: true, creatorProfile: true },
  });
  if (existing?.memberships.length) {
    return {
      error:
        "That email is already a brand account. Use a different email for a creator profile.",
    };
  }
  if (existing) {
    return { error: "That email is already registered." };
  }

  const baseSlug = slugify(name) || "creator";
  let slug = baseSlug;
  let attempt = 0;
  while (await db.creator.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const referralCode = `ref-${slug}-${Math.random().toString(36).slice(2, 8)}`;

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      creatorProfile: {
        create: {
          referralCode,
          onboardingComplete: false,
          creator: {
            create: {
              slug,
              name,
              photoUrl: `https://i.pravatar.cc/160?u=${slug}`,
              country: "—",
              countryCode: "XX",
              industry: "B2B",
              tags: "[]",
              followers: 0,
              medianViews: 0,
              cpmCents: 0,
              postCostCents: 0,
              bundleCostCents: 0,
              matchPercent: 50,
              typicalReach: 0,
              postsAnalyzed: 0,
              audienceMatchPercent: 50,
              jobTitleBreakdown: "[]",
              seniorityBreakdown: "[]",
              overview: "Creator profile in progress.",
              headline: null,
              linkedInUrl: null,
            },
          },
        },
      },
    },
    include: { creatorProfile: true },
  });

  const creatorId = user.creatorProfile?.creatorId;
  if (!creatorId) {
    return { error: "Could not create a creator profile." };
  }

  await db.messageThread.create({
    data: {
      creatorId,
      isSystem: true,
      title: "NaanoBot",
      messages: {
        create: {
          sender: "system",
          body: "No conversations yet — the thread opens with your first Booking.",
        },
      },
    },
  });

  await setSession({
    userId: user.id,
    accountType: "creator",
    creatorId,
    onboardingComplete: false,
  });
  redirect("/onboarding");
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await db.user.findUnique({
    where: { email },
    include: {
      memberships: { include: { workspace: true } },
      creatorProfile: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Email or password is wrong." };
  }

  // Prefer creator when both somehow exist (legacy); new signups are single-role.
  if (user.creatorProfile && user.memberships.length > 0) {
    await setSession({
      userId: user.id,
      accountType: "brand",
      workspaceId: user.memberships[0]!.workspaceId,
      onboardingComplete: user.memberships[0]!.workspace.onboardingComplete,
    });
    redirect("/choose-role");
  }

  if (user.creatorProfile) {
    await setSession({
      userId: user.id,
      accountType: "creator",
      creatorId: user.creatorProfile.creatorId,
      onboardingComplete: user.creatorProfile.onboardingComplete,
    });
    redirect(creatorLanding(user.creatorProfile.onboardingComplete));
  }

  const membership = user.memberships[0];
  if (!membership) {
    return { error: "This account has no workspace." };
  }

  await setSession({
    userId: user.id,
    accountType: "brand",
    workspaceId: membership.workspaceId,
    onboardingComplete: membership.workspace.onboardingComplete,
  });
  redirect(brandLanding(membership.workspace.onboardingComplete));
}

/** Instant walkthrough login — no password required. */
export async function loginDemoAccount(formData: FormData) {
  const role = String(formData.get("role") ?? "");
  const email = role === "creator" ? DEMO_CREATOR_EMAIL : DEMO_EMAIL;

  const user = await db.user.findUnique({
    where: { email },
    include: {
      memberships: { include: { workspace: true } },
      creatorProfile: true,
    },
  });

  if (!user) {
    redirect("/login?error=demo-missing");
  }

  if (role === "creator" && user.creatorProfile) {
    await setSession({
      userId: user.id,
      accountType: "creator",
      creatorId: user.creatorProfile.creatorId,
      onboardingComplete: user.creatorProfile.onboardingComplete,
    });
    redirect(creatorLanding(user.creatorProfile.onboardingComplete));
  }

  const membership = user.memberships[0];
  if (!membership) {
    redirect("/login?error=demo-missing");
  }

  await setSession({
    userId: user.id,
    accountType: "brand",
    workspaceId: membership.workspaceId,
    onboardingComplete: membership.workspace.onboardingComplete,
  });
  redirect(brandLanding(membership.workspace.onboardingComplete));
}

export async function chooseAccountRole(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const role = String(formData.get("role") ?? "");
  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      memberships: { include: { workspace: true } },
      creatorProfile: true,
    },
  });
  if (!user) {
    redirect("/login");
  }

  if (role === "creator" && user.creatorProfile) {
    await setSession({
      userId: user.id,
      accountType: "creator",
      creatorId: user.creatorProfile.creatorId,
      onboardingComplete: user.creatorProfile.onboardingComplete,
    });
    redirect(creatorLanding(user.creatorProfile.onboardingComplete));
  }

  if (role === "brand" && user.memberships[0]) {
    const membership = user.memberships[0];
    await setSession({
      userId: user.id,
      accountType: "brand",
      workspaceId: membership.workspaceId,
      onboardingComplete: membership.workspace.onboardingComplete,
    });
    redirect(brandLanding(membership.workspace.onboardingComplete));
  }

  redirect("/choose-role");
}

/** Dual-role attach is disabled; stubs fail closed. */
export async function addCreatorProfileToAccount() {
  redirect("/brand");
}

export async function addBrandWorkspaceToAccount() {
  redirect("/creator");
}

export async function logout() {
  await clearSession();
  redirect("/");
}
