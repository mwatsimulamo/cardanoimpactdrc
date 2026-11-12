import "server-only";

import { unstable_rethrow } from "next/navigation";
import { cache } from "react";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import {
  isEditorialId,
  listActivities,
  listAnnouncements,
  readPhaseFile,
  readResultFile,
  removeActivity,
  removeAnnouncement,
  updateActivity,
  updateAnnouncement,
  writeActivity,
  writeAnnouncement,
  writePhaseFile,
  writeResultFile,
  type EditorialImage,
  type ResultWorkbook,
  type TeamPlace,
} from "@/lib/editorial-store";
import { isForumUrl } from "@/lib/forum-links";
import { readSubmittedPublicTeams } from "@/lib/participating-teams";
import {
  listPublishedRoadmap,
  phaseKeys,
  statusesForPhase,
  type PhaseKey,
  type PublishedRoadmapPhase,
  type RoadmapStatus,
} from "@/lib/program-roadmap";
import type { PublishedAnnouncement, PublishedResult } from "@/lib/public-data";
import { activityCategories, type ActivityCategory } from "@/lib/documented-activities";
import { plainExcerpt, sanitizeRichText } from "@/lib/rich-text";

export type RecordAvailability = "ready" | "missing" | "error";

export type AdminWriteStatus = "ok" | "missing" | "invalid" | "error";

export type AdminAnnouncement = {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  bodyFr: string;
  bodyEn: string;
  status: string;
};

export type AdminTeamOption = {
  id: string;
  name: string;
};

export type AdminTeamMember = {
  name: string;
  role: string;
  email: string;
  forumUsername: string;
  forumProfileUrl: string;
};

export type AdminTeamRecord = {
  id: string;
  name: string;
  city: string;
  status: string;
  members: readonly AdminTeamMember[];
  articleTitle: string;
  articleUrl: string;
  accessCode: string;
};

export type AdminResultDraft = {
  statementFr: string;
  statementEn: string;
  place1: string;
  place2: string;
  place3: string;
  status: string;
  workbookName: string;
  teamPlaces: readonly TeamPlace[];
};

export type AdminActivityDraft = {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  occurredOn: string;
  status: string;
  hasImage: boolean;
  updatedAt: string;
};

export type AdminHistoryRow = {
  id: string;
  action: string;
  summary: string;
  createdAt: string;
};

const PHASE_STATUS = new Set<RoadmapStatus>(["upcoming", "open", "current", "done", "closed", "postponed"]);

export async function readPublishedRoadmap(): Promise<{
  availability: RecordAvailability;
  phases: readonly PublishedRoadmapPhase[];
}> {
  const phases = listPublishedRoadmap().map((phase) => ({ ...phase }));
  const stored = await readPhaseFile();
  if (stored === "missing" || stored === "error") {
    return { availability: stored, phases };
  }

  return {
    availability: "ready",
    phases: phases.map((phase) => {
      const status = stored[phase.key];
      return PHASE_STATUS.has(status as RoadmapStatus) ? { ...phase, status: status as RoadmapStatus } : phase;
    }),
  };
}

export async function savePhaseStatus(phaseKey: string, status: string): Promise<AdminWriteStatus> {
  if (!phaseKeys.includes(phaseKey as PhaseKey) || !PHASE_STATUS.has(status as RoadmapStatus)) {
    return "invalid";
  }

  const key = phaseKey as PhaseKey;
  const next = status as RoadmapStatus;
  if (!statusesForPhase(key).includes(next)) {
    return "invalid";
  }

  const current = await readPhaseFile();
  if (current === "missing" || current === "error") {
    return current;
  }

  return writePhaseFile({ ...current, [phaseKey]: next });
}

