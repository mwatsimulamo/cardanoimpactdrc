import Link from "next/link";
import { Suspense } from "react";
import { ArticleBody } from "@/components/ArticleBody";
import { blockTitle, justifiedText, primaryLink, secondaryLink, sectionTitle, supportText, textLink } from "@/components/classes";
import { ExternalLink } from "@/components/ExternalLink";
import { MenuBook, SectionHeading } from "@/components/MenuBook";
import { guideSectionLinks, ParticipantGuide } from "@/components/ParticipantGuide";
import { PublicTeamsBoard } from "@/components/PublicTeamsBoard";
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
  const placedNames = published?.places ?? [];

  if (result.status === "error") {
    return (
      <PublicTeamsBoard teams={[]} copy={copy} newTabLabel={newTabLabel} placedNames={placedNames} status="error" />
    );
  }

  return (
    <PublicTeamsBoard teams={result.teams} copy={copy} newTabLabel={newTabLabel} placedNames={placedNames} />
  );
}

const placeLabels = {
  fr: ["Première place", "Deuxième place", "Troisième place"],
  en: ["First place", "Second place", "Third place"],
} as const;

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
            <ol className="grid gap-4 md:grid-cols-3">
              {result.places.map((team, index) => (
                <li key={placeLabels[locale][index]} className="border border-[#1f7a4d] bg-[#e7f6ee]">
                  <span aria-hidden="true" className="block h-1.5 bg-[#1f7a4d]" />
                  <div className="px-5 py-6">
                    <p className="text-[0.9375rem] font-semibold text-[#146c43]">{placeLabels[locale][index]}</p>
                    <p className="mt-2 text-[1.25rem] font-semibold leading-[1.35] text-[#0f5c38]">{team}</p>
                  </div>
                </li>
              ))}
            </ol>
            {result.articleUrls.length > 0 ? (
              <ul className="space-y-2">
                {result.articleUrls.map((url) => (
                  <li key={url}>
                    <ExternalLink href={url} newTabLabel={dictionary.links.opensNewTab} />
                  </li>
                ))}
              </ul>
            ) : null}
            <ArticleBody text={result.statement[locale]} />
            <p>
              <Link className={textLink} href={localePath(locale, "annonces")}>
                {dictionary.nav.announcements}
              </Link>
            </p>
          </div>
        );
}
