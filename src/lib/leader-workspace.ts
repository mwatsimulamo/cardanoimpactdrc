import "server-only";

import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { articleWindow } from "@/lib/article-window";
import {
  ARTICLE_SUMMARY_MAX,
  ARTICLE_TITLE_MAX,
  FORUM_USERNAME_MAX,
  isForumUrl,
  isForumUsername,
} from "@/lib/forum-links";
import {
  clearLeaderChallenge,
  clearLeaderSession,
  readLeaderChallenge,
  readLeaderSession,
  writeLeaderChallenge,
  writeLeaderSession,
  LEADER_CODE_EXPIRES_AT,
} from "@/lib/leader-session";
import { getServiceRoleAuth } from "@/lib/supabase/service-role";
import type {
  ArticleStatus,
  ForumProfileStatus,
  LeaderMember,
  LeaderTeam,
  TeamLifecycleStatus,
} from "@/lib/leader-types";
import { isMemberRole, isPlausibleEmail, normalizeEmail, type MemberRole } from "@/lib/team-registration";

export type { ArticleStatus, ForumProfileStatus, LeaderMember, LeaderTeam, TeamLifecycleStatus };

export type LeaderAccessResult = { status: "ok"; code?: string } | { status: "error" };
export type LeaderVerifyResult =
  | { status: "ok"; team: LeaderTeam }
  | { status: "invalid" }
  | { status: "error" };
export type LeaderSaveResult =
  | { status: "ok"; team: LeaderTeam }
  | { status: "invalid" }
  | { status: "closed" }
  | { status: "error" };

const CODE_DIGITS = 6;
const ACCESS_CODE = /^[A-Z]{2}\d{6}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type OpenChallenge = {
  id: string;
  teamId: string;
  memberId: string;
  secretHash: string;
};

export async function loadLeaderTeam(): Promise<LeaderTeam | null> {
  const session = await readLeaderSession();
  if (session === null) {
    return null;
  }

  return readLeaderTeam(session.teamId, session.memberId);
}

export async function requestLeaderAccess(emailInput: string): Promise<LeaderAccessResult> {
  const email = normalizeEmail(emailInput);
  if (!isPlausibleEmail(email)) {
    return { status: "error" };
  }

  try {
    const leader = await findSubmittedLeader(email);
    if (leader === null) {
      return { status: "ok" };
    }

    const code = createAccessCode(leader.teamName);
    const challenge = {
      email,
      teamId: leader.teamId,
      memberId: leader.memberId,
      prefix: teamCodePrefix(leader.teamName),
      code,
      hash: hashSecret(code),
    };
    const stored = await storeLeaderChallenge(challenge);
    if (stored) {
      await clearLeaderChallenge();
    } else {
      await writeLeaderChallenge(challenge);
    }

    return { status: "ok", code };
  } catch {
    return { status: "error" };
  }
}

export async function verifyLeaderAccess(codeInput: string): Promise<LeaderVerifyResult> {
  const code = normalizeAccessCode(codeInput);
  if (!ACCESS_CODE.test(code)) {
    return { status: "invalid" };
  }

  try {
    const hash = hashSecret(code);
    const match = await findOpenChallengeByHash(hash);
    if (match !== null) {
      return openLeaderSession(match.teamId, match.memberId, true);
    }

    const challenge = await readLeaderChallenge();
    if (challenge === null || !safeEqual(challenge.hash, hash)) {
      return { status: "invalid" };
    }

    return openLeaderSession(challenge.teamId, challenge.memberId, false);
  } catch {
    return { status: "error" };
  }
}

export async function signOutLeader() {
  await clearLeaderSession();
}

