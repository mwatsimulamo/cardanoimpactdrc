import { createHash } from "node:crypto";
import { normalizeEmailAddress } from "@/lib/email-address";

export const emailAudiences = ["leaders", "members", "subscribers"] as const;

export type EmailAudience = (typeof emailAudiences)[number];

export type MailRecipient = {
  email: string;
  audience: "leader" | "member" | "subscriber";
  teamId: string | null;
};

const PUBLIC_PATH = /^\/(fr|en)(\/[a-z0-9-]+)*$/;
const PRIVATE_PATH = /^\/(fr|en)\/(admin|equipe|desinscription)(\/|$)/;

export function normalizeEmail(value: string): string | null {
  return normalizeEmailAddress(value);
}

export function cleanText(value: string, max: number): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

export function parseAudiences(values: readonly string[]): EmailAudience[] {
  const selected = new Set<EmailAudience>();
    for (const value of values) {
      if (value === "teams") {
        selected.add("leaders");
        selected.add("members");
      }
      if (emailAudiences.includes(value as EmailAudience)) {
        selected.add(value as EmailAudience);
      }
    }

  return emailAudiences.filter((item) => selected.has(item));
}

export function isPublicMailPath(value: string): boolean {
  return value.length > 0 && value.length <= 180 && PUBLIC_PATH.test(value) && !PRIVATE_PATH.test(value);
}

export function dedupeRecipients(people: readonly MailRecipient[]): MailRecipient[] {
  const seen = new Set<string>();
  const result: MailRecipient[] = [];
  for (const person of people) {
    const email = normalizeEmail(person.email);
    if (!email || seen.has(email)) {
      continue;
    }

    seen.add(email);
    result.push({ ...person, email });
  }

  return result;
}

export function registrationKey(teamId: string, email: string): string {
  return scopedMailKey(`registration:${teamId}`, email);
}

export function scopedMailKey(scope: string, email: string): string {
  const digest = createHash("sha256")
    .update(normalizeEmail(email) ?? "")
    .digest("hex")
    .slice(0, 32);
  return `${scope}:${digest}`.slice(0, 200);
}

export function subscriptionDecision(existing: { unsubscribedAt: string | null } | null): "already" | "insert" | "reactivate" {
  if (!existing) {
    return "insert";
  }

  return existing.unsubscribedAt === null ? "already" : "reactivate";
}
