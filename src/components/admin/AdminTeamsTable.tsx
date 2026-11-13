"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "@/components/ExternalLink";
import { fieldControl, fieldLabel, secondaryLink, supportText, textLink } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import type { AdminTeamRecord } from "@/lib/published-records";

const teamStatusLabel: Record<string, string> = {
  submitted: "soumise",
  suspended: "suspendue",
  rejected: "rejetée",
};

type Row = {
  key: string;
  search: string;
  teamName: string;
  city: string;
  status: string;
  memberName: string;
  role: string;
  email: string;
  forumUsername: string;
  forumProfileUrl: string;
  articleTitle: string;
  articleUrl: string;
  accessCode: string;
};

export function AdminTeamsTable({
  teams,
  dictionary,
}: {
  teams: readonly AdminTeamRecord[];
  dictionary: Dictionary;
}) {
  const copy = dictionary.participatingTeams;
  const [query, setQuery] = useState("");
  const rows = useMemo(() => flatten(teams, copy), [teams, copy]);
  const needle = query.trim().toLowerCase();
  const visible = needle.length === 0 ? rows : rows.filter((row) => row.search.includes(needle));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <label className={`min-w-0 flex-1 ${fieldLabel}`}>
          {dictionary.adminUi.search}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={fieldControl}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <a className={secondaryLink} href="/fr/admin/exports/membres">
            {dictionary.adminUi.exportMembers}
          </a>
          <a className={secondaryLink} href="/fr/admin/exports/equipes">
            {dictionary.adminUi.exportTeams}
          </a>
          <a className={secondaryLink} href="/fr/admin/exports/articles">
            {dictionary.adminUi.exportArticles}
          </a>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className={supportText}>Aucune équipe pour cette recherche.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="min-w-full border-collapse text-left text-[0.9375rem]">
            <thead className="bg-surface text-ink">
              <tr>
                <th className="border-b border-line px-3 py-3 font-semibold">Équipe</th>
                <th className="border-b border-line px-3 py-3 font-semibold">Ville</th>
                <th className="border-b border-line px-3 py-3 font-semibold">État</th>
                <th className="border-b border-line px-3 py-3 font-semibold">Membre</th>
                <th className="border-b border-line px-3 py-3 font-semibold">Rôle</th>
                <th className="border-b border-line px-3 py-3 font-semibold">Courriel</th>
                <th className="border-b border-line px-3 py-3 font-semibold">Cardano Forum</th>
                <th className="border-b border-line px-3 py-3 font-semibold">Article</th>
                <th className="border-b border-line px-3 py-3 font-semibold">Code</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.key} className="align-top odd:bg-canvas even:bg-surface/40">
                  <td className="border-b border-line px-3 py-3 font-semibold text-ink">{row.teamName}</td>
                  <td className="border-b border-line px-3 py-3 text-ink">{row.city}</td>
                  <td className="border-b border-line px-3 py-3 text-muted">
                    {teamStatusLabel[row.status] ?? row.status}
                  </td>
                  <td className="border-b border-line px-3 py-3 text-ink">{row.memberName}</td>
                  <td className="border-b border-line px-3 py-3 text-muted">{row.role}</td>
                  <td className="border-b border-line px-3 py-3">
                    <a className={textLink} href={`mailto:${row.email}`}>
                      {row.email}
                    </a>
                  </td>
                  <td className="border-b border-line px-3 py-3 text-muted">
                    {row.forumProfileUrl ? (
                      <ExternalLink href={row.forumProfileUrl} newTabLabel={dictionary.links.opensNewTab}>
                        {row.forumUsername || row.forumProfileUrl}
                      </ExternalLink>
                    ) : (
                      row.forumUsername || "—"
                    )}
                  </td>
                  <td className="border-b border-line px-3 py-3 text-muted">
                    {row.articleUrl ? (
                      <ExternalLink href={row.articleUrl} newTabLabel={dictionary.links.opensNewTab}>
                        {row.articleTitle || copy.readArticle}
                      </ExternalLink>
                    ) : (
                      row.articleTitle || "—"
                    )}
                  </td>
                  <td className="border-b border-line px-3 py-3 font-mono text-[0.8125rem] text-ink">
                    {row.accessCode || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className={supportText}>
        {dictionary.adminUi.exportHint} {visible.length} ligne(s) affichée(s).
      </p>
    </div>
  );
}

function flatten(teams: readonly AdminTeamRecord[], copy: Dictionary["participatingTeams"]): Row[] {
  return teams.flatMap((team) => {
    const members = team.members.length > 0 ? team.members : [null];
    return members.map((member, index) => {
      const role = member ? roleLabel(copy, member.role) : "—";
      const memberName = member?.name || "—";
      const email = member?.email || "";
      const forumUsername = member?.forumUsername || "";
      const forumProfileUrl = member?.forumProfileUrl || "";
      return {
        key: `${team.id}-${member?.email ?? "empty"}-${index}`,
        search: [
          team.name,
          team.city,
          team.status,
          memberName,
          role,
          email,
          forumUsername,
          forumProfileUrl,
          team.articleTitle,
          team.accessCode,
        ]
          .join(" ")
          .toLowerCase(),
        teamName: team.name,
        city: team.city,
        status: team.status,
        memberName,
        role,
        email,
        forumUsername,
        forumProfileUrl,
        articleTitle: team.articleTitle,
        articleUrl: team.articleUrl,
        accessCode: team.accessCode,
      };
    });
  });
}

function roleLabel(copy: Dictionary["participatingTeams"], role: string): string {
  if (role === "leader") {
    return copy.roleLeader;
  }
  if (role === "deputy") {
    return copy.roleDeputy;
  }
  return copy.roleMember;
}
