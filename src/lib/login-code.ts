import { createHash, randomInt, timingSafeEqual } from "crypto";
import { LOGIN_CODE_TTL_MS } from "./demo-account";

export type AuthIntent = "login" | "signup_brand" | "signup_creator";

export function isAuthIntent(value: string): value is AuthIntent {
  return (
    value === "login" ||
    value === "signup_brand" ||
    value === "signup_creator"
  );
}

export function generateLoginCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashLoginCode(email: string, code: string) {
  return createHash("sha256")
    .update(`${email.trim().toLowerCase()}:${code.trim()}`)
    .digest("hex");
}

export function codesMatch(leftHash: string, rightHash: string) {
  try {
    const left = Buffer.from(leftHash, "hex");
    const right = Buffer.from(rightHash, "hex");
    if (left.length !== right.length) {
      return false;
    }
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function loginCodeExpiresAt(from = new Date()) {
  return new Date(from.getTime() + LOGIN_CODE_TTL_MS);
}
