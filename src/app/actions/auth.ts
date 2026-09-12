"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clearSession, setSession } from "@/lib/session";

export type AuthState = {
  error?: string;
};

function landingFor(onboardingComplete: boolean) {
  return onboardingComplete ? "/brand" : "/onboarding-brand";
}

export async function registerBrand(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
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

  const existing = await db.user.findUnique({ where: { email } });
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
    workspaceId,
    onboardingComplete: false,
  });
  redirect("/onboarding-brand");
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await db.user.findUnique({
    where: { email },
    include: { memberships: { include: { workspace: true } } },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Email or password is wrong." };
  }

  const membership = user.memberships[0];
  if (!membership) {
    return { error: "This account has no workspace." };
  }

  await setSession({
    userId: user.id,
    workspaceId: membership.workspaceId,
    onboardingComplete: membership.workspace.onboardingComplete,
  });
  redirect(landingFor(membership.workspace.onboardingComplete));
}

export async function logout() {
  await clearSession();
  redirect("/");
}
