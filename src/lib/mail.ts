import { Resend } from "resend";

/**
 * Sends a one-time login code.
 * - With RESEND_API_KEY: emails via Resend
 * - Without: logs the code to the server console (local/dev fallback)
 */
export async function sendLoginCodeEmail(input: {
  email: string;
  code: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "Naano <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(
      `[naano-auth] RESEND_API_KEY not set — login code for ${input.email}: ${input.code}`,
    );
    return { delivered: false as const, via: "console" as const };
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: input.email,
    subject: "Your Naano login code",
    text: `Your Naano login code is ${input.code}. It expires in 10 minutes.`,
    html: `<p>Your Naano login code is <strong>${input.code}</strong>.</p><p>It expires in 10 minutes.</p>`,
  });

  if (result.error) {
    console.error("[naano-auth] Resend error:", result.error);
    console.info(
      `[naano-auth] Falling back to console — login code for ${input.email}: ${input.code}`,
    );
    return { delivered: false as const, via: "console" as const };
  }

  return { delivered: true as const, via: "resend" as const };
}
