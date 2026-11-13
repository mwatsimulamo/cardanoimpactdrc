import Link from "next/link";
import { EditorialCard, EditorialEmptyCard } from "@/components/EditorialCard";
import { secondaryLink, sectionLede, sectionTitle, textLink } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import { listPublicActivities } from "@/lib/documented-activities";
import { EDITORIAL_PREVIEW_LIMIT } from "@/lib/editorial-preview";
import { localePath, type Locale } from "@/lib/locales";
import { readPublishedAnnouncements } from "@/lib/published-records";
import { firstRichImage } from "@/lib/rich-text";

export async function HomeLatest({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const announcements = (await readPublishedAnnouncements()).filter(
    (item) => item.title[locale].trim().length > 0,
  );
  const activities = [...(await listPublicActivities(locale))].sort((left, right) =>
    right.occurredOn.localeCompare(left.occurredOn),
  );
  const previewAnnouncements = announcements.slice(0, EDITORIAL_PREVIEW_LIMIT);
  const previewActivities = activities.slice(0, EDITORIAL_PREVIEW_LIMIT);

  return (
    <section className="mt-16 md:mt-24" aria-labelledby="home-latest">
      <div className="admin-in-left">
        <h2 id="home-latest" className={`${sectionTitle} scroll-mt-28 text-center`}>
          {dictionary.home.latestAnnouncements}
        </h2>
        <p className={`mt-3 ${sectionLede}`}>{dictionary.home.latestAnnouncementsLede}</p>
        {announcements.length === 0 ? (
          <ul className="mt-8 grid auto-rows-fr gap-4 lg:grid-cols-3">
            <li className="h-full">
              <EditorialEmptyCard
                badge={dictionary.home.emptyCardBadge}
                title={dictionary.home.emptyCardTitle}
                body={dictionary.home.latestEmpty}
              />
            </li>
          </ul>
        ) : (
          <ul className="admin-stagger mt-8 grid auto-rows-fr gap-4 lg:grid-cols-3">
            {previewAnnouncements.map((item) => (
              <li key={item.slug} className="h-full">
                <EditorialCard
                  href={localePath(locale, `annonces/${item.slug}`)}
                  title={item.title[locale]}
                  badge={dictionary.announcements.badge}
                  imageSrc={firstRichImage(item.body[locale])}
                  imageAlt=""
                />
              </li>
            ))}
          </ul>
        )}
        {announcements.length > 0 ? (
          <div className="mt-8 flex justify-center">
            <Link className={secondaryLink} href={localePath(locale, "annonces")}>
              {dictionary.home.seeMoreAnnouncements}
            </Link>
          </div>
        ) : null}
      </div>

      <div className="admin-in-right mt-14" style={{ ["--admin-delay" as string]: "120ms" }}>
        <h2 className={`${sectionTitle} text-center`}>{dictionary.home.latestActivities}</h2>
        <p className={`mt-3 ${sectionLede}`}>{dictionary.home.latestActivitiesLede}</p>
        {activities.length === 0 ? (
          <ul className="mt-8 grid auto-rows-fr gap-4 lg:grid-cols-3">
            <li className="h-full">
              <EditorialEmptyCard
                badge={dictionary.home.emptyCardBadge}
                title={dictionary.home.emptyCardTitle}
                body={dictionary.home.latestEmpty}
              />
            </li>
          </ul>
        ) : (
          <ul className="admin-stagger mt-8 grid auto-rows-fr gap-4 lg:grid-cols-3">
            {previewActivities.map((item) => {
              const image = item.images[0];
              return (
                <li key={item.slug} className="h-full">
                  <EditorialCard
                    href={localePath(locale, `activites/${item.slug}`)}
                    title={item.title}
                    badge={dictionary.activities.categories[item.category]}
                    imageSrc={image?.src}
                    imageAlt={image?.alt ?? ""}
                  />
                </li>
              );
            })}
          </ul>
        )}
        {activities.length > 0 ? (
          <div className="mt-8 flex justify-center">
            <Link className={secondaryLink} href={localePath(locale, "activites")}>
              {dictionary.home.seeMoreActivities}
            </Link>
          </div>
        ) : null}
      </div>

      <p className="mt-8 text-center">
        <Link className={textLink} href={localePath(locale, "feuille-de-route")}>
          {dictionary.home.roadmapLink}
        </Link>
      </p>
    </section>
  );
}
