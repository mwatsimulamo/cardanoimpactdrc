import type { AdminTeamRecord } from "@/lib/published-records";

const BOM = "\uFEFF";

export function adminTeamsCsv(teams: readonly AdminTeamRecord[]): string {
  const header = ["team_name", "team_status", "city", "country", "member_count", "submitted_at"];
  const lines = teams.map((team) =>
    csvLine([
      team.name,
      team.status,
      team.city,
      team.country,
      String(team.members.length),
      team.submittedAt.slice(0, 10),
    ]),
  );
  return `${BOM}${[header.join(","), ...lines].join("\r\n")}\r\n`;
}

export function adminMembersCsv(teams: readonly AdminTeamRecord[]): string {
  const header = [
    "team_name",
    "given_name",
    "family_name",
    "email",
    "member_role",
    "forum_username",
    "forum_profile_url",
    "forum_status",
  ];
  const lines = teams.flatMap((team) =>
    team.members.map((member) =>
      csvLine([
        team.name,
        member.givenName,
        member.familyName,
        member.email,
        member.role,
        member.forumUsername,
        member.forumProfileUrl,
        member.forumStatus,
      ]),
    ),
  );
  return `${BOM}${[header.join(","), ...lines].join("\r\n")}\r\n`;
}

export function adminArticlesCsv(teams: readonly AdminTeamRecord[]): string {
  const header = ["team_name", "title", "url", "article_status", "submitted_at"];
  const lines = teams
    .filter((team) => team.articleTitle.length > 0 || team.articleUrl.length > 0)
    .map((team) =>
      csvLine([
        team.name,
        team.articleTitle,
        team.articleUrl,
        team.articleStatus || "submitted",
        team.submittedAt.slice(0, 10),
      ]),
    );
  return `${BOM}${[header.join(","), ...lines].join("\r\n")}\r\n`;
}

export function exportFileName(kind: "equipes" | "membres" | "articles", now = new Date()): string {
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, "");
  return `cardano-impact-pot-${kind}-${stamp}.csv`;
}

function csvLine(values: readonly string[]): string {
  return values.map(csvCell).join(",");
}

function csvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
