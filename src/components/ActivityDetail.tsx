import Link from "next/link";
import { ActivityGallery } from "@/components/ActivityGallery";
import { ActivitySpeakers } from "@/components/ActivitySpeakers";
import { justifiedText, sectionTitle, supportText, textLink } from "@/components/classes";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHeader } from "@/components/PageHeader";
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
    <>
      <PageHeader title={activity.title} />
      <p className={`mt-4 ${supportText}`}>{facts.join(" · ")}</p>
      {activity.summary ? <p className={`mt-8 ${justifiedText}`}>{activity.summary}</p> : null}
      {activity.description ? (
        <div className={`mt-6 whitespace-pre-wrap ${justifiedText}`}>{activity.description}</div>
      ) : null}
      {activity.highlights ? (
        <section className="mt-12">
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
        images={activity.images}
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
      <p className="mt-10">
        <Link className={textLink} href={localePath(locale, "activites")}>
          {dictionary.actions.backToActivities}
        </Link>
      </p>
    </>
  );
}
