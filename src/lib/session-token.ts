export const SESSION_COOKIE = "naano_session";

export type AccountType = "brand" | "creator";

export type SessionPayload = {
  userId: string;
  accountType: AccountType;
  /** Present for brand sessions. */
  workspaceId?: string;
  /** Present for creator sessions. */
  creatorId?: string;
  onboardingComplete: boolean;
};

function secret() {
  return process.env.SESSION_SECRET ?? "dev-only-naano-clone-secret";
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signBody(body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

function normalizePayload(raw: unknown): SessionPayload | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const data = raw as Record<string, unknown>;
  if (typeof data.userId !== "string" || typeof data.onboardingComplete !== "boolean") {
    return null;
  }

  // Legacy brand cookies had workspaceId and no accountType.
  if (data.accountType === "creator") {
    if (typeof data.creatorId !== "string") {
      return null;
    }
    return {
      userId: data.userId,
      accountType: "creator",
      creatorId: data.creatorId,
      onboardingComplete: data.onboardingComplete,
    };
  }

  const workspaceId =
    typeof data.workspaceId === "string" ? data.workspaceId : undefined;
  if (!workspaceId) {
    return null;
  }
  return {
    userId: data.userId,
    accountType: "brand",
    workspaceId,
    onboardingComplete: data.onboardingComplete,
  };
}

export async function encodeSession(payload: SessionPayload) {
  const body = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await signBody(body);
  return `${body}.${signature}`;
}

export async function decodeSession(token: string | undefined) {
  if (!token) {
    return null;
  }
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }
  const expected = await signBody(body);
  if (!safeEqual(signature, expected)) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(body)),
    );
    return normalizePayload(parsed);
  } catch {
    return null;
  }
}
