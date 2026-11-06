import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import {
  dedupeRecipients,
  normalizeEmail,
  registrationKey,
  scopedMailKey,
  subscriptionDecision,
  type EmailAudience,
  type MailRecipient,
} from "@/lib/email/rules";
import { deliverWithResend } from "@/lib/email/mailer";
import {
  campaignMail,
  leaderRegistrationMail,
  memberRegistrationMail,
  newsletterConfirmMail,
  newsletterSubject,
  registrationSubject,
} from "@/lib/email/copy";
import type { MailBody } from "@/lib/email/template";
import { mailSiteOrigin } from "@/lib/email/origin";
import type { Locale } from "@/lib/locales";

const BATCH = 15;

type StoreFlag = "ok" | "missing" | "error";

type DeliveryRow = {
  id: string;
  campaign_id: string;
  idempotency_key: string;
  recipient_email: string;
  audience: "leader" | "member" | "subscriber";
  team_id: string | null;
  status: "pending" | "sent" | "failed";
  attempt_count: number;
};

type CampaignRow = {
  id: string;
  kind: "registration" | "newsletter_confirm" | "campaign" | "publication";
  subject: string;
  body_note: string;
  public_path: string | null;
  locale: Locale;
};

export type MailBatch = { sent: number; failed: number; remaining: number; availability: StoreFlag };

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function newToken(): string {
  return randomBytes(32).toString("base64url");
}

function classify(error: { code?: string; message?: string } | null): StoreFlag {
  if (!error) {
    return "ok";
  }

  const message = error.message ?? "";
  if (error.code === "PGRST205" || error.code === "42P01" || /schema cache|does not exist|Could not find the table/i.test(message)) {
    return "missing";
  }

  return "error";
}

export async function notifyRegisteredTeam(input: {
  teamId: string;
  locale: Locale;
  accessCode?: string;
}): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const team = await supabase
    .from("teams")
    .select("id,name,team_members(id,given_name,family_name,email,member_role,left_at)")
    .eq("id", input.teamId)
    .maybeSingle();
  if (team.error || !team.data) {
    return;
  }

  const members = Array.isArray(team.data.team_members) ? team.data.team_members : [];
  const active = members.filter((member) => member.left_at === null);
  const leader = active.find((member) => member.member_role === "leader");
  if (!leader) {
    return;
  }

  const code = input.accessCode && input.accessCode.length > 0 ? input.accessCode : await readLeaderCode(input.teamId);
  const leaderName = `${leader.given_name} ${leader.family_name}`.trim();
  const subject = registrationSubject(input.locale, team.data.name);
  const campaign = await insertCampaign({
    kind: "registration",
    subject,
    bodyNote: team.data.name,
    publicPath: `/${input.locale}/equipe`,
    locale: input.locale,
  });
  if (campaign === "missing" || campaign === "error") {
    return;
  }

  const people: MailRecipient[] = active.map((member) => ({
    email: member.email,
    audience: member.member_role === "leader" ? "leader" : "member",
    teamId: input.teamId,
  }));

  await enqueue(campaign, people, (person) => registrationKey(input.teamId, person.email));
  await sendQueued(campaign, {
    leader: code
      ? leaderRegistrationMail({ locale: input.locale, teamName: team.data.name, accessCode: code })
      : null,
    member: memberRegistrationMail({ locale: input.locale, teamName: team.data.name, leaderName }),
  });
}

async function readLeaderCode(teamId: string): Promise<string | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data } = await supabase
    .from("leader_access_challenges")
    .select("access_code")
    .eq("team_id", teamId)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return typeof data?.access_code === "string" && data.access_code.length > 0 ? data.access_code : null;
}

export type SubscribeResult = "saved" | "already" | "invalid" | "missing" | "error";

