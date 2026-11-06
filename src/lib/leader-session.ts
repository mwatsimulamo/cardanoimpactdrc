import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getServiceRoleAuth } from "@/lib/supabase/service-role";

export const LEADER_SESSION_COOKIE = "cip-leader-session";
export const LEADER_CHALLENGE_COOKIE = "cip-leader-challenge";
export const LEADER_SESSION_HOURS = 8;
/** Fin de validité du code d'accès, après l'atelier du 18 décembre 2026. */
export const LEADER_CODE_EXPIRES_AT = Date.parse("2027-01-31T00:00:00.000Z");

export type LeaderSession = {
  teamId: string;
  memberId: string;
};

export type LeaderChallenge = {
  email: string;
  teamId: string;
  memberId: string;
  hash: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function readLeaderSession(): Promise<LeaderSession | null> {
  await connection();
  const cookieStore = await cookies();
  return parseLeaderSession(cookieStore.get(LEADER_SESSION_COOKIE)?.value ?? "");
}

export async function writeLeaderSession(session: LeaderSession) {
  const cookieStore = await cookies();
  cookieStore.set(LEADER_SESSION_COOKIE, signLeaderSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: LEADER_SESSION_HOURS * 60 * 60,
  });
}

export async function clearLeaderSession() {
  const cookieStore = await cookies();
  cookieStore.delete(LEADER_SESSION_COOKIE);
}

export async function readLeaderChallenge(): Promise<LeaderChallenge | null> {
  await connection();
  const cookieStore = await cookies();
  return parseLeaderChallenge(cookieStore.get(LEADER_CHALLENGE_COOKIE)?.value ?? "");
}

export async function writeLeaderChallenge(challenge: LeaderChallenge) {
  const cookieStore = await cookies();
  cookieStore.set(LEADER_CHALLENGE_COOKIE, signLeaderChallenge(challenge), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: leaderCodeMaxAge(),
  });
}

export async function clearLeaderChallenge() {
  const cookieStore = await cookies();
  cookieStore.delete(LEADER_CHALLENGE_COOKIE);
}

export function signLeaderSession(session: LeaderSession, now?: number): string {
  const issuedAt = now ?? Date.now();
  const payload = Buffer.from(
    JSON.stringify({
      v: 1,
      kind: "session",
      teamId: session.teamId,
      memberId: session.memberId,
      exp: Math.floor(issuedAt / 1000) + LEADER_SESSION_HOURS * 60 * 60,
    }),
    "utf8",
  ).toString("base64url");

  return `${payload}.${signPayload(payload)}`;
}

export function parseLeaderSession(token: string, now?: number): LeaderSession | null {
  if (token.length === 0) {
    return null;
  }

  const body = readSignedBody(token, now ?? Date.now());
  if (body === null || body.kind !== "session") {
    return null;
  }

  if (typeof body.teamId !== "string" || typeof body.memberId !== "string") {
    return null;
  }

  if (!UUID.test(body.teamId) || !UUID.test(body.memberId)) {
    return null;
  }

  return { teamId: body.teamId, memberId: body.memberId };
}

export function signLeaderChallenge(challenge: LeaderChallenge): string {
  const payload = Buffer.from(
    JSON.stringify({
      v: 1,
      kind: "challenge",
      email: challenge.email,
      teamId: challenge.teamId,
      memberId: challenge.memberId,
      hash: challenge.hash,
      exp: Math.floor(LEADER_CODE_EXPIRES_AT / 1000),
    }),
    "utf8",
  ).toString("base64url");

  return `${payload}.${signPayload(payload)}`;
}

export function parseLeaderChallenge(token: string, now?: number): LeaderChallenge | null {
  if (token.length === 0) {
    return null;
  }

  const body = readSignedBody(token, now ?? Date.now());
  if (body === null || body.kind !== "challenge") {
    return null;
  }

  if (
    typeof body.email !== "string" ||
    typeof body.hash !== "string" ||
    typeof body.teamId !== "string" ||
    typeof body.memberId !== "string"
  ) {
    return null;
  }

  if (!UUID.test(body.teamId) || !UUID.test(body.memberId) || body.hash.length < 32) {
    return null;
  }

  return {
    email: body.email,
    teamId: body.teamId,
    memberId: body.memberId,
    hash: body.hash,
  };
}

function readSignedBody(token: string, now: number): Record<string, unknown> | null {
  const separator = token.lastIndexOf(".");
  if (separator < 1) {
    return null;
  }

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = signPayload(payload);

  if (!safeEqual(signature, expected)) {
    return null;
  }

  try {
    const body: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof body !== "object" || body === null) {
      return null;
    }

    const record = body as { v?: unknown; exp?: unknown };
    if (record.v !== 1 || typeof record.exp !== "number" || record.exp * 1000 <= now) {
      return null;
    }

    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

function leaderCodeMaxAge(now = Date.now()): number {
  return Math.max(60, Math.floor((LEADER_CODE_EXPIRES_AT - now) / 1000));
}

function signPayload(payload: string): string {
  const { serviceRoleKey } = getServiceRoleAuth();
  return createHmac("sha256", serviceRoleKey).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