export async function readPublishedAnnouncements(): Promise<readonly PublishedAnnouncement[]> {
  const records = await listAnnouncements();
  if (records === "missing" || records === "error") {
    return [];
  }

  return records
    .filter((row) => row.status === "published" && row.publishedAt && row.title.trim().length > 0)
    .map((row) => ({
      slug: row.slug,
      publishedAt: row.publishedAt ?? "",
      title: { fr: row.title, en: row.title },
      body: { fr: row.body, en: row.body },
    }))
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export async function readAdminAnnouncements(): Promise<{
  availability: RecordAvailability;
  items: readonly AdminAnnouncement[];
}> {
  const records = await listAnnouncements();
  if (records === "missing" || records === "error") {
    return { availability: records, items: [] };
  }

  return {
    availability: "ready",
    items: [...records]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((row) => ({
        id: row.id,
        slug: row.slug,
        titleFr: row.title,
        titleEn: row.title,
        bodyFr: row.body,
        bodyEn: row.body,
        status: row.status,
      })),
  };
}

export type SavedRecord = {
  status: AdminWriteStatus;
  publicPath: string | null;
};

export async function saveAnnouncement(input: {
  id?: string;
  title: string;
  body: string;
  publish: boolean;
}): Promise<SavedRecord> {
  const title = input.title.trim();
  const body = sanitizeRichText(input.body).trim();
  if (title.length === 0 || title.length > 180 || body.length > 8000 || (input.publish && plainExcerpt(body, 8000).length === 0)) {
    return { status: "invalid", publicPath: null };
  }

  const now = new Date().toISOString();
  if (input.id && isEditorialId(input.id)) {
    const records = await listAnnouncements();
    if (records === "missing" || records === "error") {
      return { status: records, publicPath: null };
    }

    const current = records.find((row) => row.id === input.id);
    if (!current) {
      return { status: "error", publicPath: null };
    }

    const status = input.publish ? "published" : "draft";
    const saved = await updateAnnouncement({
      ...current,
      title,
      body,
      status,
      publishedAt: status === "published" ? current.publishedAt ?? now : null,
      updatedAt: now,
    });
    return {
      status: saved,
      publicPath: saved === "ok" && input.publish ? `/fr/annonces/${current.slug}` : null,
    };
  }

  const slug = uniqueSlug(title);
  const saved = await writeAnnouncement({
    id: crypto.randomUUID(),
    slug,
    title,
    body,
    status: input.publish ? "published" : "draft",
    publishedAt: input.publish ? now : null,
    createdAt: now,
    updatedAt: now,
  });
  return {
    status: saved,
    publicPath: saved === "ok" && input.publish ? `/fr/annonces/${slug}` : null,
  };
}

export async function deleteAnnouncement(id: string): Promise<AdminWriteStatus> {
  return removeAnnouncement(id);
}

export const readPublishedResult = cache(async function readPublishedResult(): Promise<PublishedResult | null> {
  const draft = await readResultFile();
  if (draft === "missing" || draft === "error" || draft === null || draft.status !== "published") {
    return null;
  }

  const ranked = [
    { teamId: draft.place1, place: 1 },
    { teamId: draft.place2, place: 2 },
    { teamId: draft.place3, place: 3 },
    ...draft.teamPlaces.filter((item) => item.teamId !== draft.place1 && item.teamId !== draft.place2 && item.teamId !== draft.place3),
  ];
  const names = await teamNameMap();
  const links = await articleUrlByTeam(ranked.map((item) => item.teamId));
  const submitted = await readSubmittedPublicTeams();
  if (submitted.status === "ready") {
    for (const team of submitted.teams) {
      if (team.articleUrl) {
        links.set(team.id, team.articleUrl);
      }
    }
  }
  const places = ranked
    .map((item) => ({
      teamId: item.teamId,
      name: names.get(item.teamId) ?? "",
      place: item.place,
      articleUrl: links.get(item.teamId) ?? null,
    }))
    .filter((place) => place.name.length > 0)
    .sort((left, right) => left.place - right.place);
  const podium = places.filter((place) => place.place <= 3);
  if (podium.length < 3 || draft.statement.trim().length === 0) {
    return null;
  }

  return {
    places,
    statement: { fr: draft.statement, en: draft.statement },
    hasWorkbook: draft.workbookName.trim().length > 0,
  };
});

export async function readAdminResult(): Promise<{
  availability: RecordAvailability;
  teams: readonly AdminTeamOption[];
  draft: AdminResultDraft;
}> {
  const teams = await readTeamOptions();
  const row = await readResultFile();
  if (row === "missing" || row === "error") {
    return { availability: row, teams: teams.teams, draft: emptyResult() };
  }

  return {
    availability: teams.availability,
    teams: teams.teams,
    draft: {
      statementFr: row?.statement ?? "",
      statementEn: row?.statement ?? "",
      place1: row?.place1 ?? "",
      place2: row?.place2 ?? "",
      place3: row?.place3 ?? "",
      status: row?.status ?? "draft",
      workbookName: row?.workbookName ?? "",
      teamPlaces: row?.teamPlaces ?? [],
    },
  };
}

export async function saveResult(input: {
  statement: string;
  place1: string;
  place2: string;
  place3: string;
  publish: boolean;
  workbook: ResultWorkbook | null;
  teamPlaces: readonly TeamPlace[];
}): Promise<SavedRecord> {
  const statement = sanitizeRichText(input.statement).trim();
  const places = [input.place1, input.place2, input.place3];
  const complete = plainExcerpt(statement, 8000).length > 0 && places.every((id) => id.length > 0) && new Set(places).size === 3;
  const known = await teamNameMap();
  const extraPlaces = new Set<number>();
  const extras = input.teamPlaces ?? [];
  const extrasValid = extras.every((item) => {
    if (!known.has(item.teamId) || places.includes(item.teamId) || extraPlaces.has(item.place)) {
      return false;
    }
    extraPlaces.add(item.place);
    return item.place >= 4 && item.place <= 99;
  });
  if ((input.publish && !complete) || !extrasValid) {
    return { status: "invalid", publicPath: null };
  }

  const now = new Date().toISOString();
  const status = await writeResultFile({
    statement,
    place1: input.place1,
    place2: input.place2,
    place3: input.place3,
    status: input.publish ? "published" : "draft",
    publishedAt: input.publish ? now : null,
    updatedAt: now,
    workbookName: input.workbook?.name ?? "",
    teamPlaces: extras,
  }, input.workbook ?? undefined);
  return {
    status,
    publicPath: status === "ok" && input.publish ? "/fr/resultats" : null,
  };
}

export async function readAdminActivities(): Promise<{
  availability: RecordAvailability;
  items: readonly AdminActivityDraft[];
}> {
  const records = await listActivities();
  if (records === "missing" || records === "error") {
    return { availability: records, items: [] };
  }

  return {
    availability: "ready",
    items: records
      .map((row) => ({
        id: row.id,
        slug: row.slug,
        category: row.category,
        title: row.title,
        description: row.description,
        occurredOn: row.occurredOn,
        status: row.status,
        hasImage: row.hasImage,
        updatedAt: row.updatedAt,
      }))
      .sort((left, right) => right.occurredOn.localeCompare(left.occurredOn)),
  };
}

export async function saveDocumentedActivity(input: {
  id?: string;
  category: string;
  title: string;
  description: string;
  occurredOn: string;
  publish: boolean;
  image: EditorialImage | null;
}): Promise<SavedRecord> {
  if (!activityCategories.includes(input.category as ActivityCategory)) {
    return { status: "invalid", publicPath: null };
  }

  const title = input.title.trim();
  const description = sanitizeRichText(input.description).trim();
  if (title.length === 0 || title.length > 180 || description.length > 8000) {
    return { status: "invalid", publicPath: null };
  }

  const occurredOn = /^\d{4}-\d{2}-\d{2}$/.test(input.occurredOn) ? input.occurredOn : "";
  if (input.publish && (plainExcerpt(description, 8000).length === 0 || occurredOn.length === 0 || occurredOn > todayInGoma())) {
    return { status: "invalid", publicPath: null };
  }

  const now = new Date().toISOString();
  if (input.id && isEditorialId(input.id)) {
    const records = await listActivities();
    if (records === "missing" || records === "error") {
      return { status: records, publicPath: null };
    }

    const current = records.find((row) => row.id === input.id);
    if (!current) {
      return { status: "error", publicPath: null };
    }

    const status = input.publish ? "published" : "draft";
    const saved = await updateActivity(
      {
        ...current,
        category: input.category,
        title,
        description,
        occurredOn,
        status,
        publishedAt: status === "published" ? current.publishedAt ?? now : null,
        updatedAt: now,
        hasImage: input.image ? true : current.hasImage,
        imageType: input.image?.type ?? current.imageType,
      },
      input.image,
    );
    return {
      status: saved,
      publicPath: saved === "ok" && input.publish ? `/fr/activites/${current.slug}` : null,
    };
  }

  const slug = uniqueSlug(title);
  const saved = await writeActivity(
    {
      id: crypto.randomUUID(),
      slug,
      category: input.category,
      title,
      description,
      occurredOn,
      status: input.publish ? "published" : "draft",
      publishedAt: input.publish ? now : null,
      createdAt: now,
      updatedAt: now,
      hasImage: input.image !== null,
      imageType: input.image?.type ?? "",
    },
    input.image,
  );
  return {
    status: saved,
    publicPath: saved === "ok" && input.publish ? `/fr/activites/${slug}` : null,
  };
}

export async function deleteActivity(id: string): Promise<AdminWriteStatus> {
  return removeActivity(id);
}

export async function readAdminTeams(): Promise<{
  availability: RecordAvailability;
  teams: readonly AdminTeamRecord[];
}> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase
      .from("teams")
      .select(
        "id,name,city,status,submitted_at,team_members(given_name,family_name,email,member_role,left_at,team_member_forum_profiles(forum_username,forum_profile_url)),team_articles(title,url,is_current)",
      )
      .order("submitted_at", { ascending: true });
    if (error) {
      return { availability: isMissing(error) ? "missing" : "error", teams: [] };
    }

    const codes = await readAccessCodes();
    const teams = (data ?? []).map((row) => toAdminTeam(row, codes));
    return { availability: "ready", teams };
  } catch {
    return { availability: "error", teams: [] };
  }
}

