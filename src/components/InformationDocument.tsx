import { Suspense } from "react";
import { EditorialCard, EditorialEmptyCard } from "@/components/EditorialCard";
import { ShowMoreGrid } from "@/components/ShowMoreGrid";
import { justifiedText } from "@/components/classes";
import { ContactBoard } from "@/components/ContactBoard";
import { MenuSectionScroll } from "@/components/MenuSectionScroll";
import { PageFrame, PageHeader } from "@/components/PageHeader";
import { getDictionary } from "@/content/get-dictionary";
import { localePath, type Locale } from "@/lib/locales";
import { readPublishedAnnouncements } from "@/lib/published-records";
import { firstRichImage } from "@/lib/rich-text";

const sectionBreak = "mt-20 md:mt-28";

export function InformationDocument({
  locale,
  current,
}: {
  locale: Locale;
  current: "annonces" | "contact";
}) {
  const dictionary = getDictionary(locale);
  const focusId = `section-${current}`;

  return (
    <PageFrame>
      <MenuSectionScroll focusId={focusId} />
      <section aria-labelledby="section-annonces">
        <PageHeader
          id="section-annonces"
          level={current === "annonces" ? 1 : 2}
          title={dictionary.announcements.title}
          lede={dictionary.announcements.lede}
        />
        <Suspense fallback={<p className={`mt-8 ${justifiedText}`}>{dictionary.workspace.loading}</p>}>
          <PublishedAnnouncements locale={locale} dictionary={dictionary} />
        </Suspense>
      </section>

      <section className={sectionBreak} aria-labelledby="section-contact">
        <PageHeader
          id="section-contact"
          level={current === "contact" ? 1 : 2}
          title={dictionary.contact.title}
          lede={dictionary.contact.lede}
        />
        <ContactBoard locale={locale} dictionary={dictionary} />
      </section>
    </PageFrame>
  );
}

async function PublishedAnnouncements({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: ReturnType<typeof getDictionary>;
}) {
  const announcements = (await readPublishedAnnouncements()).filter(
    (item) => item.title[locale].trim().length > 0 && item.body[locale].trim().length > 0,
  );

  if (announcements.length === 0) {
    return (
      <ul className="mt-8 grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
        <li className="h-full">
          <EditorialEmptyCard
            badge={dictionary.home.emptyCardBadge}
            title={dictionary.home.emptyCardTitle}
            body={dictionary.announcements.empty}
          />
        </li>
      </ul>
    );
  }

  return (
    <ShowMoreGrid moreLabel={dictionary.announcements.seeMore}>
      {announcements.map((item) => (
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
    </ShowMoreGrid>
  );
}
