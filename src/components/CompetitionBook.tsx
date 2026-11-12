import Link from "next/link";
import { Suspense } from "react";
import { ArticleBody } from "@/components/ArticleBody";
import { blockTitle, justifiedText, primaryLink, secondaryLink, sectionTitle, supportText, textLink } from "@/components/classes";
import { MenuBook, SectionHeading } from "@/components/MenuBook";
import { guideSectionLinks, ParticipantGuide } from "@/components/ParticipantGuide";
import { ForumArticleButton, placeAppearance, PublicTeamsBoard, ResultsWorkbookButton, type PublicTeamRank } from "@/components/PublicTeamsBoard";
import { getDictionary } from "@/content/get-dictionary";
import type { Dictionary } from "@/content/types";
import { localePath, type Locale } from "@/lib/locales";
import { readSubmittedPublicTeams } from "@/lib/participating-teams";
import { readPublishedResult } from "@/lib/published-records";

const nextSection = "mt-20 border-t border-[#d5dce6] pt-16";

async function LivePublicTeams({
  copy,
  newTabLabel,
}: {
  copy: Dictionary["participatingTeams"];
  newTabLabel: string;
}) {
  const [result, published] = await Promise.all([readSubmittedPublicTeams(), readPublishedResult()]);
  const ranks: PublicTeamRank[] = published
    ? published.places.map((place) => ({ teamId: place.teamId, place: place.place }))
    : [];

  if (result.status === "error") {
    return <PublicTeamsBoard teams={[]} copy={copy} newTabLabel={newTabLabel} status="error" />;
  }

  return <PublicTeamsBoard teams={result.teams} copy={copy} newTabLabel={newTabLabel} ranks={ranks} />;
}

