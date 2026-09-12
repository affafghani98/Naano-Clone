"use server";

import { redirect } from "next/navigation";
import { getCurrentCreator } from "@/lib/auth";
import {
  CREATOR_COUNTRIES,
  CREATOR_INDUSTRIES,
  generateCreatorProfile,
  suggestedPostPriceCents,
} from "@/lib/creator-profile";
import { db } from "@/lib/db";
import { setSession } from "@/lib/session";

export type CreatorOnboardingState = {
  error?: string;
  profile?: {
    name: string;
    headline: string;
    country: string;
    countryCode: string;
    followers: number;
    photoUrl: string;
    linkedInUrl: string;
    industries: string[];
    suggestedPriceCents: number;
    usedFallback?: boolean;
  };
};

const INDUSTRY_SET = new Set<string>(CREATOR_INDUSTRIES);

export async function importLinkedInProfile(
  formData: FormData,
): Promise<CreatorOnboardingState> {
  const current = await getCurrentCreator();
  if (!current) {
    redirect("/login");
  }

  try {
    const linkedInUrl = String(formData.get("linkedInUrl") ?? "");
    const bio = String(formData.get("bio") ?? "");
    if (!linkedInUrl.trim()) {
      return { error: "Paste your public LinkedIn profile URL." };
    }
    if (!bio.trim()) {
      return {
        error: "Add your LinkedIn headline or a short bio so we can draft your card.",
      };
    }

    const profile = await generateCreatorProfile({
      linkedInUrl,
      fallbackName: current.user.name,
      bio,
    });

    return { profile };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not import that profile.",
    };
  }
}

export async function completeCreatorOnboarding(formData: FormData) {
  const current = await getCurrentCreator();
  if (!current) {
    redirect("/login");
  }

  const linkedInUrl = String(formData.get("linkedInUrl") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || current.user.name;
  const headline = String(formData.get("headline") ?? "").trim();
  const countryLabel = String(formData.get("country") ?? "").trim();
  const followers = Number(formData.get("followers") ?? 0);
  const photoUrl =
    String(formData.get("photoUrl") ?? "").trim() || current.creator.photoUrl;
  const postCostCents = Number(formData.get("postCostCents") ?? 0);
  const industries = formData
    .getAll("industries")
    .map((value) => String(value))
    .filter((value) => INDUSTRY_SET.has(value))
    .slice(0, 3);

  if (!linkedInUrl || !headline || !countryLabel || industries.length === 0) {
    redirect("/onboarding");
  }

  const country =
    CREATOR_COUNTRIES.find((item) => item.label === countryLabel) ??
    CREATOR_COUNTRIES[CREATOR_COUNTRIES.length - 1];

  const safeFollowers = Number.isFinite(followers) && followers > 0 ? followers : 5000;
  const price =
    Number.isFinite(postCostCents) && postCostCents > 0
      ? Math.round(postCostCents)
      : suggestedPostPriceCents(safeFollowers);
  const medianViews = Math.round(safeFollowers * 0.28);
  const typicalReach = Math.round(safeFollowers * 0.22);

  await db.$transaction(async (tx) => {
    await tx.creator.update({
      where: { id: current.creator.id },
      data: {
        name,
        photoUrl,
        country: country.label,
        countryCode: country.code,
        industry: industries[0] ?? "B2B",
        tags: JSON.stringify(industries),
        followers: safeFollowers,
        medianViews,
        cpmCents: Math.max(800, Math.round((price / Math.max(typicalReach, 1)) * 1000)),
        postCostCents: price,
        bundleCostCents: price * 4,
        matchPercent: Math.min(95, 55 + Math.round(safeFollowers / 2000)),
        typicalReach,
        postsAnalyzed: Math.max(1, Math.round(safeFollowers / 2500)),
        audienceMatchPercent: Math.min(90, 50 + industries.length * 8),
        overview: `${name} creates LinkedIn content for ${industries.join(", ")} brands.`,
        headline,
        linkedInUrl,
        jobTitleBreakdown: JSON.stringify([
          { label: industries[0] ?? "B2B", percent: 52 },
          { label: "Founders", percent: 28 },
          { label: "Other", percent: 20 },
        ]),
        seniorityBreakdown: JSON.stringify([
          { label: "Manager", percent: 44 },
          { label: "Founder", percent: 31 },
          { label: "IC", percent: 25 },
        ]),
      },
    });

    await tx.user.update({
      where: { id: current.user.id },
      data: { name },
    });

    await tx.creatorProfile.update({
      where: { id: current.profile.id },
      data: {
        linkedInUrl,
        headline,
        onboardingComplete: true,
      },
    });
  });

  await setSession({
    userId: current.user.id,
    accountType: "creator",
    creatorId: current.creator.id,
    onboardingComplete: true,
  });
  redirect("/creator");
}
