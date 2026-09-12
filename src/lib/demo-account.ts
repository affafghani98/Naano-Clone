export const DEMO_EMAIL = "demo@naano.clone";
export const DEMO_CREATOR_EMAIL = "creator@naano.clone";
export const DEMO_CREATOR_SLUG = "maya-chen";

/** One-time login codes expire after 10 minutes. */
export const LOGIN_CODE_TTL_MS = 10 * 60 * 1000;

export function isDemoEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return normalized === DEMO_EMAIL || normalized === DEMO_CREATOR_EMAIL;
}