export function CompetitionBook({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const concoursHref = localePath(locale, "concours");
  const teamsHref = localePath(locale, "equipes");
  const evaluationsHref = localePath(locale, "evaluations");
  const resultsHref = localePath(locale, "resultats");
  const copy = dictionary.participatingTeams;

  return (
    <MenuBook
      label={dictionary.guide.contents}
      items={[
        {
          id: "nav-concours",
          href: concoursHref,
          label: dictionary.nav.competition,
          scrollId: "guide-overview",
        },
        ...guideSectionLinks(dictionary).map((item) => ({
          ...item,
          href: `${concoursHref}#${item.id}`,
          nested: true,
        })),
        { id: "section-evaluations", href: evaluationsHref, label: dictionary.nav.evaluation },
        { id: "section-equipes", href: teamsHref, label: dictionary.nav.participatingTeams },
        {
          id: "section-leader",
          href: `${teamsHref}#section-leader`,
          label: dictionary.workspace.accessTitle,
          nested: true,
        },
        { id: "section-resultats", href: resultsHref, label: dictionary.nav.results },
      ]}
    >
      <section aria-labelledby="guide-overview">
        <ParticipantGuide locale={locale} dictionary={dictionary} />
        <p className="mt-10">
          <Link className={textLink} href={localePath(locale, "inscription")}>
            {dictionary.nav.register}
          </Link>
        </p>
      </section>

      <section className={nextSection} aria-labelledby="section-evaluations">
        <SectionHeading
          id="section-evaluations"
          href={evaluationsHref}
          title={dictionary.evaluation.title}
          lede={dictionary.evaluation.lede}
        />
        <div className="mt-8 space-y-4">
          <p className={justifiedText}>{dictionary.phases.jury.body}</p>
          <p className={justifiedText}>{dictionary.evaluation.criteriaIntro}</p>
          <p className={justifiedText}>{dictionary.evaluation.unpublished}</p>
        </div>
        <section className="mt-16" aria-labelledby="criteria">
          <h2 id="criteria" className={sectionTitle}>
            {dictionary.evaluation.criteriaTitle}
          </h2>
          <ol className="mt-8 space-y-8">
            {dictionary.evaluation.criteria.map((criterion) => (
              <li key={criterion.title}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className={blockTitle}>{criterion.title}</h3>
                  <p className="shrink-0 font-semibold text-[#0033ad] tabular-nums">
                    <span className="sr-only">{dictionary.evaluation.pointsLabel} </span>
                    {criterion.points}
                  </p>
                </div>
                <p className={`mt-2 ${justifiedText}`}>{criterion.looksAt}</p>
              </li>
            ))}
          </ol>
          <p className={`mt-8 ${supportText}`}>{dictionary.evaluation.total}</p>
          <p className={`mt-4 ${justifiedText}`}>{dictionary.evaluation.tieBreak}</p>
        </section>
        <ul className="mt-10 space-y-4">
          {dictionary.evaluation.selection.map((item) => (
            <li key={item} className={`border border-line bg-surface px-4 py-3 ${justifiedText}`}>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <a className={secondaryLink} href="#section-concours">
            {dictionary.nav.competition}
          </a>
          <a className={secondaryLink} href="#section-resultats">
            {dictionary.nav.results}
          </a>
        </div>
      </section>

      <section className={nextSection} aria-labelledby="section-equipes">
        <SectionHeading id="section-equipes" href={teamsHref} title={copy.title} lede={copy.lede} />
        <div className="mt-8 space-y-4">
          {copy.brief.map((paragraph) => (
            <p key={paragraph} className={justifiedText}>
              {paragraph}
            </p>
          ))}
        </div>
        <Suspense
          fallback={
            <PublicTeamsBoard
              teams={[]}
              copy={copy}
              newTabLabel={dictionary.links.opensNewTab}
              status="loading"
            />
          }
        >
          <LivePublicTeams copy={copy} newTabLabel={dictionary.links.opensNewTab} />
        </Suspense>
        <section className="mt-16 border-t border-[#d5dce6] pt-12" aria-labelledby="section-leader">
          <h2 id="section-leader" className={`${sectionTitle} scroll-mt-28`}>
            {dictionary.workspace.accessTitle}
          </h2>
          <div className="mt-4 space-y-4">
            <p className={justifiedText}>{dictionary.workspace.accessLede}</p>
            <p className={justifiedText}>{dictionary.workspace.accessNeedCode}</p>
            <Link className={primaryLink} href={localePath(locale, "equipe")}>
              {dictionary.workspace.workspaceLink}
            </Link>
          </div>
        </section>
      </section>

      <section className={nextSection} aria-labelledby="section-resultats">
        <SectionHeading id="section-resultats" href={resultsHref} title={dictionary.results.title} />
        <Suspense fallback={<p className={`mt-8 ${justifiedText}`}>{dictionary.workspace.loading}</p>}>
          <PublishedResults locale={locale} dictionary={dictionary} />
        </Suspense>
      </section>
    </MenuBook>
  );
}

async function PublishedResults({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const result = await readPublishedResult();

  return result === null ? (
          <div className="mt-8 space-y-4">
            <p className={justifiedText}>{dictionary.results.empty}</p>
            <p className={justifiedText}>{dictionary.results.pendingNote}</p>
            <p>
              <Link className={textLink} href={localePath(locale, "annonces")}>
                {dictionary.nav.announcements}
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <ol className="grid items-stretch gap-4 md:grid-cols-2">
              {result.places.map((place) => {
                const tone = placeAppearance(place.place);
                const label =
                  place.place <= 3
                    ? dictionary.participatingTeams.places[place.place - 1]
                    : `${dictionary.participatingTeams.placeLabel} ${place.place}`;
                return (
                  <li key={place.teamId} className={`flex h-full flex-col ${tone.card}`}>
                    <div className="flex items-start gap-3 px-5 py-5">
                      <p className={`inline-flex size-9 shrink-0 items-center justify-center text-[1.125rem] font-semibold tabular-nums ${tone.badge}`}>
                        <span className="sr-only">{label} </span>
                        {place.place}
                      </p>
                      <h3 className={`text-[1.25rem] font-semibold leading-[1.3] ${tone.title}`}>{place.name}</h3>
                    </div>
                    <div className="mt-auto px-5 pb-5">
                      {place.articleUrl ? (
                        <ForumArticleButton
                          href={place.articleUrl}
                          label={dictionary.participatingTeams.readArticle}
                          newTabLabel={dictionary.links.opensNewTab}
                        />
                      ) : (
                        <p className={`text-[0.9375rem] leading-[1.5] ${tone.quiet}`}>{dictionary.participatingTeams.articleMissing}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <ArticleBody text={result.statement[locale]} />
            {result.hasWorkbook ? <ResultsWorkbookButton label={dictionary.results.fullResults} /> : null}
            <p>
              <Link className={textLink} href={localePath(locale, "annonces")}>
                {dictionary.nav.announcements}
              </Link>
            </p>
          </div>
        );
}
