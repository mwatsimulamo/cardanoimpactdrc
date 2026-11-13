import { Suspense } from "react";
import { EditorialCard, EditorialEmptyCard } from "@/components/EditorialCard";
import { MenuSectionScroll } from "@/components/MenuSectionScroll";
import { PageFrame, PageHeader } from "@/components/PageHeader";
import { PublicGallery } from "@/components/PublicGallery";
import { ShowMoreGrid } from "@/components/ShowMoreGrid";
import { getDictionary } from "@/content/get-dictionary";
import type { Dictionary } from "@/content/types";
import { listPublicActivities } from "@/lib/documented-activities";
import { listGalleryItems } from "@/lib/editorial-store";
import { localePath, type Locale } from "@/lib/locales";

const sectionBreak = "mt-20 md:mt-28";

export function ActivitiesDocument({
  locale,
  current,
}: {
  locale: Locale;
  current: "activites" | "galerie";
}) {
  const dictionary = getDictionary(locale);
  const focusId = current === "galerie" ? "section-galerie" : "section-activites";

  return (
    <PageFrame>
      <MenuSectionScroll focusId={focusId} />
      <section aria-labelledby="section-activites">
        <PageHeader
          id="section-activites"
          level={current === "activites" ? 1 : 2}
          title={dictionary.activities.title}
          lede={dictionary.activities.lede}
        />
        <Suspense fallback={null}>
          <PublishedActivities locale={locale} dictionary={dictionary} />
        </Suspense>
      </section>

      <section className={sectionBreak} aria-labelledby="section-galerie">
        <PageHeader
          id="section-galerie"
          level={current === "galerie" ? 1 : 2}
          title={dictionary.gallery.title}
          lede={dictionary.gallery.lede}
        />
        <Suspense fallback={<PublicGallery dictionary={dictionary} status="loading" />}>
          <PublishedGallery dictionary={dictionary} />
        </Suspense>
      </section>
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

async function PublishedGallery({ dictionary }: { dictionary: Dictionary }) {
  const records = await listGalleryItems();
  const items =
    records === "missing" || records === "error"
      ? []
      : records
          .filter((item) => item.status === "published" && item.hasImage && item.description.trim().length > 0)
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
          .map((item) => ({
            id: item.id,
            src: `/media/gallery/${item.id}?v=${encodeURIComponent(item.updatedAt)}`,
            description: item.description,
          }));

  return <PublicGallery dictionary={dictionary} items={items} status={records === "error" ? "error" : "ready"} />;
}
