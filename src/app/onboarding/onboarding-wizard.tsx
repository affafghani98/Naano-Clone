"use client";

import { useState } from "react";
import {
  completeCreatorOnboarding,
  importLinkedInProfile,
} from "../actions/creator-onboarding";
import {
  CREATOR_COUNTRIES,
  CREATOR_INDUSTRIES,
} from "@/lib/creator-profile";
import { formatEuro } from "@/lib/money";
import { MarketplaceCardPreview } from "../register/creator-register-view";

type Imported = {
  name: string;
  headline: string;
  country: string;
  countryCode: string;
  followers: number;
  photoUrl: string;
  linkedInUrl: string;
  suggestedPriceCents: number;
};

export function CreatorOnboardingWizard({
  initialName,
  initialPhotoUrl,
}: {
  initialName: string;
  initialPhotoUrl: string;
}) {
  const [step, setStep] = useState<2 | 3 | 4 | 5 | 6>(2);
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<Imported | null>(null);
  const [country, setCountry] = useState("");
  const [industries, setIndustries] = useState<string[]>([]);
  const [postCostCents, setPostCostCents] = useState(0);
  const [flip, setFlip] = useState(false);

  async function runImport(formData: FormData) {
    setError(null);
    setImporting(true);
    try {
      const result = await importLinkedInProfile(formData);
      if (result.error || !result.profile) {
        setError(result.error ?? "Could not import that profile.");
        return;
      }
      setImported(result.profile);
      setLinkedInUrl(result.profile.linkedInUrl);
      setCountry(result.profile.country);
      setPostCostCents(result.profile.suggestedPriceCents);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import that profile.");
    } finally {
      setImporting(false);
    }
  }

  function toggleIndustry(tag: string) {
    setIndustries((current) => {
      if (current.includes(tag)) {
        return current.filter((item) => item !== tag);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, tag];
    });
  }

  const displayName = imported?.name ?? initialName;
  const headline = imported?.headline ?? "LinkedIn headline placeholder";
  const followers = imported?.followers ?? 0;
  const impressions = followers > 0 ? Math.round(followers * 0.22) : null;

  return (
    <section className="mt-12 space-y-8">
      <p className="text-sm text-neutral-500">
        Step {step === 5 || step === 6 ? 4 : step} of 4
      </p>

      {step === 2 ? (
        <form action={runImport} className="space-y-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Add your public LinkedIn profile
            </h1>
            <p className="mt-2 text-neutral-600">
              Paste a public LinkedIn URL. We only mock-import name, photo, headline,
              country, and follower count — no posts, engagement, or private analytics.
            </p>
          </div>
          <label className="block space-y-1 text-sm">
            <span>Public LinkedIn URL</span>
            <input
              name="linkedInUrl"
              required
              value={linkedInUrl}
              onChange={(event) => setLinkedInUrl(event.target.value)}
              placeholder="https://www.linkedin.com/in/your-name"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={importing}
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {importing ? "Importing…" : "Import my public profile"}
          </button>
        </form>
      ) : null}

      {step === 3 && imported ? (
        <div className="space-y-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Complete your creator card
            </h1>
            <p className="mt-2 text-neutral-600">
              Confirm the imported details and pick up to 3 industries.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
            <p>
              <span className="text-neutral-500">Followers:</span>{" "}
              {imported.followers.toLocaleString()}
            </p>
            <p className="mt-1">
              <span className="text-neutral-500">Headline:</span> {imported.headline}
            </p>
          </div>
          <label className="block space-y-1 text-sm">
            <span>Your country</span>
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
            >
              {CREATOR_COUNTRIES.map((item) => (
                <option key={item.code} value={item.label}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <div>
            <p className="text-sm">Your industries (up to 3)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CREATOR_INDUSTRIES.map((tag) => {
                const selected = industries.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleIndustry(tag)}
                    className={`rounded-full px-3 py-1.5 text-sm ${
                      selected
                        ? "bg-neutral-950 text-white"
                        : "border border-neutral-300 bg-white text-neutral-700"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
          {industries.length === 0 ? (
            <p className="text-sm text-neutral-500">Pick at least one industry.</p>
          ) : null}
          <button
            type="button"
            disabled={industries.length === 0}
            onClick={() => setStep(4)}
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            Continue
          </button>
        </div>
      ) : null}

      {step === 4 && imported ? (
        <div className="space-y-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Complete your creator card
            </h1>
            <p className="mt-2 text-neutral-600">
              AI-recommended starting price based on followers and audience. You can
              change it now or later.
            </p>
          </div>
          <p className="text-4xl font-semibold tracking-tight">
            {formatEuro(postCostCents)}
            <span className="text-lg font-normal text-neutral-500">/post</span>
          </p>
          <label className="block max-w-xs space-y-1 text-sm">
            <span>Adjust price (cents stored as euros in UI)</span>
            <input
              type="number"
              min={50}
              step={10}
              value={Math.round(postCostCents / 100)}
              onChange={(event) =>
                setPostCostCents(Math.max(50, Number(event.target.value) || 50) * 100)
              }
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
            />
          </label>
          <button
            type="button"
            onClick={() => setStep(5)}
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white"
          >
            Create my marketplace profile
          </button>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Complete your professional information now?
            </h1>
            <p className="mt-2 text-neutral-600">
              France/EU: a registered professional activity is required to invoice and
              withdraw. US / outside the EU: no registered business is required for this
              demo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStep(6)}
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white"
          >
            Finish later
          </button>
        </div>
      ) : null}

      {step === 6 && imported ? (
        <div className="space-y-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Here is your Marketplace card
            </h1>
            <p className="mt-2 text-neutral-600">Tap it to flip it over.</p>
          </div>
          <button
            type="button"
            onClick={() => setFlip((value) => !value)}
            className="w-full text-left"
          >
            {flip ? (
              <div className="rounded-3xl border border-neutral-200 bg-neutral-950 p-6 text-white">
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  Card reverse
                </p>
                <p className="mt-4 text-lg font-medium">{displayName}</p>
                <p className="mt-2 text-sm text-neutral-300">{headline}</p>
                <p className="mt-6 text-sm text-neutral-400">
                  Deal Link · share with brands · 25% referral for 3 months
                </p>
              </div>
            ) : (
              <MarketplaceCardPreview
                name={displayName}
                headline={headline}
                followers={followers}
                impressions={impressions}
                postCostCents={postCostCents}
              />
            )}
          </button>
          <form action={completeCreatorOnboarding}>
            <input type="hidden" name="linkedInUrl" value={imported.linkedInUrl} />
            <input type="hidden" name="name" value={imported.name} />
            <input type="hidden" name="headline" value={imported.headline} />
            <input type="hidden" name="country" value={country} />
            <input type="hidden" name="followers" value={imported.followers} />
            <input
              type="hidden"
              name="photoUrl"
              value={imported.photoUrl || initialPhotoUrl}
            />
            <input type="hidden" name="postCostCents" value={postCostCents} />
            {industries.map((tag) => (
              <input key={tag} type="hidden" name="industries" value={tag} />
            ))}
            <button
              type="submit"
              className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white"
            >
              Continue to my profile
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
