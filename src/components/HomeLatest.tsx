import Link from "next/link";
import { justifiedText, sectionTitle, textLink } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import { listPublicActivities } from "@/lib/documented-activities";
import { localePath, type Locale } from "@/lib/locales";
import { readPublishedAnnouncements } from "@/lib/published-records";

export async function HomeLatest({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const announcements = (await readPublishedAnnouncements()).filter(
    (item) => item.title[locale].trim().length > 0,
  );
  const activities = await listPublicActivities(locale);

  return (
    <section className="mt-16 border-t border-line pt-12 md:mt-24 md:pt-16" aria-labelledby="home-latest">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 id="home-latest" className={sectionTitle}>
            {dictionary.home.latestAnnouncements}
          </h2>
          {announcements.length === 0 ? (
            <p className={`mt-4 ${justifiedText}`}>{dictionary.home.latestEmpty}</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {announcements.slice(0, 3).map((item) => (
                <li key={item.slug}>
                  <Link className={textLink} href={localePath(locale, `annonces/${item.slug}`)}>
                    {item.title[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4">
            <Link className={textLink} href={localePath(locale, "annonces")}>
              {dictionary.nav.announcements}
            </Link>
          </p>
        </div>
        <div>
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
      </div>
      <p className="mt-8">
        <Link className={textLink} href={localePath(locale, "feuille-de-route")}>
          {dictionary.home.roadmapLink}
        </Link>
      </p>
    </section>
  );
}
