import type { Metadata } from "next";
import { Suspense } from "react";
import { EditorialCard, EditorialEmptyCard } from "@/components/EditorialCard";
import { ShowMoreGrid } from "@/components/ShowMoreGrid";
import { PageFrame, PageHeader } from "@/components/PageHeader";
import { getDictionary } from "@/content/get-dictionary";
import type { Dictionary } from "@/content/types";
import { listPublicActivities } from "@/lib/documented-activities";
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
  return pageMetadata(dictionary.activities.title, dictionary.meta.siteName, locale, "activites");
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
  const activities = [...(await listPublicActivities(locale))].sort((left, right) =>
    right.occurredOn.localeCompare(left.occurredOn),
  );

  if (activities.length === 0) {
    return (
      <ul className="mt-10 grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
        <li className="h-full">
          <EditorialEmptyCard
            badge={dictionary.home.emptyCardBadge}
            title={dictionary.home.emptyCardTitle}
            body={dictionary.activities.empty}
          />
        </li>
      </ul>
    );
  }

  return (
    <div className="mt-10">
      <ShowMoreGrid moreLabel={dictionary.activities.seeMore}>
        {activities.map((activity) => {
          const image = activity.images[0];
          return (
            <li key={activity.slug} className="h-full">
              <EditorialCard
                href={localePath(locale, `activites/${activity.slug}`)}
                title={activity.title}
                badge={dictionary.activities.categories[activity.category]}
                imageSrc={image?.src}
                imageAlt={image?.alt ?? ""}
              />
            </li>
          );
        })}
      </ShowMoreGrid>
    </div>
  );
}
