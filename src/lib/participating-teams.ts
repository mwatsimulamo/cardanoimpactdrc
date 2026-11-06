import "server-only";

import { isForumUrl } from "@/lib/forum-links";
import { getServiceRoleAuth } from "@/lib/supabase/service-role";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { isMemberRole, type MemberRole, type PublicTeam, type PublicTeamMember } from "@/lib/team-registration";

export type { PublicTeam, PublicTeamMember };

export type PublicTeamRead =
  | { status: "ready"; teams: readonly PublicTeam[] }
  | { status: "error" };

const ROLE_ORDER: Record<MemberRole, number> = {
  leader: 0,
  deputy: 1,
  member: 2,
};

/**
 * Dossier public : nom, membres, identifiants Forum et article.
 * Aucun courriel. Lecture serveur, sans le client temps réel.
 */
export async function readSubmittedPublicTeams(): Promise<PublicTeamRead> {
  const fromDossiers = await readPublicTeamDossiers();
  if (fromDossiers !== null) {
    return fromDossiers;
  }

  const fromMembers = await readTeamsWithMembers();
  if (fromMembers.status === "ready") {
    return fromMembers;
  }

  return readPublicTeamSummaries();
}

async function readPublicTeamDossiers(): Promise<PublicTeamRead | null> {
  try {
    const { url, publishableKey } = getSupabasePublicEnv();
    const endpoint = new URL("/rest/v1/public_team_dossiers", url);
    endpoint.searchParams.set(
      "select",
      "id,name,members,article_title,article_summary,article_url,submitted_at",
    );
    endpoint.searchParams.set("order", "submitted_at.asc");

    const response = await fetch(endpoint, {
      headers: jsonHeaders(publishableKey),
      cache: "no-store",
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      endpoint.searchParams.set("select", "id,name,members,article_title,article_url,submitted_at");
      const retry = await fetch(endpoint, {
        headers: jsonHeaders(publishableKey),
        cache: "no-store",
      });
      if (!retry.ok) {
        return { status: "error" };
      }
      const retryData: unknown = await retry.json();
      if (!Array.isArray(retryData)) {
        return { status: "error" };
      }
      return {
        status: "ready",
        teams: retryData.map((row) => toPublicTeamFromDossier(row)).filter((team) => team.id.length > 0),
      };
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      return { status: "error" };
    }

    return {
      status: "ready",
      teams: data.map((row) => toPublicTeamFromDossier(row)).filter((team) => team.id.length > 0),
    };
  } catch {
    return { status: "error" };
  }
}

async function readTeamsWithMembers(): Promise<PublicTeamRead> {
  try {
    const { url, serviceRoleKey } = getServiceRoleAuth();
    const endpoint = new URL("/rest/v1/teams", url);
    endpoint.searchParams.set(
      "select",
      "id,name,submitted_at,team_members(id,given_name,family_name,member_role,left_at,joined_at,team_member_forum_profiles(forum_username,forum_profile_url)),team_articles(title,summary,url,is_current)",
    );
    endpoint.searchParams.set("status", "eq.submitted");
    endpoint.searchParams.set("order", "submitted_at.asc");

    let response = await fetch(endpoint, {
      headers: jsonHeaders(serviceRoleKey),
      cache: "no-store",
    });

    if (!response.ok) {
      endpoint.searchParams.set(
        "select",
        "id,name,submitted_at,team_members(id,given_name,family_name,member_role,left_at,joined_at,team_member_forum_profiles(forum_username,forum_profile_url)),team_articles(title,url,is_current)",
      );
      response = await fetch(endpoint, {
        headers: jsonHeaders(serviceRoleKey),
        cache: "no-store",
      });
    }

    if (!response.ok) {
      endpoint.searchParams.set(
        "select",
        "id,name,submitted_at,team_members(id,given_name,family_name,member_role,left_at,joined_at)",
      );
      response = await fetch(endpoint, {
        headers: jsonHeaders(serviceRoleKey),
        cache: "no-store",
      });
    }

    if (!response.ok) {
      return { status: "error" };
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      return { status: "error" };
    }

    return {
      status: "ready",
      teams: data.map((row) => toPublicTeamFromEmbed(row)).filter((team) => team.id.length > 0),
    };
  } catch {
    return { status: "error" };
  }
}

async function readPublicTeamSummaries(): Promise<PublicTeamRead> {
  try {
    const { url, publishableKey } = getSupabasePublicEnv();
    const endpoint = new URL("/rest/v1/public_teams", url);
    endpoint.searchParams.set("select", "id,name,member_count");
    endpoint.searchParams.set("order", "name.asc");

    const response = await fetch(endpoint, {
      headers: jsonHeaders(publishableKey),
      cache: "no-store",
    });

    if (!response.ok) {
      return { status: "error" };
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      return { status: "error" };
    }

    return {
      status: "ready",
      teams: data.map((row) => {
        const record = asRecord(row);
        const memberCount = Number(record.member_count);
        return {
          id: stringValue(record.id),
          name: stringValue(record.name),
          memberCount: Number.isFinite(memberCount) ? memberCount : 0,
          members: [],
          articleTitle: null,
          articleSummary: null,
          articleUrl: null,
        };
      }),
    };
  } catch {
    return { status: "error" };
  }
}

function jsonHeaders(key: string): HeadersInit {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
  };
}