export async function subscribeNewsletter(input: {
  email: string;
  name: string;
  locale: Locale;
  consent: boolean;
}): Promise<SubscribeResult> {
  if (!input.consent) {
    return "invalid";
  }

  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  if (!email || name.length > 80) {
    return "invalid";
  }

  const supabase = createServiceRoleSupabaseClient();
  const existing = await supabase.from("newsletter_subscribers").select("id,unsubscribed_at").eq("email", email).maybeSingle();
  const availability = classify(existing.error);
  if (availability !== "ok") {
    return availability;
  }

  const decision = subscriptionDecision(
    existing.data ? { unsubscribedAt: existing.data.unsubscribed_at } : null,
  );
  if (decision === "already") {
    return "already";
  }

  const token = newToken();
  const now = new Date().toISOString();
  const row = {
    email,
    display_name: name.length > 0 ? name : null,
    locale: input.locale,
    consent_at: now,
    subscribed_at: now,
    unsubscribed_at: null,
    unsubscribe_token_hash: hashToken(token),
    updated_at: now,
  };
  const saved = decision === "reactivate"
    ? await supabase.from("newsletter_subscribers").update(row).eq("id", existing.data?.id ?? "")
    : await supabase.from("newsletter_subscribers").insert(row);
  if (saved.error?.code === "23505") {
    return "already";
  }
  const savedFlag = classify(saved.error);
  if (savedFlag !== "ok") {
    return savedFlag;
  }

  const campaign = await insertCampaign({
    kind: "newsletter_confirm",
    subject: newsletterSubject(input.locale),
    bodyNote: "Confirmation d'abonnement. Le jeton de désinscription n'est pas conservé.",
    publicPath: null,
    locale: input.locale,
  });
  if (campaign === "missing" || campaign === "error") {
    return "saved";
  }

  const key = scopedMailKey(`newsletter:${campaign}`, email);
  await enqueue(campaign, [{ email, audience: "subscriber", teamId: null }], () => key);
  const url = `${await mailSiteOrigin()}/${input.locale}/desinscription?token=${encodeURIComponent(token)}`;
  await sendPlain(campaign, newsletterConfirmMail({ locale: input.locale, unsubscribeUrl: url }));
  return "saved";
}

