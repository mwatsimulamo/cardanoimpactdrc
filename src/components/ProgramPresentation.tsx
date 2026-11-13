import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { blockTitle, justifiedSupport, justifiedText, pageTitle, primaryLink, secondaryLink } from "@/components/classes";
import { PageFrame } from "@/components/PageHeader";
import { getDictionary } from "@/content/get-dictionary";
import { localePath, type Locale } from "@/lib/locales";

function emphasizeMarkup(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function PathBadge({ n }: { n: string }) {
  return (
    <span
      aria-hidden="true"
      className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-full bg-action text-[1.0625rem] font-semibold tabular-nums text-white shadow-[0_0_0_3px_rgb(10_22_52_/_55%)] md:left-5 md:top-5"
    >
      {n}
    </span>
  );
}

export async function ProgramPresentation({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const story = dictionary.program.story;
  const registerHref = localePath(locale, "inscription");
  const contactHref = localePath(locale, "contact");
  const overviewBody = story.overview.slice(0, -1);
  const overviewClosing = story.overview.at(-1);

  return (
    <PageFrame>
      <section aria-labelledby="program-what">
        <h1 id="program-what" className={`${pageTitle} scroll-mt-28 text-pretty`}>
          {story.whatTitle}
        </h1>

        <div className="mt-8 flex flex-col gap-8 lg:mt-10 lg:flex-row lg:items-stretch lg:gap-10 xl:gap-12">
          <figure className="relative mx-auto aspect-square w-full max-w-[28rem] shrink-0 overflow-hidden bg-brand-pressed lg:mx-0 lg:w-112 lg:max-w-none">
            <Image
              src="/programme/cas-usage-rdc.png"
              alt={dictionary.program.whatMediaAlt}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) min(100vw, 28rem), 28rem"
              className="object-cover"
            />
          </figure>

          <div className="flex min-w-0 flex-1 flex-col justify-between gap-5 lg:h-112 lg:max-h-112 lg:gap-0 lg:overflow-hidden">
            {overviewBody.map((paragraph, index) => (
              <p
                key={paragraph}
                className={
                  index === 0
                    ? "text-[1.0625rem] leading-[1.65] text-ink hyphens-auto text-pretty md:text-[1.125rem] md:leading-[1.7] md:text-justify"
                    : `${justifiedText} lg:leading-[1.65]`
                }
              >
                {emphasizeMarkup(paragraph)}
              </p>
            ))}
          </div>
        </div>

        {overviewClosing ? (
          <p className="mt-8 bg-action px-6 py-5 text-[1rem] leading-[1.7] text-white hyphens-auto text-pretty md:mt-10 md:px-8 md:py-6 md:text-[1.0625rem] md:text-justify">
            {emphasizeMarkup(overviewClosing)}
          </p>
        ) : null}
      </section>

      <section className="mt-16 md:mt-20" aria-labelledby="program-how">
        <h2 id="program-how" className={`${pageTitle} scroll-mt-28 text-pretty`}>
          {story.howTitle}
        </h2>
        <p className={`mt-4 max-w-[40rem] text-[1.125rem] leading-[1.65] text-ink md:text-[1.25rem]`}>{story.howLead}</p>
        <p className={`mt-2 max-w-[40rem] text-[1.0625rem] leading-[1.6] text-muted`}>{story.howLeadDetail}</p>

        <ol className="mt-10 space-y-6">
          <li id="programme-training" className="path-reveal path-card relative scroll-mt-28 bg-surface px-5 pb-6 pt-14 md:px-8 md:pb-8 md:pt-16">
            <PathBadge n="1" />
            <h3 className={`text-center ${blockTitle}`}>{story.training.title}</h3>

            <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5">
              {story.training.sessions.map((session) => (
                <section key={session.label} className="bg-canvas px-5 py-6 md:px-6">
                  <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.04em] text-brand">
                    {session.label}
                  </p>
                  <h4 className={`mt-2 ${blockTitle}`}>{session.title}</h4>
                  <p className="mt-2 text-[1.0625rem] font-semibold leading-[1.35] text-brand">{session.when}</p>
                  <ul className="mt-5 space-y-2">
                    {session.points.map((point) => (
                      <li key={point} className={`flex gap-3 ${justifiedText}`}>
                        <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-brand" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <div className="mt-8 space-y-3 text-center">
              <p className={`mx-auto max-w-[42rem] ${justifiedText} md:text-center`}>{story.training.intro}</p>
              <p className={`mx-auto max-w-[42rem] ${justifiedSupport} md:text-center`}>{story.training.note}</p>
              <p className="pt-3">
                <Link className={primaryLink} href={registerHref}>
                  {story.training.cta}
                </Link>
              </p>
            </div>
          </li>

          <li
            id="programme-competition"
            className="path-reveal path-card relative scroll-mt-28 bg-canvas px-5 pb-6 pt-14 md:px-8 md:pb-8 md:pt-16"
            style={{ animationDelay: "90ms" }}
          >
            <PathBadge n="2" />
            <h3 className={`text-center ${blockTitle}`}>{story.competition.title}</h3>

            <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5">
              <div className="bg-surface px-5 py-6 md:px-6">
                <p className="text-[1.0625rem] font-semibold leading-[1.35] text-brand">{story.competition.when}</p>
                <p className={`mt-4 ${justifiedText}`}>{story.competition.intro}</p>
              </div>

              <div className="bg-surface px-5 py-6 md:px-6">
                <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.04em] text-brand">
                  {story.competition.lead}
                </p>
                <ul className="mt-4 space-y-3">
                  {story.competition.points.map((point) => (
                    <li key={point} className={`flex gap-3 ${justifiedText}`}>
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-brand" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 space-y-3 text-center">
              <p className={`mx-auto max-w-[42rem] ${justifiedSupport} md:text-center`}>{story.competition.note}</p>
              <div className="flex flex-col items-center justify-center gap-3 pt-3 sm:flex-row sm:flex-wrap">
                <Link className={primaryLink} href={registerHref}>
                  {story.competition.secondary}
                </Link>
                <Link className={secondaryLink} href={localePath(locale, "concours")}>
                  {story.competition.primary}
                </Link>
              </div>
            </div>
          </li>

          <li
            id="programme-workshop"
            className="path-reveal path-card relative scroll-mt-28 bg-surface px-5 pb-6 pt-14 md:px-8 md:pb-8 md:pt-16"
            style={{ animationDelay: "180ms" }}
          >
            <PathBadge n="3" />
            <h3 className={`text-center ${blockTitle}`}>{story.workshop.title}</h3>

            <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5">
              <div className="bg-canvas px-5 py-6 md:px-6">
                <p className="text-[1.0625rem] font-semibold leading-[1.35] text-brand">{story.workshop.when}</p>
                <p className={`mt-4 ${justifiedText}`}>{story.workshop.intro}</p>
              </div>

              <div className="bg-canvas px-5 py-6 md:px-6">
                <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.04em] text-brand">
                  {story.workshop.lead}
                </p>
                <ul className="mt-4 space-y-3">
                  {story.workshop.points.map((point) => (
                    <li key={point} className={`flex gap-3 ${justifiedText}`}>
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-brand" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 space-y-3 text-center">
              <p className={`mx-auto max-w-[42rem] ${justifiedSupport} md:text-center`}>{story.workshop.note}</p>
              <p className="pt-3">
                <Link className={primaryLink} href={registerHref}>
                  {story.workshop.cta}
                </Link>
              </p>
            </div>
          </li>
        </ol>

        <p className={`mt-8 text-[1.0625rem] font-semibold leading-[1.5] text-ink`}>{story.combineTitle}</p>
      </section>

      <section className="mt-16 bg-canvas px-6 py-8 md:mt-20 md:px-8 md:py-10" aria-labelledby="program-next">
        <h2 id="program-next" className={`${pageTitle} scroll-mt-28 text-pretty`}>
          {story.nextTitle}
        </h2>
        <p className={`mt-4 max-w-[40rem] ${justifiedText}`}>{story.nextBody}</p>
        <p className="mt-6">
          <Link className={primaryLink} href={`${localePath(locale)}#home-phases`}>
            {story.nextCta}
          </Link>
        </p>
      </section>

      <section
        className="mt-16 bg-action px-6 py-10 text-center text-white md:mt-20 md:px-10 md:py-12"
        aria-labelledby="program-contact"
      >
        <h2 id="program-contact" className={`${pageTitle} scroll-mt-28 text-pretty text-white`}>
          {story.helpTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-[36rem] text-[1.0625rem] leading-[1.7] text-white/90 text-pretty">
          {story.helpBody}
        </p>
        <p className="mt-7 flex justify-center">
          <Link
            className="inline-flex min-h-12 w-full items-center justify-center rounded-[2px] bg-white px-6 text-[0.9375rem] font-semibold text-brand-pressed transition-colors duration-150 hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:w-auto"
            href={contactHref}
          >
            {story.helpCta}
          </Link>
        </p>
      </section>
    </PageFrame>
  );
}
