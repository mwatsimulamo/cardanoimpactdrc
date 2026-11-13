import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { pageTitle, supportText, textLink } from "@/components/classes";
import { PageFrame } from "@/components/PageHeader";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale, localePath, locales, type Locale } from "@/lib/locales";
import { pageMetadata, privateMetadata } from "@/lib/metadata";
import { readPublishedAnnouncements } from "@/lib/published-records";

export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/annonces/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  const announcement = await publishedAnnouncement(slug);
  if (
    !announcement ||
    announcement.title[locale].trim().length === 0 ||
    announcement.body[locale].trim().length === 0
  ) {
    return privateMetadata(dictionary.notFound.title, dictionary.meta.siteName);
  }

  const available = locales.filter(
    (item) => announcement.title[item].trim().length > 0 && announcement.body[item].trim().length > 0,
  );
  return pageMetadata(
    announcement.title[locale],
    dictionary.meta.siteName,
    locale,
    `annonces/${slug}`,
    available,
  );
}

export default async function AnnouncementPage({
  params,
}: PageProps<"/[locale]/annonces/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const announcement = await publishedAnnouncement(slug);
  if (
    !announcement ||
    announcement.title[locale].trim().length === 0 ||
    announcement.body[locale].trim().length === 0
  ) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <PageFrame>
      <article className="w-full">
        <header>
          <p className={supportText}>
            <span className="font-semibold uppercase tracking-[0.04em] text-brand">{dictionary.announcements.badge}</span>
            <span className="mx-2 text-line" aria-hidden="true">
              ·
            </span>
            <time dateTime={announcement.publishedAt}>{formatDate(announcement.publishedAt, locale)}</time>
          </p>
          <h1 className={`mt-4 max-w-none ${pageTitle}`}>{announcement.title[locale]}</h1>
        </header>
        <div className="mt-8 w-full md:mt-10">
          <ArticleBody text={announcement.body[locale]} />
        </div>
        <p className="mt-12">
          <Link className={textLink} href={localePath(locale, "annonces")}>
            {dictionary.actions.backToAnnouncements}
          </Link>
        </p>
      </article>
    </PageFrame>
  );
}

async function publishedAnnouncement(slug: string) {
  const items = await readPublishedAnnouncements();
  return items.find((item) => item.slug === slug);
}

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lubumbashi",
  }).format(new Date(value));
}