export async function unsubscribeNewsletter(token: string): Promise<"done" | "invalid" | "missing" | "error"> {
  const value = token.trim();
  if (value.length < 20 || value.length > 200) {
    return "invalid";
  }

  const supabase = createServiceRoleSupabaseClient();
  const digest = hashToken(value);
  const rows = await supabase
    .from("newsletter_subscribers")
    .select("id,unsubscribe_token_hash,unsubscribed_at")
    .eq("unsubscribe_token_hash", digest)
    .is("unsubscribed_at", null)
    .limit(1);
  const availability = classify(rows.error);
  if (availability !== "ok") {
    return availability;
  }

  const match = (rows.data ?? []).find((row) => safeEqual(row.unsubscribe_token_hash, digest));
  if (!match) {
    return "invalid";
  }

  const saved = await supabase
    .from("newsletter_subscribers")
    .update({ unsubscribed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", match.id)
    .is("unsubscribed_at", null);
  const savedFlag = classify(saved.error);
  return savedFlag === "ok" ? "done" : savedFlag;
}

export async function countAudience(audiences: readonly EmailAudience[]): Promise<number | "missing" | "error"> {
  const people = await collectAudience(audiences);
  if (people === "missing" || people === "error") {
    return people;
  }

  return dedupeRecipients(people).length;
}

export async function sendAdminCampaign(input: {
  subject: string;
  body: string;
  publicPath: string | null;
  audiences: readonly EmailAudience[];
  locale: Locale;
  kind: "campaign" | "publication";
}): Promise<MailBatch> {
  const people = await collectAudience(input.audiences);
  if (people === "missing" || people === "error") {
    return { sent: 0, failed: 0, remaining: 0, availability: people };
  }

  const recipients = dedupeRecipients(people);
  if (recipients.length === 0) {
    return { sent: 0, failed: 0, remaining: 0, availability: "ok" };
  }

  const campaign = await insertCampaign({
    kind: input.kind,
    subject: input.subject,
    bodyNote: input.body,
    publicPath: input.publicPath,
    locale: input.locale,
  });
  if (campaign === "missing" || campaign === "error") {
    return { sent: 0, failed: 0, remaining: recipients.length, availability: campaign };
  }

  await enqueue(campaign, recipients, (person) => scopedMailKey(`${input.kind}:${campaign}`, person.email));
  return sendPlain(
    campaign,
    campaignMail({
      locale: input.locale,
      subject: input.subject,
      body: input.body,
      publicPath: input.publicPath,
      kind: input.kind,
    }),
  );
}

export async function retryFailedDeliveries(): Promise<MailBatch> {
  const supabase = createServiceRoleSupabaseClient();
  const rows = await supabase
    .from("email_deliveries")
    .select("campaign_id")
    .in("status", ["pending", "failed"])
    .order("created_at", { ascending: true })
    .limit(1);
  const availability = classify(rows.error);
  if (availability !== "ok" || !rows.data || rows.data.length === 0) {
    return { sent: 0, failed: 0, remaining: 0, availability };
  }

  const result = await dispatchCampaign(rows.data[0].campaign_id, true);
  return { sent: result.sent, failed: result.failed, remaining: result.remaining, availability: "ok" };
}

export async function listSubscribers(): Promise<
  | { availability: "missing" | "error"; rows: [] }
  | {
      availability: "ready";
      rows: readonly {
        email: string;
        displayName: string;
        locale: string;
        subscribedAt: string;
        unsubscribedAt: string | null;
      }[];
    }
> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("newsletter_subscribers")
    .select("email,display_name,locale,subscribed_at,unsubscribed_at")
    .order("subscribed_at", { ascending: false })
    .limit(500);
  const availability = classify(result.error);
  if (availability !== "ok") {
    return { availability, rows: [] };
  }

  return {
    availability: "ready",
    rows: (result.data ?? []).map((row) => ({
      email: row.email,
      displayName: row.display_name ?? "",
      locale: row.locale,
      subscribedAt: row.subscribed_at,
      unsubscribedAt: row.unsubscribed_at,
    })),
  };
}

export async function readMailStats(): Promise<
  | { availability: "missing" | "error" }
  | {
      availability: "ready";
      activeSubscribers: number;
      sent: number;
      failed: number;
      pending: number;
      recent: readonly { subject: string; kind: string }[];
    }
> {
  const supabase = createServiceRoleSupabaseClient();
  const subscribers = await supabase
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true })
    .is("unsubscribed_at", null);
  const availability = classify(subscribers.error);
  if (availability !== "ok") {
    return { availability };
  }

  const sent = await supabase.from("email_deliveries").select("id", { count: "exact", head: true }).eq("status", "sent");
  const failed = await supabase.from("email_deliveries").select("id", { count: "exact", head: true }).eq("status", "failed");
  const pending = await supabase.from("email_deliveries").select("id", { count: "exact", head: true }).eq("status", "pending");
  const recent = await supabase
    .from("email_campaigns")
    .select("subject,kind")
    .in("kind", ["campaign", "publication"])
    .order("created_at", { ascending: false })
    .limit(4);
  if (classify(sent.error) !== "ok" || classify(failed.error) !== "ok" || classify(pending.error) !== "ok" || classify(recent.error) !== "ok") {
    return { availability: "error" };
  }

  return {
    availability: "ready",
    activeSubscribers: subscribers.count ?? 0,
    sent: sent.count ?? 0,
    failed: failed.count ?? 0,
    pending: pending.count ?? 0,
    recent: (recent.data ?? []).map((row) => ({ subject: row.subject, kind: row.kind })),
  };
}

export async function listTeamRecipients(): Promise<
  | { availability: "missing" | "error"; rows: [] }
  | {
      availability: "ready";
      rows: readonly {
        teamName: string;
        members: readonly { name: string; email: string; role: string }[];
      }[];
    }
> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("teams")
    .select("name,status,team_members(given_name,family_name,email,member_role,left_at)")
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false })
    .limit(100);
  const availability = classify(result.error);
  if (availability !== "ok") {
    return { availability, rows: [] };
  }

  return {
    availability: "ready",
    rows: (result.data ?? []).map((team) => ({
      teamName: team.name,
      members: (Array.isArray(team.team_members) ? team.team_members : [])
        .filter((member) => member.left_at === null)
        .map((member) => ({
          name: `${member.given_name} ${member.family_name}`.trim(),
          email: member.email,
          role: member.member_role,
        })),
    })),
  };
}

export async function listDeliveries(): Promise<
  | { availability: "missing" | "error"; rows: [] }
  | {
      availability: "ready";
      rows: readonly {
        id: string;
        subject: string;
        email: string;
        audience: string;
        status: string;
        error: string;
        updatedAt: string;
      }[];
    }
> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("email_deliveries")
    .select("id,recipient_email,audience,status,last_error,updated_at,email_campaigns(subject)")
    .order("created_at", { ascending: false })
    .limit(200);
  const availability = classify(result.error);
  if (availability !== "ok") {
    return { availability, rows: [] };
  }

  return {
    availability: "ready",
    rows: (result.data ?? []).map((row) => {
      const campaign = row.email_campaigns as { subject?: string } | { subject?: string }[] | null;
      const subject = Array.isArray(campaign) ? campaign[0]?.subject ?? "" : campaign?.subject ?? "";
      return {
        id: row.id,
        subject,
        email: row.recipient_email,
        audience: row.audience,
        status: row.status,
        error: row.last_error ?? "",
        updatedAt: row.updated_at,
      };
    }),
  };
}

async function collectAudience(audiences: readonly EmailAudience[]): Promise<MailRecipient[] | "missing" | "error"> {
  const selected = new Set(audiences);
  const people: MailRecipient[] = [];
  if (selected.has("leaders") || selected.has("members")) {
    const supabase = createServiceRoleSupabaseClient();
    const result = await supabase
      .from("teams")
      .select("id,team_members(email,member_role,left_at)")
      .eq("status", "submitted")
      .limit(100);
    const availability = classify(result.error);
    if (availability !== "ok") {
      return availability;
    }

    for (const team of result.data ?? []) {
      for (const member of Array.isArray(team.team_members) ? team.team_members : []) {
        if (member.left_at !== null) {
          continue;
        }

        const leader = member.member_role === "leader";
        if (leader && selected.has("leaders")) {
          people.push({ email: member.email, audience: "leader", teamId: team.id });
        }
        if (!leader && selected.has("members")) {
          people.push({ email: member.email, audience: "member", teamId: team.id });
        }
      }
    }
  }

  if (selected.has("subscribers")) {
    const supabase = createServiceRoleSupabaseClient();
    const result = await supabase.from("newsletter_subscribers").select("email").is("unsubscribed_at", null).limit(500);
    const availability = classify(result.error);
    if (availability !== "ok") {
      return availability;
    }

    for (const row of result.data ?? []) {
      people.push({ email: row.email, audience: "subscriber", teamId: null });
    }
  }

  return people;
}

async function insertCampaign(input: {
  kind: CampaignRow["kind"];
  subject: string;
  bodyNote: string;
  publicPath: string | null;
  locale: Locale;
}): Promise<string | "missing" | "error"> {
  const supabase = createServiceRoleSupabaseClient();
  const result = await supabase
    .from("email_campaigns")
    .insert({
      kind: input.kind,
      subject: input.subject,
      body_note: input.bodyNote,
      public_path: input.publicPath,
      locale: input.locale,
    })
    .select("id")
    .single();
  const availability = classify(result.error);
  if (availability !== "ok" || !result.data) {
    return availability === "ok" ? "error" : availability;
  }

  return result.data.id;
}

async function enqueue(campaignId: string, people: readonly MailRecipient[], keyFor: (person: MailRecipient) => string) {
  const supabase = createServiceRoleSupabaseClient();
  for (const person of dedupeRecipients(people)) {
    const inserted = await supabase.from("email_deliveries").insert({
      campaign_id: campaignId,
      idempotency_key: keyFor(person),
      recipient_email: person.email,
      audience: person.audience,
      team_id: person.teamId,
      status: "pending",
    });
    if (inserted.error && inserted.error.code !== "23505") {
      return;
    }
  }
}

async function sendQueued(
  campaignId: string,
  texts: { leader: MailBody | null; member: MailBody },
): Promise<MailBatch> {
  return dispatchCampaign(campaignId, false, texts);
}

async function sendPlain(campaignId: string, mail: MailBody): Promise<MailBatch> {
  return dispatchCampaign(campaignId, false, { leader: mail, member: mail, plain: mail });
}

