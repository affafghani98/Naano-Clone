"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { setSession } from "@/lib/session";

export type SettingsState = {
  error?: string;
  saved?: boolean;
  message?: string;
};

const COMPANY_SIZES = new Set([
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000+",
]);

export async function saveWorkspaceProfile(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const current = await getCurrentUser();
  if (!current) {
    return { error: "You need to log in." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
  const valueProposition = String(formData.get("valueProposition") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim();
  const companySize = String(formData.get("companySize") ?? "").trim();

  if (!name) {
    return { error: "Company name is required." };
  }
  if (companySize && !COMPANY_SIZES.has(companySize)) {
    return { error: "Pick a valid company size." };
  }

  await db.workspace.update({
    where: { id: current.workspace.id },
    data: {
      name,
      websiteUrl: websiteUrl || null,
      valueProposition: valueProposition || null,
      industry: industry || null,
      companySize: companySize || null,
    },
  });

  revalidatePath("/brand");
  revalidatePath("/brand/settings");
  return { saved: true };
}

export async function saveAudienceSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const current = await getCurrentUser();
  if (!current) {
    return { error: "You need to log in." };
  }

  const industries = formData
    .getAll("industries")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const regions = formData
    .getAll("regions")
    .map((value) => String(value).trim())
    .filter(Boolean);

  await db.workspace.update({
    where: { id: current.workspace.id },
    data: {
      targetIndustries: JSON.stringify(industries),
      targetRegions: JSON.stringify(regions),
    },
  });

  revalidatePath("/brand/settings");
  return { saved: true };
}

export async function inviteColleague(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const current = await getCurrentUser();
  if (!current) {
    return { error: "You need to log in." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const workspaceIds = formData
    .getAll("workspaceIds")
    .map((value) => String(value))
    .filter(Boolean);

  if (!email.includes("@")) {
    return { error: "Enter a valid work email." };
  }
  if (workspaceIds.length === 0) {
    return { error: "Choose at least one workspace." };
  }

  const owned = new Set(
    current.user.memberships.map((membership) => membership.workspaceId),
  );
  for (const workspaceId of workspaceIds) {
    if (!owned.has(workspaceId)) {
      return { error: "You can only invite to your own workspaces." };
    }
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  let added = 0;
  let invited = 0;

  for (const workspaceId of workspaceIds) {
    if (existingUser) {
      const membership = await db.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: existingUser.id,
            workspaceId,
          },
        },
      });
      if (!membership) {
        await db.workspaceMember.create({
          data: {
            userId: existingUser.id,
            workspaceId,
            role: "admin",
          },
        });
        added += 1;
      }
      await db.workspaceInvite.deleteMany({
        where: { workspaceId, email },
      });
      continue;
    }

    await db.workspaceInvite.upsert({
      where: {
        workspaceId_email: { workspaceId, email },
      },
      create: {
        workspaceId,
        email,
        role: "admin",
        status: "pending",
        invitedByUserId: current.user.id,
        expiresAt,
      },
      update: {
        status: "pending",
        expiresAt,
        invitedByUserId: current.user.id,
      },
    });
    invited += 1;
  }

  revalidatePath("/brand/settings");
  if (existingUser && added > 0) {
    return {
      saved: true,
      message: `${email} already had a Naano account — access added immediately.`,
    };
  }
  if (invited > 0) {
    return {
      saved: true,
      message: `Invitation saved for ${email} (demo — no email is sent). Link would expire in 14 days.`,
    };
  }
  return {
    saved: true,
    message: `${email} already has access to the selected workspace(s).`,
  };
}

export async function switchWorkspace(formData: FormData) {
  const current = await getCurrentUser();
  if (!current) {
    redirect("/login");
  }

  const workspaceId = String(formData.get("workspaceId") ?? "");
  const membership = current.user.memberships.find(
    (item) => item.workspaceId === workspaceId,
  );
  if (!membership) {
    redirect("/brand");
  }

  await setSession({
    userId: current.user.id,
    accountType: "brand",
    workspaceId: membership.workspace.id,
    onboardingComplete: membership.workspace.onboardingComplete,
  });

  redirect(
    membership.workspace.onboardingComplete ? "/brand" : "/onboarding-brand",
  );
}

export async function createWorkspace(formData: FormData) {
  const current = await getCurrentUser();
  if (!current) {
    redirect("/login");
  }

  const rawName = String(formData.get("name") ?? "").trim();
  const count = current.user.memberships.length + 1;
  const name = rawName || `New brand ${count}`;

  const workspace = await db.workspace.create({
    data: {
      name,
      onboardingComplete: false,
      walletBalanceCents: 0,
      members: {
        create: { userId: current.user.id, role: "owner" },
      },
      threads: {
        create: {
          isSystem: true,
          title: "NaanoBot",
          messages: {
            create: {
              sender: "system",
              body: "Invite a creator — in this demo the thread opens as soon as the first booking is sent.",
            },
          },
        },
      },
    },
  });

  await setSession({
    userId: current.user.id,
    accountType: "brand",
    workspaceId: workspace.id,
    onboardingComplete: false,
  });

  redirect("/onboarding-brand");
}
