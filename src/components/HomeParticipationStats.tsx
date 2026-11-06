import Link from "next/link";
import { blockTitle, casePanel, justifiedText, sectionTitle, textLink } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import { localePath, type Locale } from "@/lib/locales";
import { readSubmittedPublicTeams } from "@/lib/participating-teams";

export async function LiveHomeParticipationStats({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const result = await readSubmittedPublicTeams();
  const teams = result.status === "ready" ? result.teams : [];
  const hasTeams = result.status === "ready" && teams.length > 0;

  return (
    <HomeParticipationStats
      locale={locale}
      dictionary={dictionary}
      teamCount={hasTeams ? teams.length : null}
      participantCount={hasTeams ? teams.reduce((sum, team) => sum + team.memberCount, 0) : null}
    />
  );
}

export function HomeParticipationStats({
  locale,
  dictionary,
  teamCount,
  participantCount,
}: {
  locale: Locale;
  dictionary: Dictionary;
  teamCount: number | null;
  participantCount: number | null;
}) {
  const hasCounts = teamCount !== null && participantCount !== null;
  const teamsHref = localePath(locale, "equipes");

  return (
    <section className="mt-16 border-t border-line pt-12 md:mt-24 md:pt-16" aria-labelledby="home-participation">
      <h2 id="home-participation" className={sectionTitle}>
        {dictionary.home.statsTitle}
      </h2>
      {hasCounts ? (
        <dl className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="border border-line bg-canvas px-5 py-6">
            <dt className={justifiedText}>{dictionary.home.statsTeams}</dt>
            <dd className={`mt-2 tabular-nums ${blockTitle}`}>{teamCount}</dd>
          </div>
          <div className="border border-line bg-canvas px-5 py-6">
            <dt className={justifiedText}>{dictionary.home.statsParticipants}</dt>
            <dd className={`mt-2 tabular-nums ${blockTitle}`}>{participantCount}</dd>
          </div>
        </dl>
      ) : (
        <p className={`mt-6 ${casePanel} ${justifiedText}`}>{dictionary.home.statsEmpty}</p>
      )}
      <p className="mt-6">
        <Link className={textLink} href={teamsHref}>
          {dictionary.home.statsLink}
        </Link>
      </p>
    </section>
  );
}