export async function saveLeaderForumProfiles(
  members: readonly { memberId: string; forumUsername: string; forumProfileUrl: string }[],
): Promise<LeaderSaveResult> {
  const session = await readLeaderSession();
  if (session === null) {
    return { status: "error" };
  }

  const team = await readLeaderTeam(session.teamId, session.memberId);
  if (team === null) {
    return { status: "error" };
  }

  const allowed = new Set(team.members.map((member) => member.id));
  const rows = [];
  for (const member of members) {
    if (!allowed.has(member.memberId)) {
      return { status: "invalid" };
    }

    const username = member.forumUsername.trim();
    const url = member.forumProfileUrl.trim();
    if (username.length === 0 && url.length === 0) {
      rows.push({
        member_id: member.memberId,
        forum_username: null,
        forum_profile_url: null,
        status: "not_provided",
        updated_at: new Date().toISOString(),
      });
      continue;
    }

    if (!isForumUsername(username) || username.length > FORUM_USERNAME_MAX || !isForumUrl(url)) {
      return { status: "invalid" };
    }

    rows.push({
      member_id: member.memberId,
      forum_username: username,
      forum_profile_url: url,
      status: "pending_review",
      updated_at: new Date().toISOString(),
    });
  }

  try {
    const response = await rest("/rest/v1/team_member_forum_profiles?on_conflict=member_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(rows),
    });

    if (!response.ok) {
      return mapWriteError(await response.json().catch(() => null));
    }

    const next = await readLeaderTeam(session.teamId, session.memberId);
    return next === null ? { status: "error" } : { status: "ok", team: next };
  } catch {
    return { status: "error" };
  }
}

export async function submitLeaderArticle(
  titleInput: string,
  summaryInput: string,
  urlInput: string,
): Promise<LeaderSaveResult> {
  if (articleWindow() !== "open") {
    return { status: "closed" };
  }

  const session = await readLeaderSession();
  if (session === null) {
    return { status: "error" };
  }

  const title = titleInput.trim();
  const summary = summaryInput.trim();
  const url = urlInput.trim();
  if (
    title.length === 0 ||
    title.length > ARTICLE_TITLE_MAX ||
    summary.length === 0 ||
    summary.length > ARTICLE_SUMMARY_MAX ||
    !isForumUrl(url)
  ) {
    return { status: "invalid" };
  }

  try {
    const unsetAt = new Date().toISOString();
    const unset = await restPatch(
      `/rest/v1/team_articles?team_id=eq.${session.teamId}&is_current=eq.true`,
      { is_current: false, updated_at: unsetAt },
    );
    if (!unset.ok) {
      return mapWriteError(await unset.json().catch(() => null));
    }

    const row = {
      team_id: session.teamId,
      title,
      url,
      status: "submitted",
      is_current: true,
      submitted_by_member_id: session.memberId,
    };

    let inserted = await restPost("/rest/v1/team_articles", { ...row, summary });
    if (!inserted.ok) {
      const body = await inserted.json().catch(() => null);
      if (isMissingColumn(body, "summary")) {
        inserted = await restPost("/rest/v1/team_articles", row);
      }
      if (!inserted.ok) {
        await restoreCurrentArticle(session.teamId, unsetAt);
        return mapWriteError(body);
      }
    }

    const team = await readLeaderTeam(session.teamId, session.memberId);
    if (team === null) {
      return { status: "error" };
    }

    return {
      status: "ok",
      team: team.articleSummary.length > 0 ? team : { ...team, articleSummary: summary },
    };
  } catch {
    return { status: "error" };
  }
}

async function openLeaderSession(
  teamId: string,
  memberId: string,
  storedInDatabase: boolean,
): Promise<LeaderVerifyResult> {
  const team = await readLeaderTeam(teamId, memberId);
  if (team === null) {
    return { status: "invalid" };
  }

  await writeLeaderSession({ teamId, memberId });
  if (storedInDatabase) {
    await clearLeaderChallenge();
  }
  return { status: "ok", team };
}

async function storeLeaderChallenge(challenge: {
  email: string;
  teamId: string;
  memberId: string;
  prefix: string;
  code: string;
  hash: string;
}): Promise<boolean> {
  const now = new Date().toISOString();
  const retired = await restPatch(
    `/rest/v1/leader_access_challenges?email=eq.${encodeURIComponent(challenge.email)}&used_at=is.null`,
    { used_at: now },
  );
  if (!retired.ok) {
    return false;
  }

  const expiresAt = new Date(LEADER_CODE_EXPIRES_AT).toISOString();
  const base = {
    team_id: challenge.teamId,
    leader_member_id: challenge.memberId,
    email: challenge.email,
    secret_hash: challenge.hash,
    expires_at: expiresAt,
  };
  let inserted = await restPost("/rest/v1/leader_access_challenges", {
    ...base,
    code_prefix: challenge.prefix,
    access_code: challenge.code,
  });
  if (inserted.ok) {
    return true;
  }

  const body = await inserted.json().catch(() => null);
  if (isMissingColumn(body, "access_code")) {
    inserted = await restPost("/rest/v1/leader_access_challenges", {
      ...base,
      code_prefix: challenge.prefix,
    });
    if (inserted.ok) {
      return true;
    }
  }
  if (isMissingColumn(body, "code_prefix") || isMissingColumn(body, "access_code")) {
    inserted = await restPost("/rest/v1/leader_access_challenges", base);
  }
  return inserted.ok;
}

