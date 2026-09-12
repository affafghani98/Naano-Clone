"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CAMPAIGN_STATUS } from "@/lib/campaigns";
import { callGroqChat, parseJsonObject } from "@/lib/groq";
import { db } from "@/lib/db";

export type AiCampaignState = {
  error?: string;
};

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function createCampaignWithAi(
  _prev: AiCampaignState,
  formData: FormData,
): Promise<AiCampaignState> {
  const current = await getCurrentUser();
  if (!current) {
    return { error: "You need to log in." };
  }

  const prompt = String(formData.get("prompt") ?? "").trim();
  const publish = String(formData.get("publish") ?? "") === "1";
  if (prompt.length < 20) {
    return {
      error: "Describe the campaign in at least a couple of sentences.",
    };
  }

  const workspaceHint = [
    current.workspace.name,
    current.workspace.valueProposition,
    current.workspace.industry,
  ]
    .filter(Boolean)
    .join(" · ");

  const result = await callGroqChat({
    system: `You write LinkedIn creator briefs for a B2B marketplace called Naano.
Return ONLY valid JSON with keys: title, description, productSummary, audienceSummary.
Be specific and practical. No markdown.`,
    user: `Brand context: ${workspaceHint || "B2B brand"}
Campaign request: ${prompt}`,
    maxTokens: 900,
  });

  if (!result.ok) {
    return {
      error: result.error || "AI could not draft the brief. Try again or write it manually.",
    };
  }

  const json = parseJsonObject(result.text);
  if (!json) {
    return { error: "AI returned an unreadable draft. Try again." };
  }

  const title = asString(json.title, "Creator brief");
  const description = asString(
    json.description,
    prompt.slice(0, 400),
  );
  const productSummary = asString(json.productSummary) || null;
  const audienceSummary = asString(json.audienceSummary) || null;

  const campaign = await db.campaign.create({
    data: {
      workspaceId: current.workspace.id,
      title,
      description,
      productSummary,
      audienceSummary,
      status: publish ? CAMPAIGN_STATUS.active : CAMPAIGN_STATUS.draft,
    },
  });

  redirect(`/brand/campaigns/${campaign.id}`);
}