function toPublicTeamFromDossier(row: unknown): PublicTeam {
  const record = asRecord(row);
  const members = Array.isArray(record.members)
    ? record.members
        .map((item) => toPublicMemberFromDossier(item))
        .filter((member): member is PublicTeamMember => member !== null)
    : [];

  return {
    id: stringValue(record.id),
    name: stringValue(record.name),
    memberCount: members.length,
    members: sortMembers(members),
    articleTitle: nonempty(record.article_title),
    articleSummary: nonempty(record.article_summary),
    articleUrl: forumLink(record.article_url),
  };
}

function toPublicTeamFromEmbed(row: unknown): PublicTeam {
  const record = asRecord(row);
  const rawMembers = Array.isArray(record.team_members) ? record.team_members : [];
  const members = rawMembers
    .filter((item) => asRecord(item).left_at == null)
    .map((item) => toPublicMemberFromEmbed(item))
    .filter((member): member is PublicTeamMember => member !== null);

  const articles = Array.isArray(record.team_articles) ? record.team_articles : [];
  const current = articles.find((item) => asRecord(item).is_current === true) ?? articles[0];
  const article = asRecord(current);

  return {
    id: stringValue(record.id),
    name: stringValue(record.name),
    memberCount: members.length,
    members: sortMembers(members),
    articleTitle: nonempty(article.title),
    articleSummary: nonempty(article.summary),
    articleUrl: forumLink(article.url),
  };
}

function toPublicMemberFromDossier(row: unknown): PublicTeamMember | null {
  const record = asRecord(row);
  const role = record.role;
  if (!isMemberRole(role)) {
    return null;
  }

  const givenName = stringValue(record.givenName);
  const familyName = stringValue(record.familyName);
  if (givenName.length === 0 || familyName.length === 0) {
    return null;
  }

  return {
    givenName,
    familyName,
    role,
    forumUsername: nonempty(record.forumUsername),
    forumProfileUrl: forumLink(record.forumProfileUrl),
  };
}

function toPublicMemberFromEmbed(row: unknown): PublicTeamMember | null {
  const record = asRecord(row);
  const role = record.member_role;
  if (!isMemberRole(role)) {
    return null;
  }

  const givenName = stringValue(record.given_name);
  const familyName = stringValue(record.family_name);
  if (givenName.length === 0 || familyName.length === 0) {
    return null;
  }

  const forum = asRecord(record.team_member_forum_profiles);
  return {
    givenName,
    familyName,
    role,
    forumUsername: nonempty(forum.forum_username),
    forumProfileUrl: forumLink(forum.forum_profile_url),
  };
}

function sortMembers(members: PublicTeamMember[]): PublicTeamMember[] {
  return [...members].sort((left, right) => ROLE_ORDER[left.role] - ROLE_ORDER[right.role]);
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

function nonempty(value: unknown): string | null {
  const text = stringValue(value);
  return text.length > 0 ? text : null;
}

function forumLink(value: unknown): string | null {
  const text = stringValue(value);
  return text.length > 0 && isForumUrl(text) ? text : null;
}