export async function readTeamOptions(): Promise<{
  availability: RecordAvailability;
  teams: readonly AdminTeamOption[];
}> {
  const result = await selectRows<{ id: string; name: string; status: string }>("teams", "id,name,status");
  if (result.availability !== "ready") {
    return { availability: result.availability, teams: [] };
  }

  return {
    availability: "ready",
    teams: result.rows
      .filter((row) => row.status === "submitted")
      .map((row) => ({ id: row.id, name: row.name })),
  };
}

export async function readAdminHistory(): Promise<{
  availability: RecordAvailability;
  rows: readonly AdminHistoryRow[];
}> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase
      .from("team_activity_logs")
      .select("id,action,summary,created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) {
      return { availability: isMissing(error) ? "missing" : "error", rows: [] };
    }

    return {
      availability: "ready",
      rows: (data ?? []).map((row) => ({
        id: String(row.id),
        action: String(row.action),
        summary: String(row.summary),
        createdAt: String(row.created_at),
      })),
    };
  } catch {
    return { availability: "error", rows: [] };
  }
}

export async function readAdminCounts(): Promise<{
  teams: string;
  participants: string;
  articles: string;
  results: string;
}> {
  const teams = await readAdminTeams();
  const result = await readResultFile();
  if (teams.availability !== "ready") {
    return { teams: "—", participants: "—", articles: "—", results: "—" };
  }

  const participants = teams.teams.reduce((total, team) => total + team.members.length, 0);
  const articles = teams.teams.filter((team) => team.articleUrl.length > 0).length;
  return {
    teams: String(teams.teams.length),
    participants: String(participants),
    articles: String(articles),
    results: result !== "missing" && result !== "error" && result?.status === "published" ? "1" : "0",
  };
}

