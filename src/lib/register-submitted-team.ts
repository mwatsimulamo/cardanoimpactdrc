import "server-only";

import { requestLeaderAccess } from "@/lib/leader-workspace";
import { getServiceRoleAuth } from "@/lib/supabase/service-role";
import {
  hasTeamDraftErrors,
  parseTeamDraft,
  sanitizeTeamDraft,
  validateTeamDraft,
  type TeamDraft,
  type TeamDraftErrors,
} from "@/lib/team-registration";

export type SubmitTeamResult =
  | { status: "ok"; teamId: string; accessCode?: string }
  | { status: "invalid"; errors: TeamDraftErrors }
  | { status: "duplicate_email" }
  | { status: "duplicate_name" }
  | { status: "error" };

const validationCodes = {
  required: "required",
  tooLong: "tooLong",
  memberCount: "memberCount",
  oneLeader: "oneLeader",
  maxDeputy: "maxDeputy",
  emailFormat: "emailFormat",
  emailUnique: "emailUnique",
} as const;

export async function registerSubmittedTeam(input: unknown): Promise<SubmitTeamResult> {
  const parsed = parseTeamDraft(input);
  if (parsed === null) {
    return {
      status: "invalid",
      errors: { members: validationCodes.memberCount, memberFields: {} },
    };
  }

  const draft = sanitizeTeamDraft(parsed);
  const errors = validateTeamDraft(draft, validationCodes);
  if (hasTeamDraftErrors(errors)) {
    return { status: "invalid", errors };
  }

  try {
    return await callRegisterFunction(draft);
  } catch {
    return { status: "error" };
  }
}

async function callRegisterFunction(draft: TeamDraft): Promise<SubmitTeamResult> {
  const { url, serviceRoleKey } = getServiceRoleAuth();
  const endpoint = new URL("/rest/v1/rpc/register_submitted_team", url);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payload: {
        name: draft.name,
        city: draft.city,
        country: draft.country,
        members: draft.members,
      },
    }),
    cache: "no-store",
  });

  const body: unknown = await response.json().catch(() => null);

  if (response.ok) {
    if (typeof body === "string" && body.length > 0) {
      return { status: "ok", teamId: body, accessCode: await issueLeaderCode(draft) };
    }
    return { status: "error" };
  }

  return mapRpcError(body);
}

async function issueLeaderCode(draft: TeamDraft): Promise<string | undefined> {
  const leader = draft.members.find((member) => member.role === "leader");
  if (!leader) {
    return undefined;
  }

  try {
    const issued = await requestLeaderAccess(leader.email);
    return issued.status === "ok" ? issued.code : undefined;
  } catch {
    return undefined;
  }
}

function mapRpcError(body: unknown): SubmitTeamResult {
  if (typeof body !== "object" || body === null) {
    return { status: "error" };
  }

  const record = body as { code?: unknown; message?: unknown };
  const code = typeof record.code === "string" ? record.code : "";
  const message = typeof record.message === "string" ? record.message : "";

  if (code === "23505" && message.includes("team_members_active_email_key")) {
    return { status: "duplicate_email" };
  }

  if (code === "23505" && message.includes("teams_submitted_name_key")) {
    return { status: "duplicate_name" };
  }

  if (code === "P0001") {
    return {
      status: "invalid",
      errors: { members: validationCodes.memberCount, memberFields: {} },
    };
  }

  return { status: "error" };
}
