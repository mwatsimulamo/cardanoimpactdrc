import Link from "next/link";
import { ArticleBody } from "@/components/ArticleBody";
import { ActivityGallery } from "@/components/ActivityGallery";
import { ActivitySpeakers } from "@/components/ActivitySpeakers";
import { OriginalImage } from "@/components/OriginalImage";
import { justifiedText, pageTitle, sectionTitle, supportText, textLink } from "@/components/classes";
import { ExternalLink } from "@/components/ExternalLink";
import type { Dictionary } from "@/content/types";
import {
  formatCivilDate,
  type PublicActivity,
} from "@/lib/documented-activities";
import type { Locale } from "@/lib/locales";
import { localePath } from "@/lib/locales";

export function ActivityDetail({
  activity,
  locale,
  dictionary,
}: {
  activity: PublicActivity;
  locale: Locale;
  dictionary: Dictionary;
}) {
  const copy = dictionary.activities;
  const hero = activity.images[0];
  const galleryImages = hero ? activity.images.slice(1) : activity.images;
  const dateLabel = activity.occurredUntil
    ? `${formatCivilDate(activity.occurredOn, locale)} – ${formatCivilDate(activity.occurredUntil, locale)}`
    : formatCivilDate(activity.occurredOn, locale);
  const facts = [
    copy.categories[activity.category],
    dateLabel,
    activity.format === "online" ? copy.formatOnline : null,
    activity.format === "in_person" ? copy.formatInPerson : null,
    activity.location,
  ].filter((item): item is string => Boolean(item));

  return (
    <article className="w-full">
      {hero ? (
        <figure className="overflow-hidden bg-canvas">
          <OriginalImage src={hero.src} alt={hero.alt} className="aspect-[21/9] w-full object-cover md:aspect-[2.4/1]" />
          {hero.caption ? <figcaption className={`px-5 py-3 ${supportText}`}>{hero.caption}</figcaption> : null}
        </figure>
      ) : null}

      <header className={hero ? "mt-8 md:mt-10" : undefined}>
        <p className={supportText}>{facts.join(" · ")}</p>
        <h1 className={`mt-3 max-w-none ${pageTitle}`}>{activity.title}</h1>
        {activity.summary ? (
          <p className={`mt-6 text-[1.125rem] leading-[1.65] text-ink md:text-[1.25rem] md:leading-[1.7]`}>{activity.summary}</p>
        ) : null}
      </header>

      {activity.description ? (
        <div className="mt-8 w-full md:mt-10">
          <ArticleBody text={activity.description} />
        </div>
      ) : null}

      {activity.highlights ? (
        <section className="mt-12 w-full">
          <h2 className={sectionTitle}>{copy.highlights}</h2>
          <div className={`mt-4 whitespace-pre-wrap ${justifiedText}`}>{activity.highlights}</div>
        </section>
      ) : null}

      <ActivitySpeakers
        title={copy.speakers}
        speakers={activity.speakers}
        profileLabel={copy.profile}
        biographyMissing={copy.biographyMissing}
        newTabLabel={dictionary.links.opensNewTab}
      />

      <ActivityGallery
        title={copy.gallery}
        images={galleryImages}
        enlargeLabel={copy.enlarge}
        closeLabel={copy.closeImage}
        previousLabel={copy.previousImage}
        nextLabel={copy.nextImage}
      />

      {activity.resources.length > 0 ? (
        <section className="mt-12">
          <h2 className={sectionTitle}>{copy.resources}</h2>
          <ul className="mt-4 space-y-3">
            {activity.resources.map((resource) => (
              <li key={resource.id}>
                <ExternalLink href={resource.url} newTabLabel={dictionary.links.opensNewTab}>
                  {resource.title}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-12">
        <Link className={textLink} href={localePath(locale, "activites")}>
          {dictionary.actions.backToActivities}
        </Link>
      </p>
    </article>
  );
}
