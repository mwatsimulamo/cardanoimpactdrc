import { isValidEmailAddress, normalizeEmailAddress } from "@/lib/email-address";

export type MemberRole = "leader" | "deputy" | "member";

export type TeamMemberDraft = {
  givenName: string;
  familyName: string;
  email: string;
  role: MemberRole;
};

export type TeamDraft = {
  name: string;
  city: string;
  country: string;
  members: TeamMemberDraft[];
};

export type PublicTeamMember = {
  givenName: string;
  familyName: string;
  role: MemberRole;
  forumUsername: string | null;
  forumProfileUrl: string | null;
};

export type PublicTeam = {
  id: string;
  name: string;
  memberCount: number;
  members: readonly PublicTeamMember[];
  articleTitle: string | null;
  articleSummary: string | null;
  articleUrl: string | null;
};

export type TeamDraftErrors = {
  name?: string;
  city?: string;
  country?: string;
  members?: string;
  memberFields: Record<string, string>;
};

export const TEAM_COUNTRY = "République démocratique du Congo";

export const MIN_TEAM_MEMBERS = 3;
export const MAX_TEAM_MEMBERS = 5;
export const TEAM_NAME_MAX = 120;
export const TEAM_PLACE_MAX = 80;
export const PERSON_NAME_MAX = 80;
export const EMAIL_MAX = 254;

const MEMBER_ROLES: readonly MemberRole[] = ["leader", "deputy", "member"];

export function emptyMember(role: MemberRole = "member"): TeamMemberDraft {
  return {
    givenName: "",
    familyName: "",
    email: "",
    role,
  };
}

export function emptyTeamDraft(): TeamDraft {
  return {
    name: "",
    city: "",
    country: TEAM_COUNTRY,
    members: [emptyMember("leader"), emptyMember("member"), emptyMember("member")],
  };
}

export function normalizeEmail(value: string): string {
  return normalizeEmailAddress(value) ?? value.trim().toLowerCase();
}

export function isPlausibleEmail(value: string): boolean {
  return value.trim().length <= EMAIL_MAX && isValidEmailAddress(value);
}

export function isMemberRole(value: unknown): value is MemberRole {
  return MEMBER_ROLES.some((role) => role === value);
}

export function parseTeamDraft(input: unknown): TeamDraft | null {
  if (typeof input !== "object" || input === null) {
    return null;
  }

  const record = input as Record<string, unknown>;
  if (
    typeof record.name !== "string" ||
    typeof record.city !== "string" ||
    !Array.isArray(record.members)
  ) {
    return null;
  }

  const members: TeamMemberDraft[] = [];
  for (const item of record.members) {
    if (typeof item !== "object" || item === null) {
      return null;
    }

    const member = item as Record<string, unknown>;
    if (
      typeof member.givenName !== "string" ||
      typeof member.familyName !== "string" ||
      typeof member.email !== "string" ||
      !isMemberRole(member.role)
    ) {
      return null;
    }

    members.push({
      givenName: member.givenName,
      familyName: member.familyName,
      email: member.email,
      role: member.role,
    });
  }

  return {
    name: record.name,
    city: record.city,
    country: typeof record.country === "string" ? record.country : TEAM_COUNTRY,
    members,
  };
}

export function sanitizeTeamDraft(draft: TeamDraft): TeamDraft {
  return {
    name: draft.name.trim(),
    city: draft.city.trim(),
    country: TEAM_COUNTRY,
    members: draft.members.map((member) => ({
      givenName: member.givenName.trim(),
      familyName: member.familyName.trim(),
      email: normalizeEmail(member.email),
      role: member.role,
    })),
  };
}

export function memberFieldKey(index: number, field: keyof TeamMemberDraft): string {
  return `${index}.${field}`;
}

export function validateTeamDraft(
  draft: TeamDraft,
  messages: TeamValidationCopy,
): TeamDraftErrors {
  const errors: TeamDraftErrors = { memberFields: {} };
  const name = draft.name.trim();
  const city = draft.city.trim();

  if (name.length === 0) {
    errors.name = messages.required;
  } else if (name.length > TEAM_NAME_MAX) {
    errors.name = messages.tooLong;
  }

  if (city.length === 0) {
    errors.city = messages.required;
  } else if (city.length > TEAM_PLACE_MAX) {
    errors.city = messages.tooLong;
  }

  if (draft.members.length < MIN_TEAM_MEMBERS || draft.members.length > MAX_TEAM_MEMBERS) {
    errors.members = messages.memberCount;
  }

  const emails: string[] = [];
  let leaders = 0;
  let deputies = 0;

  draft.members.forEach((member, index) => {
    const givenName = member.givenName.trim();
    if (givenName.length === 0) {
      errors.memberFields[memberFieldKey(index, "givenName")] = messages.required;
    } else if (givenName.length > PERSON_NAME_MAX) {
      errors.memberFields[memberFieldKey(index, "givenName")] = messages.tooLong;
    }

    const familyName = member.familyName.trim();
    if (familyName.length === 0) {
      errors.memberFields[memberFieldKey(index, "familyName")] = messages.required;
    } else if (familyName.length > PERSON_NAME_MAX) {
      errors.memberFields[memberFieldKey(index, "familyName")] = messages.tooLong;
    }

    const email = normalizeEmail(member.email);
    if (member.email.trim().length === 0) {
      errors.memberFields[memberFieldKey(index, "email")] = messages.required;
    } else if (!isPlausibleEmail(member.email)) {
      errors.memberFields[memberFieldKey(index, "email")] = messages.emailFormat;
    } else if (emails.includes(email)) {
      errors.memberFields[memberFieldKey(index, "email")] = messages.emailUnique;
    } else {
      emails.push(email);
    }

    if (member.role === "leader") {
      leaders += 1;
    }

    if (member.role === "deputy") {
      deputies += 1;
    }
  });

  if (leaders !== 1) {
    errors.members = errors.members ?? messages.oneLeader;
  }

  if (deputies > 1) {
    errors.members = errors.members ?? messages.maxDeputy;
  }

  return errors;
}

export function hasTeamDraftErrors(errors: TeamDraftErrors): boolean {
  return (
    Boolean(errors.name) ||
    Boolean(errors.city) ||
    Boolean(errors.country) ||
    Boolean(errors.members) ||
    Object.keys(errors.memberFields).length > 0
  );
}

export type TeamValidationCopy = {
  required: string;
  tooLong: string;
  memberCount: string;
  oneLeader: string;
  maxDeputy: string;
  emailFormat: string;
  emailUnique: string;
};
