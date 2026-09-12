export const DEMO_EMAIL = "demo@naano.clone";
export const DEMO_PASSWORD = "demo1234";
export const DEMO_CREATOR_EMAIL = "creator@naano.clone";
export const DEMO_CREATOR_PASSWORD = "demo1234";
export const DEMO_CREATOR_SLUG = "maya-chen";

export function isDemoEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return normalized === DEMO_EMAIL || normalized === DEMO_CREATOR_EMAIL;
}
