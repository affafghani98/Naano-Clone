import Link from "next/link";
import { AiCampaignForm } from "./ai-campaign-form";

export default function CreateWithAiPage() {
  return (
    <section className="mx-auto max-w-xl space-y-4">
      <Link href="/brand/campaigns/new" className="text-sm underline">
        Back
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Create with AI</h1>
      <p className="text-sm text-neutral-600">
        Describe the product and audience. Groq drafts an editable creator brief
        you can publish for Opportunities.
      </p>
      <AiCampaignForm />
    </section>
  );
}
