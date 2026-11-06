import { blockTitle, justifiedText, supportText } from "@/components/classes";
import { ExternalLink } from "@/components/ExternalLink";
import { StatusMessage } from "@/components/StatusMessage";
import type { Dictionary } from "@/content/types";
import type { MemberRole, PublicTeam } from "@/lib/team-registration";

export type PublicTeamsStatus = "loading" | "error" | "ready";

export function PublicTeamsBoard({
  teams,
  copy,
  newTabLabel,
  placedNames = [],
  status = "ready",
}: {
  teams: readonly PublicTeam[];
  copy: Dictionary["participatingTeams"];
  newTabLabel: string;
  placedNames?: readonly string[];
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
    return <p className={`mt-10 ${justifiedText}`}>{copy.empty}</p>;
  }

  return (
    <ul className="mt-10 grid gap-4 md:grid-cols-2">
      {teams.map((team) => {
        const hasArticle = Boolean(team.articleTitle || team.articleSummary || team.articleUrl);
        const placed = placedNames.some((name) => name.trim().toLowerCase() === team.name.trim().toLowerCase());

        return (
          <li
            key={team.id}
            className={
              placed
                ? "flex h-full flex-col border border-[#1f7a4d] bg-[#e7f6ee]"
                : "flex h-full flex-col border border-line bg-surface"
            }
          >
            <div className="flex flex-1 flex-col px-5 py-6">
              <h3 className={placed ? "text-[1.25rem] font-semibold leading-[1.35] text-[#0f5c38] md:text-[1.5rem]" : blockTitle}>
                {team.name}
              </h3>
              <p className="mt-3 flex items-baseline gap-2">
                <span className={`tabular-nums ${blockTitle}`}>{team.memberCount}</span>
                <span className={supportText}>{copy.memberCount}</span>
              </p>
              {team.members.length > 0 ? (
                <ul className="mt-6 space-y-3 border-t border-line pt-5">
                  {team.members.map((member, memberIndex) => (
                    <li
                      key={`${team.id}-${memberIndex}-${member.role}-${member.givenName}-${member.familyName}`}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4"
                    >
                      <p className="font-semibold text-ink">
                        {member.givenName} {member.familyName}
                      </p>
                      <p className={supportText}>{roleLabel(copy, member.role)}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-auto pt-6">
                {hasArticle ? (
                  <div className="space-y-2 border-t border-line pt-5">
                    <h4 className="text-base font-semibold text-ink">{copy.topicHeading}</h4>
                    {team.articleTitle ? <p className={justifiedText}>{team.articleTitle}</p> : null}
                    {team.articleSummary ? <p className={justifiedText}>{team.articleSummary}</p> : null}
                    {team.articleUrl ? (
                      <p>
                        <ExternalLink href={team.articleUrl} newTabLabel={newTabLabel}>
                          {copy.readArticle}
                        </ExternalLink>
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className={`border-t border-line pt-5 ${supportText}`}>{copy.topicMissing}</p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
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
