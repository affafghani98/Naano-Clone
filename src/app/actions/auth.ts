"use server";

import { redirect } from "next/navigation";
import {
  DEMO_CREATOR_EMAIL,
  DEMO_EMAIL,
} from "@/lib/demo-account";
import { db } from "@/lib/db";
import {
  codesMatch,
  generateLoginCode,
  hashLoginCode,
  isAuthIntent,
  loginCodeExpiresAt,
  type AuthIntent,
} from "@/lib/login-code";
import { sendLoginCodeEmail } from "@/lib/mail";
import { clearSession, getSession, setSession } from "@/lib/session";

export type AuthState = {
  error?: string;
  ok?: boolean;
  deliveredVia?: "resend" | "console";
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

async function createBrandWorkspace(userId: string, name: string) {
  return db.workspace.create({
    data: {
      name: `${name}'s workspace`,
      onboardingComplete: false,
      walletBalanceCents: 0,
      members: {
        create: { userId, role: "owner" },
      },
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
  });
}

async function createCreatorForUser(userId: string, name: string) {
  const baseSlug = slugify(name) || "creator";
  let slug = baseSlug;
  let attempt = 0;
  while (await db.creator.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const referralCode = `ref-${slug}-${Math.random().toString(36).slice(2, 8)}`;

  const creator = await db.creator.create({
    data: {
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
  });

  const profile = await db.creatorProfile.create({
    data: {
      userId,
      creatorId: creator.id,
      referralCode,
      onboardingComplete: false,
    },
  });

  await db.messageThread.create({
    data: {
      creatorId: creator.id,
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

  return profile;
}

async function establishSessionForUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      memberships: { include: { workspace: true } },
      creatorProfile: true,
    },
  });
  if (!user) {
    return { error: "Account not found." } as const;
  }

  const hasBrand = user.memberships.length > 0;
  const hasCreator = Boolean(user.creatorProfile);

  if (hasBrand && hasCreator && user.creatorProfile) {
    const membership = user.memberships[0]!;
    await setSession({
      userId: user.id,
      accountType: "brand",
      workspaceId: membership.workspaceId,
      onboardingComplete: membership.workspace.onboardingComplete,
    });
    redirect("/choose-role");
  }

  if (hasCreator && user.creatorProfile) {
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
    return { error: "This account has no workspace or creator profile." } as const;
  }

  await setSession({
    userId: user.id,
    accountType: "brand",
    workspaceId: membership.workspaceId,
    onboardingComplete: membership.workspace.onboardingComplete,
  });
  redirect(brandLanding(membership.workspace.onboardingComplete));
}

export async function requestLoginCode(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const intentRaw = String(formData.get("intent") ?? "login");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email." };
  }
  if (!isAuthIntent(intentRaw)) {
    return { error: "Invalid sign-in intent." };
  }
  const intent: AuthIntent = intentRaw;

  if (intent === "signup_brand" || intent === "signup_creator") {
    if (!name) {
      return { error: "Name is required to sign up." };
    }
  }

  const existing = await db.user.findUnique({
    where: { email },
    include: { memberships: true, creatorProfile: true },
  });

  if (intent === "login" && !existing) {
    return { error: "No account with that email. Sign up first." };
  }

  if (intent === "signup_brand" && existing?.memberships.length) {
    // Already a brand — send a login code instead of erroring hard.
  }
  if (intent === "signup_creator" && existing?.creatorProfile) {
    // Already a creator — code will log them in.
  }

  const code = generateLoginCode();
  const codeHash = hashLoginCode(email, code);

  await db.loginCode.deleteMany({ where: { email } });
  await db.loginCode.create({
    data: {
      email,
      codeHash,
      intent,
      name: name || null,
      expiresAt: loginCodeExpiresAt(),
    },
  });

  const delivery = await sendLoginCodeEmail({ email, code });

  const params = new URLSearchParams({
    email,
    intent,
  });
  if (name) {
    params.set("name", name);
  }
  if (delivery.via === "console") {
    params.set("dev", "1");
  }
  redirect(`/verify?${params.toString()}`);
}

export async function verifyLoginCode(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const code = String(formData.get("code") ?? "").trim();
  const intentRaw = String(formData.get("intent") ?? "login");
  const nameFromForm = String(formData.get("name") ?? "").trim();

  if (!email || !code) {
    return { error: "Email and code are required." };
  }
  if (!/^\d{6}$/.test(code)) {
    return { error: "Enter the 6-digit code." };
  }
  if (!isAuthIntent(intentRaw)) {
    return { error: "Invalid sign-in intent." };
  }
  const intent: AuthIntent = intentRaw;

  const record = await db.loginCode.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    return { error: "That code expired. Request a new one." };
  }

  const expectedIntent = isAuthIntent(record.intent) ? record.intent : intent;
  if (expectedIntent !== intent) {
    return { error: "That code was issued for a different sign-in step." };
  }

  if (!codesMatch(record.codeHash, hashLoginCode(email, code))) {
    return { error: "That code is incorrect." };
  }

  await db.loginCode.deleteMany({ where: { email } });

  const displayName =
    nameFromForm || record.name?.trim() || email.split("@")[0] || "User";

  let user = await db.user.findUnique({
    where: { email },
    include: { memberships: true, creatorProfile: true },
  });

  if (!user) {
    if (intent === "login") {
      return { error: "No account with that email. Sign up first." };
    }
    user = await db.user.create({
      data: { email, name: displayName },
      include: { memberships: true, creatorProfile: true },
    });
  } else if (displayName && displayName !== user.name && intent !== "login") {
    user = await db.user.update({
      where: { id: user.id },
      data: { name: displayName },
      include: { memberships: true, creatorProfile: true },
    });
  }

  if (intent === "signup_brand" || (intent === "login" && !user.creatorProfile)) {
    if (user.memberships.length === 0) {
      const workspace = await createBrandWorkspace(user.id, user.name);
      await setSession({
        userId: user.id,
        accountType: "brand",
        workspaceId: workspace.id,
        onboardingComplete: false,
      });
      redirect("/onboarding-brand");
    }
  }

  if (intent === "signup_creator") {
    if (!user.creatorProfile) {
      const profile = await createCreatorForUser(user.id, user.name);
      await setSession({
        userId: user.id,
        accountType: "creator",
        creatorId: profile.creatorId,
        onboardingComplete: false,
      });
      redirect("/onboarding");
    }
  }

  // Existing account login (or signup when role already present).
  return establishSessionForUser(user.id);
}

export async function resendLoginCode(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  return requestLoginCode(_prev, formData);
}

/** Instant walkthrough login — no email code required. */
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

export async function switchAccountRole(formData: FormData) {
  await chooseAccountRole(formData);
}

export async function addCreatorProfileToAccount() {
  const session = await getSession();
  if (!session || session.accountType !== "brand") {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { creatorProfile: true },
  });
  if (!user) {
    redirect("/login");
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

  const profile = await createCreatorForUser(user.id, user.name);
  await setSession({
    userId: user.id,
    accountType: "creator",
    creatorId: profile.creatorId,
    onboardingComplete: false,
  });
  redirect("/onboarding");
}

export async function addBrandWorkspaceToAccount() {
  const session = await getSession();
  if (!session || session.accountType !== "creator") {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { memberships: { include: { workspace: true } } },
  });
  if (!user) {
    redirect("/login");
  }
  if (user.memberships[0]) {
    const membership = user.memberships[0];
    await setSession({
      userId: user.id,
      accountType: "brand",
      workspaceId: membership.workspaceId,
      onboardingComplete: membership.workspace.onboardingComplete,
    });
    redirect(brandLanding(membership.workspace.onboardingComplete));
  }

  const workspace = await createBrandWorkspace(user.id, user.name);
  await setSession({
    userId: user.id,
    accountType: "brand",
    workspaceId: workspace.id,
    onboardingComplete: false,
  });
  redirect("/onboarding-brand");
}

export async function logout() {
  await clearSession();
  redirect("/");
}