function emptyResult(): AdminResultDraft {
  return { statementFr: "", statementEn: "", place1: "", place2: "", place3: "", status: "draft", workbookName: "", teamPlaces: [] };
}

async function articleUrlByTeam(ids: readonly string[]): Promise<Map<string, string>> {
  const links = new Map<string, string>();
  const wanted = ids.filter((id) => id.length > 0);
  if (wanted.length === 0) {
    return links;
  }

  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase.from("team_articles").select("team_id,url,is_current").in("team_id", wanted);
    if (error || !data) {
      return links;
    }

    const current = new Map<string, string>();
    const fallback = new Map<string, string>();
    for (const row of data) {
      const teamId = typeof row.team_id === "string" ? row.team_id : "";
      const url = typeof row.url === "string" && isForumUrl(row.url) ? row.url : "";
      if (teamId.length === 0 || url.length === 0) {
        continue;
      }
      if (row.is_current === true) {
        current.set(teamId, url);
      } else if (!fallback.has(teamId)) {
        fallback.set(teamId, url);
      }
    }

    for (const id of wanted) {
      const url = current.get(id) ?? fallback.get(id);
      if (url) {
        links.set(id, url);
      }
    }
    return links;
  } catch (error) {
    unstable_rethrow(error);
    return links;
  }
}

