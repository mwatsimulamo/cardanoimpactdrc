import Link from "next/link";
import { StatusMessage } from "@/components/StatusMessage";
import type { Dictionary } from "@/content/types";
import type { MemberRole, PublicTeam } from "@/lib/team-registration";

export type PublicTeamsStatus = "loading" | "error" | "ready";

export type PublicTeamRank = {
  teamId: string;
  place: number;
};

export function placeAppearance(place: number | undefined) {
  if (place === 1 || place === 2 || place === 3) {
    return {
      card: "border border-[#1f7a4d] bg-[#e7f6ee]",
      line: "border-[#b7e0c8]",
      title: "text-[#0f5c38]",
      quiet: "text-[#146c43]",
      badge: "bg-[#1f7a4d] text-white",
      count: "bg-white text-[#146c43]",
    };
  }

  if (place === 4 || place === 5) {
    return {
      card: "border border-[#e2c15a] bg-[#fff8df]",
      line: "border-[#ead78a]",
      title: "text-[#6b5300]",
      quiet: "text-[#7a6240]",
      badge: "bg-[#F7D117] text-[#1b2430]",
      count: "bg-white text-[#6b5300]",
    };
  }

  return {
    card: "border border-[#d5dce6] bg-white",
    line: "border-[#d5dce6]",
    title: "text-[#1b2430]",
    quiet: "text-[#3e4c63]",
    badge: "bg-[#0033ad] text-white",
    count: "bg-[#f4f7fb] text-[#3e4c63]",
  };
}

const articleButton =
  "inline-flex min-h-12 w-full items-center justify-center rounded-[2px] bg-[#0033ad] px-4 text-center text-[0.9375rem] font-semibold text-white transition-colors duration-150 hover:bg-[#002688] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0033ad]";

export function ForumArticleButton({
  href,
  label,
  newTabLabel,
}: {
  href: string;
  label: string;
  newTabLabel: string;
}) {
  return (
    <a className={articleButton} href={href} target="_blank" rel="noopener noreferrer">
      {label}
      <span className="sr-only"> ({newTabLabel})</span>
    </a>
  );
}

export function ResultsWorkbookButton({ label }: { label: string }) {
  return (
    <Link className={articleButton} href="/media/results/workbook">
      {label}
    </Link>
  );
}

