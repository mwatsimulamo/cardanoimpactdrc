import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { blockTitle, justifiedText, supportText, textLink } from "@/components/classes";
import { OriginalImage } from "@/components/OriginalImage";
import { PageFrame, PageHeader } from "@/components/PageHeader";
import { getDictionary } from "@/content/get-dictionary";
import type { Dictionary } from "@/content/types";
import {
  activityCategories,
  formatCivilDate,
  listPublicActivities,
} from "@/lib/documented-activities";
import { isLocale, localePath, type Locale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/activites">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.activities.title, dictionary.meta.siteName);
}

export default async function ActivitiesPage({ params }: PageProps<"/[locale]/activites">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);

  return (
    <PageFrame>
      <PageHeader id="section-activites" title={dictionary.activities.title} lede={dictionary.activities.lede} />
      <Suspense fallback={null}>
        <PublishedActivities locale={locale} dictionary={dictionary} />
      </Suspense>
    </PageFrame>
  );
}

async function PublishedActivities({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const activities = await listPublicActivities(locale);

  if (activities.length === 0) {
    return <p className={`mt-8 ${justifiedText}`}>{dictionary.activities.empty}</p>;
  }

  return (
        <div className="mt-10 space-y-12">
          {activityCategories.map((category) => {
            const items = activities.filter((activity) => activity.category === category);
            if (items.length === 0) {
              return null;
            }

            return (
              <section key={category}>
                <h2 className={blockTitle}>{dictionary.activities.categories[category]}</h2>
                <ul className="mt-4 grid gap-4 md:grid-cols-2">
                  {items.map((activity) => {
                    const image = activity.images[0];
                    return (
                      <li key={activity.slug} className="flex h-full flex-col border border-line bg-canvas">
                        {image ? (
                          <OriginalImage src={image.src} alt={image.alt} className="aspect-[4/3] w-full object-cover" />
                        ) : (
                          <div className="aspect-[4/3] bg-surface" />
                        )}
                        <div className="flex flex-1 flex-col px-5 py-5">
                          <p className={supportText}>
                            <time dateTime={activity.occurredOn}>{formatCivilDate(activity.occurredOn, locale)}</time>
                          </p>
                          <Link
                            className={`mt-2 inline-block ${blockTitle} ${textLink}`}
                            href={localePath(locale, `activites/${activity.slug}`)}
                          >
                            {activity.title}
                          </Link>
                          {activity.summary ? <p className={`mt-2 line-clamp-4 ${justifiedText}`}>{activity.summary}</p> : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
  );
}
