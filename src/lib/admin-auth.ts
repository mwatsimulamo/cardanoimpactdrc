import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "cip-admin-session";
export const ADMIN_SESSION_HOURS = 8;

export type AdminCredentialStatus = "ok" | "invalid" | "unconfigured";

export function checkAdminCredentials(email: string, password: string): AdminCredentialStatus {
  const expectedEmail = readAdminEmail();
  const expectedPassword = readAdminPassword();
  if (!accountIsConfigured(expectedEmail, expectedPassword) || sessionKey() === "") {
    return "unconfigured";
  }

  const emailMatches = sameSecret(email.trim().toLowerCase(), expectedEmail);
  const passwordMatches = sameSecret(password, expectedPassword);
  return emailMatches && passwordMatches ? "ok" : "invalid";
}

export function signAdminSession(now = Date.now()): string | null {
  const key = sessionKey();
  if (key === "") {
    return null;
  }

  const payload = Buffer.from(
    JSON.stringify({
      v: 1,
      kind: "admin",
      exp: Math.floor(now / 1000) + ADMIN_SESSION_HOURS * 60 * 60,
    }),
    "utf8",
  ).toString("base64url");
  const signature = createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function parseAdminSession(token: string, now?: number): boolean {
  if (token.length === 0) {
    return false;
  }

  const key = sessionKey();
  const current = now ?? Date.now();
  if (key === "") {
    return false;
  }

  const separator = token.lastIndexOf(".");
  if (separator < 1) {
    return false;
  }

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = createHmac("sha256", key).update(payload).digest("base64url");
  if (!sameSecret(signature, expected)) {
    return false;
  }

  try {
    const body: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof body !== "object" || body === null) {
      return false;
    }

    const record = body as { v?: unknown; kind?: unknown; exp?: unknown };
    return record.v === 1 && record.kind === "admin" && typeof record.exp === "number" && record.exp * 1000 > current;
  } catch {
    return false;
  }
}

function readAdminEmail(): string {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
}

function readAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

function accountIsConfigured(email: string, password: string): boolean {
  return email.includes("@") && email.length <= 254 && password.length >= 8;
}

function sessionKey(): string {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const password = readAdminPassword();
  if (serviceRoleKey.length < 20 || password.length < 8) {
    return "";
  }

  return createHmac("sha256", serviceRoleKey).update(`cip-admin-session\n${password}`).digest("base64url");
}

function sameSecret(left: string, right: string): boolean {
  const leftHash = createHash("sha256").update(left, "utf8").digest();
  const rightHash = createHash("sha256").update(right, "utf8").digest();
  return timingSafeEqual(leftHash, rightHash);
}