export function PublicTeamsBoard({
  teams,
  copy,
  newTabLabel,
  ranks = [],
  status = "ready",
}: {
  teams: readonly PublicTeam[];
  copy: Dictionary["participatingTeams"];
  newTabLabel: string;
  ranks?: readonly PublicTeamRank[];
  status?: PublicTeamsStatus;
}) {
  if (status === "loading") {
    return (
      <div className="mt-10">
        <StatusMessage>{copy.loading}</StatusMessage>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-10">
        <StatusMessage tone="danger">{copy.error}</StatusMessage>
      </div>
    );
  }

  if (teams.length === 0) {
    return <p className="mt-10 text-base leading-[1.7] text-[#1b2430] hyphens-auto text-pretty md:text-justify">{copy.empty}</p>;
  }

  const rankByTeam = new Map(ranks.map((rank) => [rank.teamId, rank.place]));
  const ordered = [...teams].sort((left, right) => comparePlaces(rankByTeam.get(left.id), rankByTeam.get(right.id)));

  return (
    <div className="mt-10">
      <p className="text-[0.9375rem] font-semibold text-[#0033ad]">
        <span className="tabular-nums">{teams.length}</span> {copy.rosterCount}
      </p>
      <ul className="mt-4 grid items-stretch gap-4 md:grid-cols-2">
        {ordered.map((team) => {
          const place = rankByTeam.get(team.id);
          const tone = placeAppearance(place);
          return (
            <li key={team.id} className={`flex h-full flex-col ${tone.card}`}>
              <div className={`flex items-start justify-between gap-4 border-b px-5 py-4 ${tone.line}`}>
                <div className="flex min-w-0 items-start gap-3">
                  {place ? <RankMark place={place} label={placeLabel(copy, place)} badge={tone.badge} /> : null}
                  <h3 className={`text-[1.25rem] font-semibold leading-[1.3] ${tone.title}`}>{team.name}</h3>
                </div>
                <p className={`shrink-0 rounded-[2px] px-2.5 py-1 text-[0.8125rem] font-semibold ${tone.count}`}>
                  <span className="tabular-nums">{shownCount(team)}</span> {copy.memberCount}
                </p>
              </div>
              <div className="flex flex-1 flex-col px-5 py-4">
                {team.members.length > 0 ? (
                  <ul className="space-y-2">
                    {team.members.map((member, memberIndex) => (
                      <li
                        key={`${team.id}-${memberIndex}-${member.role}-${member.givenName}-${member.familyName}`}
                        className="flex items-center justify-between gap-3"
                      >
                        <p className={`min-w-0 font-semibold ${tone.title}`}>
                          {member.givenName} {member.familyName}
                        </p>
                        <RoleBadge role={member.role} label={roleLabel(copy, member.role)} />
                      </li>
                    ))}
                  </ul>
                ) : null}
                <Subject team={team} copy={copy} newTabLabel={newTabLabel} title={tone.title} quiet={tone.quiet} line={tone.line} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Subject({
  team,
  copy,
  newTabLabel,
  title,
  quiet,
  line,
}: {
  team: PublicTeam;
  copy: Dictionary["participatingTeams"];
  newTabLabel: string;
  title: string;
  quiet: string;
  line: string;
}) {
  const hasSubject = Boolean(team.articleTitle || team.articleSummary);

  return (
    <div className={`mt-auto space-y-3 border-t pt-4 ${line}`}>
      {team.articleTitle ? (
        <p className={`text-base font-semibold leading-[1.45] hyphens-auto text-pretty md:text-justify ${title}`}>{team.articleTitle}</p>
      ) : null}
      {team.articleSummary ? (
        <p className={`text-[0.9375rem] leading-[1.6] hyphens-auto text-pretty md:text-justify ${quiet}`}>{team.articleSummary}</p>
      ) : null}
      {!hasSubject && !team.articleUrl ? <p className={`text-[0.9375rem] leading-[1.5] ${quiet}`}>{copy.topicMissing}</p> : null}
      {team.articleUrl ? (
        <ForumArticleButton href={team.articleUrl} label={copy.readArticle} newTabLabel={newTabLabel} />
      ) : hasSubject ? (
        <p className={`text-[0.9375rem] leading-[1.5] ${quiet}`}>{copy.articleMissing}</p>
      ) : null}
    </div>
  );
}

function RankMark({ place, label, badge }: { place: number; label: string; badge: string }) {
  return (
    <p className={`inline-flex size-9 shrink-0 items-center justify-center text-[1.125rem] font-semibold tabular-nums ${badge}`}>
      <span className="sr-only">{label} </span>
      {place}
    </p>
  );
}

function placeLabel(copy: Dictionary["participatingTeams"], place: number): string {
  if (place === 1 || place === 2 || place === 3) {
    return copy.places[place - 1] ?? `${copy.placeLabel} ${place}`;
  }

  return `${copy.placeLabel} ${place}`;
}

function comparePlaces(left: number | undefined, right: number | undefined): number {
  if (left && right) {
    return left - right;
  }

  if (left) {
    return -1;
  }

  if (right) {
    return 1;
  }

  return 0;
}

function RoleBadge({ role, label }: { role: MemberRole; label: string }) {
  const tone =
    role === "leader"
      ? "bg-[#0033ad] text-white"
      : role === "deputy"
        ? "border border-[#0033ad] text-[#0033ad]"
        : "bg-[#f4f7fb] text-[#3e4c63]";

  return <span className={`shrink-0 rounded-[2px] px-2 py-0.5 text-[0.75rem] font-semibold ${tone}`}>{label}</span>;
}

function shownCount(team: PublicTeam): number {
  return team.members.length > 0 ? team.members.length : team.memberCount;
}

function roleLabel(copy: Dictionary["participatingTeams"], role: MemberRole): string {
  if (role === "leader") {
    return copy.roleLeader;
  }

  if (role === "deputy") {
    return copy.roleDeputy;
  }

  return copy.roleMember;
}