async function dispatchCampaign(
  campaignId: string,
  includeFailed: boolean,
  texts?: { leader: MailBody | null; member: MailBody; plain?: MailBody },
): Promise<MailBatch & { stopped?: boolean }> {
  const supabase = createServiceRoleSupabaseClient();
  const campaign = await supabase.from("email_campaigns").select("id,kind,subject,body_note,public_path,locale").eq("id", campaignId).maybeSingle();
  if (classify(campaign.error) !== "ok" || !campaign.data) {
    return { sent: 0, failed: 0, remaining: 0, availability: classify(campaign.error), stopped: true };
  }

  const statuses = includeFailed ? ["pending", "failed"] : ["pending"];
  const pending = await supabase
    .from("email_deliveries")
    .select("id,campaign_id,idempotency_key,recipient_email,audience,team_id,status,attempt_count")
    .eq("campaign_id", campaignId)
    .in("status", statuses)
    .order("created_at", { ascending: true })
    .limit(BATCH);
  if (classify(pending.error) !== "ok") {
    return { sent: 0, failed: 0, remaining: 0, availability: classify(pending.error), stopped: true };
  }

  let sent = 0;
  let failed = 0;
  let stopped = false;
  for (const row of (pending.data ?? []) as DeliveryRow[]) {
    const mail = await textFor(campaign.data as CampaignRow, row, texts);
    if (!mail) {
      await mark(row, { status: "failed", error: "code_unavailable" });
      failed += 1;
      continue;
    }

    const result = await deliverWithResend({
      to: row.recipient_email,
      subject: campaign.data.subject,
      text: mail.text,
      html: mail.html,
      idempotencyKey: row.idempotency_key,
      unsubscribeUrl: mail.unsubscribeUrl,
    });
    if (result.status === "sent") {
      await mark(row, { status: "sent", error: null, providerId: result.id });
      sent += 1;
      continue;
    }

    await mark(row, { status: "failed", error: result.error });
    failed += 1;
    if (result.error === "rate_limit") {
      stopped = true;
      break;
    }
  }

  const left = await supabase
    .from("email_deliveries")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
    .in("status", ["pending", "failed"]);
  return { sent, failed, remaining: left.count ?? 0, availability: "ok", stopped };
}

async function textFor(
  campaign: CampaignRow,
  row: DeliveryRow,
  provided?: { leader: MailBody | null; member: MailBody; plain?: MailBody },
): Promise<MailBody | null> {
  if (provided?.plain) {
    return provided.plain;
  }

  if (campaign.kind === "registration") {
    const teamName = campaign.body_note;
    if (row.audience === "leader") {
      if (provided?.leader) {
        return provided.leader;
      }

      const code = row.team_id ? await readLeaderCode(row.team_id) : null;
      if (!code) {
        return null;
      }

      return leaderRegistrationMail({ locale: campaign.locale, teamName, accessCode: code });
    }

    if (provided?.member) {
      return provided.member;
    }

    return memberRegistrationMail({
      locale: campaign.locale,
      teamName,
      leaderName: campaign.locale === "en" ? "the team leader" : "le responsable",
    });
  }

  if (campaign.kind === "newsletter_confirm") {
    const token = newToken();
    const supabase = createServiceRoleSupabaseClient();
    await supabase
      .from("newsletter_subscribers")
      .update({ unsubscribe_token_hash: hashToken(token), updated_at: new Date().toISOString() })
      .eq("email", row.recipient_email)
      .is("unsubscribed_at", null);
    return newsletterConfirmMail({
      locale: campaign.locale,
      unsubscribeUrl: `${await mailSiteOrigin()}/${campaign.locale}/desinscription?token=${encodeURIComponent(token)}`,
    });
  }

  return campaignMail({
    locale: campaign.locale,
    subject: campaign.subject,
    body: campaign.body_note,
    publicPath: campaign.public_path,
    kind: campaign.kind === "publication" ? "publication" : "campaign",
  });
}

async function mark(
  row: DeliveryRow,
  input: { status: "sent" | "failed"; error: string | null; providerId?: string },
) {
  const supabase = createServiceRoleSupabaseClient();
  await supabase
    .from("email_deliveries")
    .update({
      status: input.status,
      last_error: input.error,
      provider_id: input.providerId ?? null,
      sent_at: input.status === "sent" ? new Date().toISOString() : null,
      attempt_count: row.attempt_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
