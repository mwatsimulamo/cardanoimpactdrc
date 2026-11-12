import Link from "next/link";
import { blockTitle, justifiedText, sectionTitle, supportText, textLink } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import { listPublicActivities } from "@/lib/documented-activities";
import { localePath, type Locale } from "@/lib/locales";
import { readPublishedAnnouncements } from "@/lib/published-records";
import { plainExcerpt } from "@/lib/rich-text";

export async function HomeLatest({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const announcements = (await readPublishedAnnouncements()).filter(
    (item) => item.title[locale].trim().length > 0,
  );
  const activities = await listPublicActivities(locale);

  return (
    <section className="mt-16 border-t border-line pt-12 md:mt-24 md:pt-16" aria-labelledby="home-latest">
      <div className="admin-in-left">
        <h2 id="home-latest" className={`${sectionTitle} scroll-mt-28`}>
          {dictionary.home.latestAnnouncements}
        </h2>
        <p className={`mt-3 max-w-3xl ${justifiedText}`}>{dictionary.home.latestAnnouncementsLede}</p>
        {announcements.length === 0 ? (
          <p className={`mt-6 ${justifiedText}`}>{dictionary.home.latestEmpty}</p>
        ) : (
          <ul className="admin-stagger mt-8 grid gap-4 lg:grid-cols-3">
            {announcements.slice(0, 3).map((item) => {
              const excerpt = plainExcerpt(item.body[locale], 160);
              return (
                <li key={item.slug} className="flex h-full flex-col border border-line bg-canvas px-5 py-6">
                  <p className={supportText}>
                    <time dateTime={item.publishedAt}>{formatPublished(item.publishedAt, locale)}</time>
                  </p>
                  <h3 className={`mt-3 ${blockTitle}`}>{item.title[locale]}</h3>
                  {excerpt ? <p className={`mt-3 ${justifiedText}`}>{excerpt}</p> : null}
                  <p className="mt-auto pt-5">
                    <Link className={textLink} href={localePath(locale, `annonces/${item.slug}`)}>
                      {dictionary.home.announcementRead}
                    </Link>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-6">
          <Link className={textLink} href={localePath(locale, "annonces")}>
            {dictionary.nav.announcements}
          </Link>
        </p>
      </div>

      <div className="admin-in-right mt-14 border-t border-line pt-12" style={{ ["--admin-delay" as string]: "120ms" }}>
        <h2 className={sectionTitle}>{dictionary.home.latestActivities}</h2>
        {activities.length === 0 ? (
          <p className={`mt-4 ${justifiedText}`}>{dictionary.home.latestEmpty}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {activities.slice(0, 3).map((item) => (
              <li key={item.slug}>
                <Link className={textLink} href={localePath(locale, `activites/${item.slug}`)}>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4">
          <Link className={textLink} href={localePath(locale, "activites")}>
            {dictionary.nav.activities}
          </Link>
        </p>
      </div>

      <p className="mt-8">
        <Link className={textLink} href={localePath(locale, "feuille-de-route")}>
          {dictionary.home.roadmapLink}
        </Link>
      </p>
    </section>
  );
}

function formatPublished(value: string, locale: Locale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    dateStyle: "long",
    timeZone: "Africa/Lubumbashi",
  }).format(date);
}