function todayInGoma(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lubumbashi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function teamNameMap(): Promise<Map<string, string>> {
  const result = await selectRows<{ id: string; name: string }>("teams", "id,name");
  if (result.availability !== "ready") {
    return new Map();
  }

  return new Map(result.rows.map((row) => [row.id, row.name]));
}

async function readAccessCodes(): Promise<Map<string, string>> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase
      .from("leader_access_challenges")
      .select("team_id,access_code,used_at,created_at")
      .is("used_at", null)
      .order("created_at", { ascending: false });
    if (error || !data) {
      return new Map();
    }

    const codes = new Map<string, string>();
    for (const row of data) {
      const teamId = String(row.team_id);
      const code = typeof row.access_code === "string" ? row.access_code : "";
      if (!codes.has(teamId) && code.length > 0) {
        codes.set(teamId, code);
      }
    }
    return codes;
  } catch {
    return new Map();
  }
}

function toAdminTeam(row: unknown, codes: Map<string, string>): AdminTeamRecord {
  const record = asRecord(row);
  const members = Array.isArray(record.team_members) ? record.team_members : [];
  const active = members.filter((item) => asRecord(item).left_at == null);
  const articles = Array.isArray(record.team_articles) ? record.team_articles : [];
  const current = articles.find((item) => asRecord(item).is_current === true) ?? articles[0];
  const article = asRecord(current);
  const id = stringValue(record.id);
  return {
    id,
    name: stringValue(record.name),
    city: stringValue(record.city),
    status: stringValue(record.status),
    members: active.map((item) => {
      const member = asRecord(item);
      const forum = asRecord(member.team_member_forum_profiles);
      return {
        name: `${stringValue(member.given_name)} ${stringValue(member.family_name)}`.trim(),
        role: stringValue(member.member_role),
        email: stringValue(member.email),
        forumUsername: stringValue(forum.forum_username),
        forumProfileUrl: stringValue(forum.forum_profile_url),
      };
    }),
    articleTitle: stringValue(article.title),
    articleUrl: stringValue(article.url),
    accessCode: codes.get(id) ?? "",
  };
}

async function selectRows<T>(table: string, columns: string): Promise<{ availability: RecordAvailability; rows: T[] }> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase.from(table).select(columns);
    if (error) {
      return { availability: isMissing(error) ? "missing" : "error", rows: [] };
    }

    return { availability: "ready", rows: (data ?? []) as T[] };
  } catch {
    return { availability: "error", rows: [] };
  }
}

function uniqueSlug(value: string): string {
  const base = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const suffix = Date.now().toString(36).slice(-4);
  return `${base || "fiche"}-${suffix}`;
}

function isMissing(error: { code?: string; message?: string }): boolean {
  const message = error.message ?? "";
  return error.code === "PGRST205" || error.code === "42P01" || /schema cache|does not exist|Could not find the table/i.test(message);
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}