async function findOpenChallengeByHash(hash: string): Promise<OpenChallenge | null> {
  const response = await restGet(
    `/rest/v1/leader_access_challenges?secret_hash=eq.${encodeURIComponent(hash)}&used_at=is.null&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=id,team_id,leader_member_id,secret_hash&limit=1`,
  );
  if (!response.ok) {
    return null;
  }

  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) {
    return null;
  }

  const record = asRecord(rows[0]);
  const id = stringValue(record.id);
  const teamId = stringValue(record.team_id);
  const memberId = stringValue(record.leader_member_id);
  const secretHash = stringValue(record.secret_hash);
  if (
    !UUID.test(id) ||
    !UUID.test(teamId) ||
    !UUID.test(memberId) ||
    secretHash.length < 32 ||
    !safeEqual(secretHash, hash)
  ) {
    return null;
  }

  return { id, teamId, memberId, secretHash };
}

async function findSubmittedLeader(
  email: string,
): Promise<{ teamId: string; memberId: string; teamName: string } | null> {
  const response = await restGet(
    `/rest/v1/team_members?email=eq.${encodeURIComponent(email)}&member_role=eq.leader&left_at=is.null&select=id,team_id,teams!inner(name,status)&teams.status=eq.submitted`,
  );
  if (!response.ok) {
    throw new Error("leader lookup failed");
  }

  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const record = asRecord(rows[0]);
  const teamId = stringValue(record.team_id);
  const memberId = stringValue(record.id);
  const teamName = embedName(record.teams);
  if (teamId.length === 0 || memberId.length === 0 || teamName.length === 0) {
    return null;
  }

  return { teamId, memberId, teamName };
}

async function readLeaderTeam(teamId: string, memberId: string): Promise<LeaderTeam | null> {
  const fullSelect =
    "id,name,city,country,status,team_members(id,given_name,family_name,email,member_role,left_at,joined_at,team_member_forum_profiles(forum_username,forum_profile_url,status)),team_articles(title,summary,url,status,is_current,submitted_at)";
  const withoutSummary =
    "id,name,city,country,status,team_members(id,given_name,family_name,email,member_role,left_at,joined_at,team_member_forum_profiles(forum_username,forum_profile_url,status)),team_articles(title,url,status,is_current,submitted_at)";
  const membersSelect =
    "id,name,city,country,status,team_members(id,given_name,family_name,email,member_role,left_at,joined_at)";

  let response = await restGet(`/rest/v1/teams?id=eq.${teamId}&status=eq.submitted&select=${fullSelect}`);
  if (!response.ok) {
    response = await restGet(`/rest/v1/teams?id=eq.${teamId}&status=eq.submitted&select=${withoutSummary}`);
  }
  if (!response.ok) {
    response = await restGet(`/rest/v1/teams?id=eq.${teamId}&status=eq.submitted&select=${membersSelect}`);
  }
  if (!response.ok) {
    return null;
  }

  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1) {
    return null;
  }

  const record = asRecord(rows[0]);
  const rawMembers = Array.isArray(record.team_members) ? record.team_members : [];
  const members = rawMembers
    .filter((item) => asRecord(item).left_at == null)
    .map((item) => toLeaderMember(item))
    .filter((member): member is LeaderMember => member !== null)
    .sort((left, right) => roleOrder(left.role) - roleOrder(right.role));

  if (!members.some((member) => member.id === memberId && member.role === "leader")) {
    return null;
  }

  const articles = Array.isArray(record.team_articles) ? record.team_articles : [];
  const current = articles.find((item) => asRecord(item).is_current === true);
  const article = asRecord(current);
  const articleStatus = toArticleStatus(article.status, Boolean(current));

  return {
    id: stringValue(record.id),
    name: stringValue(record.name),
    city: stringValue(record.city),
    country: stringValue(record.country),
    status: toTeamStatus(record.status),
    members,
    articleTitle: stringValue(article.title),
    articleSummary: stringValue(article.summary),
    articleUrl: stringValue(article.url),
    articleStatus,
  };
}

