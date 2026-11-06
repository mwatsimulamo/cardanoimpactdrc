import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { justifiedText, supportText, textLink } from "@/components/classes";
import { PageFrame, PageHeader } from "@/components/PageHeader";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale, localePath, type Locale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";
import { getPublishedAnnouncement } from "@/lib/public-data";

export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/annonces/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  const announcement = getPublishedAnnouncement(slug);
  if (!announcement || announcement.title[locale].trim().length === 0) {
    return pageMetadata(dictionary.notFound.title, dictionary.meta.siteName);
  }

  return pageMetadata(announcement.title[locale], dictionary.meta.siteName);
}

export default async function AnnouncementPage({
  params,
}: PageProps<"/[locale]/annonces/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const announcement = getPublishedAnnouncement(slug);
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
      <PageHeader title={announcement.title[locale]} />
      <p className={`mt-4 ${supportText}`}>
        <time dateTime={announcement.publishedAt}>
          {formatDate(announcement.publishedAt, locale)}
        </time>
      </p>
      <div className={`mt-8 whitespace-pre-wrap ${justifiedText}`}>{announcement.body[locale]}</div>
      <p className="mt-8">
        <Link className={textLink} href={localePath(locale, "annonces")}>
          {dictionary.actions.backToAnnouncements}
        </Link>
      </p>
    </PageFrame>
  );
}

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lubumbashi",
  }).format(new Date(value));
}
