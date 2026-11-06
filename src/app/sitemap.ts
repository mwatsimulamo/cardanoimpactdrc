import type { MetadataRoute } from "next";
import { listPublicActivities } from "@/lib/documented-activities";
import { locales, localePath, type Locale } from "@/lib/locales";
import { readPublishedAnnouncements } from "@/lib/published-records";

const siteUrl = "https://www.cardanoimpactdrc.org";

const publicSegments = [
  "",
  "programme",
  "calendrier",
  "concours",
  "equipes",
  "evaluations",
  "inscription",
  "annonces",
  "activites",
  "resultats",
  "faq",
  "contact",
  "feuille-de-route",
  "galerie",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = publicSegments.flatMap((segment) => localizedEntries(segment, locales));
  const announcements = await readPublishedAnnouncements();
  const activities = await listPublicActivities("fr");

  for (const item of announcements) {
    if (!isPublicSegment(item.slug)) {
      continue;
    }

    const available = locales.filter(
      (locale) => item.title[locale].trim().length > 0 && item.body[locale].trim().length > 0,
    );
    entries.push(...localizedEntries(`annonces/${item.slug}`, available));
  }

  for (const activity of activities) {
    if (!isPublicSegment(activity.slug)) {
      continue;
    }

    entries.push(...localizedEntries(`activites/${activity.slug}`, locales));
  }

  return entries;
}

function localizedEntries(segment: string, available: readonly Locale[]): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    available.map((locale) => [locale, absolute(localePath(locale, segment))]),
  );

  return available.map((locale) => ({
    url: absolute(localePath(locale, segment)),
    alternates: { languages },
  }));
}

function absolute(path: string): string {
  return `${siteUrl}${path}`;
}

function isPublicSegment(slug: string): boolean {
  return slug.length > 0 && !slug.includes("/") && slug !== "." && slug !== "..";
}