function toLeaderMember(row: unknown): LeaderMember | null {
  const record = asRecord(row);
  const role = record.member_role;
  if (!isMemberRole(role)) {
    return null;
  }

  const id = stringValue(record.id);
  const givenName = stringValue(record.given_name);
  const familyName = stringValue(record.family_name);
  if (id.length === 0 || givenName.length === 0 || familyName.length === 0) {
    return null;
  }

  const forum = firstEmbed(record.team_member_forum_profiles);
  return {
    id,
    givenName,
    familyName,
    email: stringValue(record.email),
    role,
    forumUsername: stringValue(forum.forum_username),
    forumProfileUrl: stringValue(forum.forum_profile_url),
    forumStatus: toForumStatus(forum.status),
  };
}

function toForumStatus(value: unknown): ForumProfileStatus {
  if (value === "pending_review" || value === "verified" || value === "mismatch") {
    return value;
  }

  return "not_provided";
}

function toArticleStatus(value: unknown, hasCurrent: boolean): ArticleStatus {
  if (!hasCurrent) {
    return "not_submitted";
  }

  if (value === "verified" || value === "correction_requested" || value === "submitted") {
    return value;
  }

  return "submitted";
}

function toTeamStatus(value: unknown): TeamLifecycleStatus {
  if (value === "suspended" || value === "rejected") {
    return value;
  }

  return "submitted";
}

function roleOrder(role: MemberRole): number {
  if (role === "leader") {
    return 0;
  }

  if (role === "deputy") {
    return 1;
  }

  return 2;
}

function teamCodePrefix(name: string): string {
  const letters = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return (letters + "XX").slice(0, 2);
}

function createAccessCode(teamName: string): string {
  const digits = String(randomInt(0, 10 ** CODE_DIGITS)).padStart(CODE_DIGITS, "0");
  return `${teamCodePrefix(teamName)}${digits}`;
}

function normalizeAccessCode(value: string): string {
  return value.replace(/\s/g, "").toUpperCase();
}

function hashSecret(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

async function restoreCurrentArticle(teamId: string, unsetAt: string) {
  await restPatch(
    `/rest/v1/team_articles?team_id=eq.${teamId}&is_current=eq.false&updated_at=eq.${encodeURIComponent(unsetAt)}`,
    { is_current: true, updated_at: new Date().toISOString() },
  ).catch(() => null);
}

function isMissingColumn(body: unknown, column: string): boolean {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const record = body as { code?: unknown; message?: unknown };
  const message = typeof record.message === "string" ? record.message : "";
  return record.code === "PGRST204" || record.code === "42703" || message.includes(`'${column}' column`);
}

function mapWriteError(body: unknown): LeaderSaveResult {
  if (typeof body !== "object" || body === null) {
    return { status: "error" };
  }

  const record = body as { code?: unknown; message?: unknown };
  const message = typeof record.message === "string" ? record.message : "";
  if (record.code === "23505" || message.includes("incomplete forum profile") || message.includes("invalid article")) {
    return { status: "invalid" };
  }

  return { status: "error" };
}

async function restGet(path: string): Promise<Response> {
  return rest(path, { method: "GET" });
}

async function restPost(path: string, body: unknown): Promise<Response> {
  return rest(path, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
}

async function restPatch(path: string, body: unknown): Promise<Response> {
  return rest(path, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
}

async function rest(path: string, init: RequestInit): Promise<Response> {
  const { url, serviceRoleKey } = getServiceRoleAuth();
  return fetch(new URL(path, url), {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
}

function embedName(value: unknown): string {
  const record = Array.isArray(value) ? asRecord(value[0]) : asRecord(value);
  return stringValue(record.name);
}

function firstEmbed(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) {
    return asRecord(value[0]);
  }

  return asRecord(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return {};
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
