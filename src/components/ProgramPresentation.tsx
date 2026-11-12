import Link from "next/link";
import { blockTitle, casePanel, justifiedSupport, justifiedText, primaryLink, secondaryLink, sectionTitle } from "@/components/classes";
import { OrganizerContact } from "@/components/OrganizerContact";
import { PageFrame, PageHeader } from "@/components/PageHeader";
import { getDictionary } from "@/content/get-dictionary";
import { localePath, type Locale } from "@/lib/locales";
import { readRegistrationAvailability } from "@/lib/registration-gate";
import { publicRegistrationState } from "@/lib/registration-status";

export async function ProgramPresentation({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const story = dictionary.program.story;
  const registerHref = localePath(locale, "inscription");
  const teamsState = publicRegistrationState((await readRegistrationAvailability()).teamsStatus);
  const teamsBanner =
    teamsState === "open"
      ? dictionary.registration.teamsOpen
      : teamsState === "closed"
        ? dictionary.registration.teamsClosed
        : dictionary.registration.teamsUpcoming;

  return (
    <PageFrame>
      <PageHeader id="section-programme" title={dictionary.program.title} lede={dictionary.program.lede} />

      <section className="mt-10 grid border border-line md:mt-14 md:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]" aria-labelledby="program-what">
        <div className="flex items-end bg-action px-6 py-8 md:px-8 md:py-10">
          <h2 id="program-what" className={`${sectionTitle} scroll-mt-28 text-white`}>
            {story.whatTitle}
          </h2>
        </div>
        <div className="space-y-4 bg-canvas px-6 py-8 md:px-8 md:py-10">
          {story.overview.map((paragraph) => (
            <p key={paragraph} className={justifiedText}>
              {paragraph}
            </p>
          ))}
          <p className={justifiedText}>{dictionary.program.organizationBody}</p>
        </div>
      </section>

      <section className="mt-16 md:mt-20" aria-labelledby="program-how">
        <h2 id="program-how" className={`${sectionTitle} scroll-mt-28`}>
          {story.howTitle}
        </h2>
        <p className={`mt-4 ${casePanel} ${justifiedSupport}`}>{teamsBanner}</p>
        <ol className="mt-8 space-y-6">
          <li id="programme-training" className="path-reveal scroll-mt-28 border border-line bg-surface">
            <article>
              <header className="border-b border-line px-5 py-6 md:px-8 md:py-7">
                <p className="text-base font-semibold text-brand tabular-nums">01</p>
                <h3 className={`mt-3 ${blockTitle}`}>{story.training.title}</h3>
                <p className={`mt-2 ${blockTitle} text-brand`}>{story.training.when}</p>
                <p className={`mt-4 ${justifiedText}`}>{story.training.intro}</p>
              </header>
              <div className="grid md:grid-cols-2">
                {story.training.sessions.map((session) => (
                  <section
                    key={session.title}
                    className="border-b border-line px-5 py-6 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:py-7 md:last:border-r-0"
                  >
                    <h4 className={blockTitle}>{session.title}</h4>
                    <ul className="mt-4 space-y-2">
                      {session.points.map((point) => (
                        <li key={point} className={justifiedText}>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
              <footer className="flex flex-col gap-4 border-t border-line px-5 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
                <p className={justifiedSupport}>{story.training.note}</p>
                <Link className={primaryLink} href={registerHref}>
                  {story.training.cta}
                </Link>
              </footer>
            </article>
          </li>

          <li id="programme-competition" className="path-reveal scroll-mt-28 border border-line bg-canvas" style={{ animationDelay: "90ms" }}>
            <article className="px-5 py-6 md:px-8 md:py-8">
              <p className="text-base font-semibold text-brand tabular-nums">02</p>
              <h3 className={`mt-3 ${blockTitle}`}>{story.competition.title}</h3>
              <p className={`mt-2 ${blockTitle} text-brand`}>{story.competition.when}</p>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {story.competition.points.map((point) => (
                  <li key={point} className={`border border-line bg-surface px-4 py-3 ${justifiedText}`}>
                    {point}
                  </li>
                ))}
              </ul>
              <p className={`mt-5 ${justifiedText}`}>{story.competition.note}</p>
              <p className={`mt-3 ${justifiedSupport}`}>{story.whoRules}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link className={primaryLink} href={localePath(locale, "concours")}>
                  {story.competition.primary}
                </Link>
                <Link className={secondaryLink} href={registerHref}>
                  {story.competition.secondary}
                </Link>
              </div>
            </article>
          </li>

          <li id="programme-workshop" className="path-reveal scroll-mt-28 overflow-hidden border border-line bg-canvas" style={{ animationDelay: "180ms" }}>
            <article>
              <header className="bg-action px-5 py-6 md:px-8 md:py-8">
                <p className="text-base font-semibold text-white tabular-nums">03</p>
                <h3 className={`mt-3 ${blockTitle} text-white`}>{story.workshop.title}</h3>
                <p className={`mt-2 ${blockTitle} text-white`}>{story.workshop.when}</p>
              </header>
              <div className="px-5 py-6 md:px-8 md:py-8">
                <p className={justifiedText}>{story.workshop.intro}</p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {story.workshop.points.map((point) => (
                    <li key={point} className={`border border-line bg-surface px-4 py-3 ${justifiedText}`}>
                      {point}
                    </li>
                  ))}
                </ul>
                <p className={`mt-5 ${justifiedText}`}>{story.workshop.closing}</p>
                <p className={`mt-4 ${justifiedSupport}`}>{story.workshop.note}</p>
                <p className="mt-6">
                  <Link className={primaryLink} href={registerHref}>
                    {story.workshop.cta}
                  </Link>
                </p>
              </div>
            </article>
          </li>
        </ol>
      </section>

      <p className={`mt-8 ${casePanel} ${justifiedText}`}>{story.combineTitle}</p>

      <section className={`mt-16 md:mt-20 ${casePanel}`} aria-labelledby="program-next">
        <h2 id="program-next" className={`${sectionTitle} scroll-mt-28`}>
          {story.nextTitle}
        </h2>
        <p className={`mt-4 ${justifiedText}`}>{story.nextBody}</p>
        <p className="mt-6">
          <Link className={primaryLink} href={`${localePath(locale)}#home-phases`}>
            {story.nextCta}
          </Link>
        </p>
      </section>

      <OrganizerContact
        locale={locale}
        dictionary={dictionary}
        intro={dictionary.home.teamLead}
        channels={false}
        featureCards
      />
    </PageFrame>
  );
}
