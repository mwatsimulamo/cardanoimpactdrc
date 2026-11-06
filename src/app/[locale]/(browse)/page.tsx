import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { blockTitle, justifiedText, primaryLink, sectionTitle } from "@/components/classes";
import { HomeLatest } from "@/components/HomeLatest";
import {
  HomeParticipationStats,
  LiveHomeParticipationStats,
} from "@/components/HomeParticipationStats";
import { OrganizerContact } from "@/components/OrganizerContact";
import { PageFrame } from "@/components/PageHeader";
import { PhaseTimeline } from "@/components/PhaseTimeline";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale, localePath } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.meta.homeTitle, dictionary.meta.siteName);
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);

  return (
    <div>
      <div className="relative flex min-h-[calc(100svh-5rem)] w-full items-center justify-center overflow-hidden bg-brand-pressed">
        <Image
          src="/accueil.webp"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-brand-pressed/75" />
        <div className="relative mx-auto flex w-full max-w-[56rem] flex-col items-center px-5 py-16 text-center md:px-8 md:py-24">
          <h1 className="w-full max-w-[18em] text-balance text-[2.15rem] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-[2.75rem] md:text-[3.35rem] xl:max-w-[16em] xl:text-[4rem]">
            {dictionary.meta.programName}
          </h1>
          <p className="mt-6 w-full max-w-[40rem] text-[1.125rem] leading-[1.55] text-[#8EAFFF] md:mt-8 md:text-[1.375rem] md:leading-[1.5]">
            {dictionary.home.heroLede}
          </p>
          <div className="mt-8 flex w-full max-w-md flex-col gap-3 md:mt-10 md:max-w-none md:flex-row md:justify-center">
            <Link
              className="inline-flex min-h-12 w-full items-center justify-center rounded-[2px] bg-white px-6 text-[0.9375rem] font-semibold text-[#001C5C] transition-colors duration-150 hover:bg-[#e7eef8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:w-auto"
              href={localePath(locale, "programme")}
            >
              {dictionary.actions.discoverProgram}
            </Link>
            <Link
              className="inline-flex min-h-12 w-full items-center justify-center rounded-[2px] bg-action px-6 text-[0.9375rem] font-semibold text-white transition-colors duration-150 hover:bg-action-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:w-auto"
              href={localePath(locale, "inscription")}
            >
              {dictionary.actions.register}
            </Link>
          </div>
        </div>
      </div>
      <PageFrame>
        <section aria-labelledby="home-aims">
          <h2 id="home-aims" className={sectionTitle}>
            {dictionary.home.aimsTitle}
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {dictionary.home.aims.map((aim) => (
              <li key={aim.title} className="border border-line bg-canvas px-5 py-5 md:px-6">
                <h3 className={blockTitle}>{aim.title}</h3>
                <p className={`mt-2 ${justifiedText}`}>{aim.body}</p>
              </li>
            ))}
          </ol>
        </section>
        <Suspense
          fallback={
            <section className="mt-16 md:mt-24" aria-labelledby="home-phases">
              <h2 id="home-phases" className={`${sectionTitle} scroll-mt-28`}>
                {dictionary.home.phasesTitle}
              </h2>
            </section>
          }
        >
          <PhaseTimeline locale={locale} dictionary={dictionary} heading={dictionary.home.phasesTitle} />
        </Suspense>
        <Suspense
          fallback={
            <HomeParticipationStats
              locale={locale}
              dictionary={dictionary}
              teamCount={null}
              participantCount={null}
            />
          }
        >
          <LiveHomeParticipationStats locale={locale} dictionary={dictionary} />
        </Suspense>
        <Suspense
          fallback={
            <section className="mt-16 border-t border-line pt-12 md:mt-24 md:pt-16" aria-labelledby="home-latest">
              <h2 id="home-latest" className={sectionTitle}>
                {dictionary.home.latestAnnouncements}
              </h2>
            </section>
          }
        >
          <HomeLatest locale={locale} dictionary={dictionary} />
        </Suspense>
        <OrganizerContact
          locale={locale}
          dictionary={dictionary}
          intro={dictionary.home.teamLead}
          channels={false}
          featureCards
        />
        <section className="mt-16 border-t border-line pt-12 md:mt-24 md:pt-16" aria-labelledby="home-ways-prompt">
          <h2 id="home-ways-prompt" className={sectionTitle}>
            {dictionary.home.waysPrompt}
          </h2>
          <h3 id="home-ways" className={`mt-6 ${blockTitle}`}>
            {dictionary.home.waysTitle}
          </h3>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {dictionary.home.ways.map((way) => (
              <li key={way.id}>
                <Link
                  className={`flex h-full min-h-36 items-end border border-line bg-canvas px-5 py-6 transition-colors duration-150 hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:px-6 ${blockTitle}`}
                  href={`${localePath(locale, "programme")}#${way.id}`}
                >
                  {way.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-16 md:mt-24" aria-labelledby="home-questions">
          <h2 id="home-questions" className={sectionTitle}>
            {dictionary.home.questionsTitle}
          </h2>
          <p className="mt-6">
            <Link className={primaryLink} href={localePath(locale, "contact")}>
              {dictionary.home.questionsCta}
            </Link>
          </p>
        </section>
      </PageFrame>
    </div>
  );
}
