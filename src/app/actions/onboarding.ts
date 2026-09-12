"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  normalizeWebsiteUrl,
  profileFromWebsite,
  type BrandProfile,
} from "@/lib/brand-profile";
import { db } from "@/lib/db";
import { setSession } from "@/lib/session";

function industryFromWebsite(websiteUrl: string) {
  return websiteUrl.toLowerCase().includes("relayed") ? "SaaS" : "B2B";
}

export async function analyzeWebsite(
  formData: FormData,
): Promise<{ profile?: BrandProfile; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const websiteUrl = normalizeWebsiteUrl(String(formData.get("websiteUrl") ?? ""));
    return { profile: profileFromWebsite(websiteUrl) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not analyze that URL.",
    };
  }
}

export async function completeOnboarding(formData: FormData) {
  const current = await getCurrentUser();
  if (!current) {
    redirect("/login");
  }

  const websiteUrl = normalizeWebsiteUrl(String(formData.get("websiteUrl") ?? ""));
  const profile = profileFromWebsite(websiteUrl);
  const valueProposition =
    String(formData.get("valueProposition") ?? "").trim() ||
    profile.valueProposition;

  await db.$transaction(async (tx) => {
    await tx.icp.deleteMany({ where: { workspaceId: current.workspace.id } });
    await tx.campaign.deleteMany({ where: { workspaceId: current.workspace.id } });
    await tx.workspace.update({
      where: { id: current.workspace.id },
      data: {
        name: profile.companyName,
        websiteUrl,
        valueProposition,
        industry: industryFromWebsite(websiteUrl),
        companySize: "11-50",
        onboardingComplete: true,
      },
    });
    await tx.icp.createMany({
      data: profile.icps.map((icp, index) => ({
        workspaceId: current.workspace.id,
        title: icp.title,
        description: icp.description,
        sortOrder: index + 1,
      })),
    });
    await tx.campaign.create({
      data: {
        workspaceId: current.workspace.id,
        title: profile.briefTitle,
        description: profile.briefDescription,
        status: "active",
        productSummary: profile.productSummary,
        audienceSummary: profile.audienceSummary,
      },
    });
  });

  await setSession({
    userId: current.user.id,
    accountType: "brand",
    workspaceId: current.workspace.id,
    onboardingComplete: true,
  });
  redirect("/brand");
}
