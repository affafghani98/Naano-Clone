import Link from "next/link";
import { CreateCampaignForm } from "../create-campaign-form";

export default function ManualCampaignPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/brand/campaigns/new" className="text-sm underline">
          Back
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Write a brief
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Published campaigns appear in creator Opportunities so they can apply.
        </p>
      </div>
      <CreateCampaignForm />
    </section>
  );
}
