"use client";

import { useState } from "react";
import { analyzeWebsite, completeOnboarding } from "../actions/onboarding";
import type { BrandProfile } from "@/lib/brand-profile";

const ANALYSIS_STEPS = [
  "Reading site",
  "Extracting product signals",
  "Identifying ICP",
  "Preparing brand profile",
];

const STAGE_MS = 4000;

export function OnboardingWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [analysisIndex, setAnalysisIndex] = useState(-1);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [valueProposition, setValueProposition] = useState("");

  async function runAnalysis(formData: FormData) {
    setError(null);
    const url = String(formData.get("websiteUrl") ?? "");
    setWebsiteUrl(url);
    setAnalyzing(true);
    setAnalysisIndex(0);

    let stage = 0;
    const timer = window.setInterval(() => {
      stage += 1;
      if (stage < ANALYSIS_STEPS.length) {
        setAnalysisIndex(stage);
      }
    }, STAGE_MS);

    const startedAt = Date.now();
    try {
      const result = await analyzeWebsite(formData);
      if (result.error || !result.profile) {
        setError(result.error ?? "Could not analyze that URL.");
        return;
      }
      const remaining = Math.max(
        0,
        ANALYSIS_STEPS.length * STAGE_MS - (Date.now() - startedAt),
      );
      await new Promise((resolve) => window.setTimeout(resolve, remaining));
      setProfile(result.profile);
      setValueProposition(result.profile.valueProposition);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze that URL.");
    } finally {
      window.clearInterval(timer);
      setAnalyzing(false);
      setAnalysisIndex(-1);
    }
  }

  return (
    <section className="mt-12 space-y-8">
      <p className="text-sm text-neutral-500">Step {step} of 3</p>

      {step === 1 ? (
        <form action={runAnalysis} className="space-y-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Your company website</h1>
            <p className="mt-2 text-neutral-600">
              We read the site and draft a brand profile. This is mocked — no live crawl.
            </p>
          </div>
          <label className="block space-y-1 text-sm">
            <span>Company website URL</span>
            <input
              name="websiteUrl"
              required
              placeholder="https://www.relayed.example"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
            />
          </label>
          {analyzing ? (
            <ol className="space-y-2 text-sm">
              {ANALYSIS_STEPS.map((label, index) => (
                <li
                  key={label}
                  className={index <= analysisIndex ? "text-neutral-950" : "text-neutral-400"}
                >
                  {index < analysisIndex ? "✓" : index === analysisIndex ? "…" : "○"} {label}
                </li>
              ))}
            </ol>
          ) : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={analyzing}
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {analyzing ? "Analyzing my website…" : "Analyze my website"}
          </button>
        </form>
      ) : null}

      {step === 2 && profile ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Brand profile</h1>
            <p className="mt-2 text-neutral-600">
              Edit the value proposition, then continue to matching.
            </p>
          </div>
          <label className="block space-y-1 text-sm">
            <span>Value proposition</span>
            <textarea
              value={valueProposition}
              onChange={(event) => setValueProposition(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
            />
          </label>
          <div className="grid gap-3 md:grid-cols-3">
            {profile.icps.map((icp) => (
              <article
                key={icp.title}
                className="rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <h2 className="font-medium">{icp.title}</h2>
                <p className="mt-2 text-sm text-neutral-600">{icp.description}</p>
              </article>
            ))}
          </div>
          <article className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-sm uppercase tracking-wide text-neutral-500">
              Starter Creator Brief
            </p>
            <h2 className="mt-2 font-medium">{profile.briefTitle}</h2>
            <p className="mt-2 text-sm text-neutral-600">
              <span className="font-medium text-neutral-900">Product. </span>
              {profile.productSummary}
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              <span className="font-medium text-neutral-900">Audience. </span>
              {profile.audienceSummary}
            </p>
          </article>
          <button
            type="button"
            onClick={() => setStep(3)}
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white"
          >
            Continue to AI Matching
          </button>
        </div>
      ) : null}

      {step === 3 && profile ? (
        <form action={completeOnboarding} className="space-y-5">
          <input type="hidden" name="websiteUrl" value={websiteUrl} />
          <input type="hidden" name="valueProposition" value={valueProposition} />
          <h1 className="text-3xl font-semibold tracking-tight">Your marketplace is ready</h1>
          <p className="text-neutral-600">
            We prepared a starter brief for {profile.companyName}. Next stop is the
            brand dashboard — creator matching lives there.
          </p>
          <button
            type="submit"
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white"
          >
            Go to dashboard
          </button>
        </form>
      ) : null}
    </section>
  );
}
