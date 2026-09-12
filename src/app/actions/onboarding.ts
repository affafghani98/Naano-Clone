"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  generateBrandProfile,
  normalizeWebsiteUrl,
  parseBrandProfileJson,
  type BrandProfile,
} from "@/lib/brand-profile";
import { db } from "@/lib/db";
import { setSession } from "@/lib/session";

function industryFromProfile(profile: BrandProfile, websiteUrl: string) {
  const haystack = `${profile.companyName} ${profile.valueProposition} ${websiteUrl}`.toLowerCase();
  if (haystack.includes("saas") || haystack.includes("relayed")) {
    return "SaaS";
  }
  return "B2B";
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
    const companyDescription = String(formData.get("companyDescription") ?? "").trim();
    const profile = await generateBrandProfile({
      websiteUrl,
      companyDescription,
    });
    return { profile };
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
  const profileJson = String(formData.get("profileJson") ?? "");
  const parsed = parseBrandProfileJson(profileJson);
  if (!parsed) {
    redirect("/onboarding-brand");
  }

  const valueProposition =
    String(formData.get("valueProposition") ?? "").trim() ||
    parsed.valueProposition;

  await db.$transaction(async (tx) => {
    await tx.icp.deleteMany({ where: { workspaceId: current.workspace.id } });
    await tx.campaign.deleteMany({ where: { workspaceId: current.workspace.id } });
    await tx.workspace.update({
      where: { id: current.workspace.id },
      data: {
        name: parsed.companyName,
        websiteUrl,
        valueProposition,
        industry: industryFromProfile(parsed, websiteUrl),
        companySize: "11-50",
        onboardingComplete: true,
      },
    });
    await tx.icp.createMany({
      data: parsed.icps.map((icp, index) => ({
        workspaceId: current.workspace.id,
        title: icp.title,
        description: icp.description,
        sortOrder: index + 1,
      })),
    });
    await tx.campaign.create({
      data: {
        workspaceId: current.workspace.id,
        title: parsed.briefTitle,
        description: parsed.briefDescription,
        status: "active",
        productSummary: parsed.productSummary,
        audienceSummary: parsed.audienceSummary,
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
