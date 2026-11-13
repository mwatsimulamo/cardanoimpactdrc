import "server-only";

import { unstable_rethrow } from "next/navigation";

import { listActivities } from "@/lib/editorial-store";
import type { Locale } from "@/lib/locales";

export const activityCategories = [
  "online_training",
  "team_research",
  "competition_submission",
  "jury_evaluation",
  "closing_workshop",
] as const;

export type ActivityCategory = (typeof activityCategories)[number];

export type ActivityFormat = "online" | "in_person";

type Localized = Record<Locale, string>;

export type ActivitySpeakerRecord = {
  id: string;
  fullName: string;
  title: Localized;
  biography: Localized;
  biographyConsent: boolean;
  organization: string;
  profileUrl: string | null;
  portraitSrc: string | null;
  portraitAlt: Localized;
  portraitConsent: boolean;
  role: Localized;
  sortOrder: number;
  namePublicationConsent: boolean;
};

export type ActivityMediaRecord = {
  id: string;
  /** Chemin public de l'original, ou clé de stockage future. Le fichier n'est pas transformé. */
  src: string;
  caption: Localized;
  alt: Localized;
  sortOrder: number;
  status: "draft" | "published" | "unpublished";
  identifiablePeople: boolean;
  publicationPermitted: boolean;
};

export type ActivityResourceRecord = {
  id: string;
  kind: "presentation" | "recording" | "forum_article" | "external";
  title: Localized;
  url: string;
  sortOrder: number;
};

export type DocumentedActivityRecord = {
  slug: string;
  category: ActivityCategory;
  title: Localized;
  summary: Localized;
  description: Localized;
  highlights: Localized;
  format: ActivityFormat | null;
  location: Localized;
  occurredOn: string;
  occurredUntil: string | null;
  status: "draft" | "published" | "unpublished";
  speakers: readonly ActivitySpeakerRecord[];
  media: readonly ActivityMediaRecord[];
  resources: readonly ActivityResourceRecord[];
};

export type PublicActivitySpeaker = {
  id: string;
  fullName: string;
  role: string;
  title: string;
  organization: string;
  biography: string | null;
  biographyUnavailable: boolean;
  profileUrl: string | null;
  portraitSrc: string | null;
  portraitAlt: string;
};

export type PublicActivityImage = {
  id: string;
  src: string;
  caption: string;
  alt: string;
};

export type PublicActivityResource = {
  id: string;
  title: string;
  url: string;
};

export type PublicActivity = {
  slug: string;
  category: ActivityCategory;
  title: string;
  summary: string;
  description: string;
  highlights: string;
  format: ActivityFormat | null;
  location: string;
  occurredOn: string;
  occurredUntil: string | null;
  speakers: readonly PublicActivitySpeaker[];
  images: readonly PublicActivityImage[];
  resources: readonly PublicActivityResource[];
};

/**
 * Aucune activité réelle n'a été fournie. Ce tableau reste vide jusqu'à une saisie d'organisateur.
 * Il sera remplacé par la lecture de `documented_activities` lorsque Supabase sera demandé.
 */
const documentedActivities: readonly DocumentedActivityRecord[] = [];

export async function listPublicActivities(locale: Locale): Promise<readonly PublicActivity[]> {
  const records = await loadDocumentedRecords();
  return records
    .map((record) => toPublicActivity(record, locale))
    .filter((record): record is PublicActivity => record !== null)
    .sort((left, right) => {
      const categoryOrder =
        activityCategories.indexOf(left.category) - activityCategories.indexOf(right.category);
      if (categoryOrder !== 0) {
        return categoryOrder;
      }

      return left.occurredOn.localeCompare(right.occurredOn);
    });
}

export async function getPublicActivity(slug: string, locale: Locale): Promise<PublicActivity | null> {
  const records = await loadDocumentedRecords();
  const record = records.find((item) => item.slug === slug);
  if (!record) {
    return null;
  }

  return toPublicActivity(record, locale);
}

export function formatCivilDate(value: string, locale: Locale): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return value;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

async function loadDocumentedRecords(): Promise<readonly DocumentedActivityRecord[]> {
  if (documentedActivities.length > 0) {
    return documentedActivities;
  }

  try {
    const data = await listActivities();
    if (data === "missing" || data === "error") {
      return [];
    }

    return data.flatMap((row) => {
      const category = row.category;
      if (!activityCategories.includes(category as ActivityCategory)) {
        return [];
      }

      const text = row.description.trim();
      const record: DocumentedActivityRecord = {
        slug: row.slug,
        category: category as ActivityCategory,
        title: { fr: row.title, en: row.title },
        // Pas de résumé séparé : le corps passe par ArticleBody (HTML rendu).
        summary: { fr: "", en: "" },
        description: { fr: text, en: text },
        highlights: { fr: "", en: "" },
        format: null,
        location: { fr: "", en: "" },
        occurredOn: row.occurredOn,
        occurredUntil: null,
        status: row.status === "published" ? "published" : "draft",
        speakers: [],
        media: row.hasImage
          ? [
              {
                id: row.id,
                src: `/media/activity/${row.id}?v=${encodeURIComponent(row.updatedAt)}`,
                caption: { fr: "", en: "" },
                alt: { fr: row.title, en: row.title },
                sortOrder: 0,
                status: row.status === "published" ? "published" : "draft",
                identifiablePeople: false,
                publicationPermitted: true,
              },
            ]
          : [],
        resources: [],
      };
      return [record];
    });
  } catch (error) {
    unstable_rethrow(error);
    return [];
  }
}

function toPublicActivity(record: DocumentedActivityRecord, locale: Locale): PublicActivity | null {
  if (record.status !== "published") {
    return null;
  }

  if (record.title.fr.trim().length === 0 || record.title.en.trim().length === 0) {
    return null;
  }

  if (!isCivilDate(record.occurredOn) || record.occurredOn > todayInGoma()) {
    return null;
  }

  if (
    record.occurredUntil &&
    (!isCivilDate(record.occurredUntil) || record.occurredUntil < record.occurredOn)
  ) {
    return null;
  }

  return {
    slug: record.slug,
    category: record.category,
    title: record.title[locale],
    summary: record.summary[locale].trim(),
    description: record.description[locale].trim(),
    highlights: record.highlights[locale].trim(),
    format: record.format,
    location: record.location[locale].trim(),
    occurredOn: record.occurredOn,
    occurredUntil: record.occurredUntil,
    speakers: record.category === "jury_evaluation" ? [] : publicSpeakers(record.speakers, locale),
    images: publicImages(record.media, locale),
    resources: publicResources(record.resources, locale),
  };
}

function publicSpeakers(
  speakers: readonly ActivitySpeakerRecord[],
  locale: Locale,
): readonly PublicActivitySpeaker[] {
  return speakers
    .filter((speaker) => speaker.namePublicationConsent && speaker.fullName.trim().length > 0)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((speaker) => {
      const biography = speaker.biographyConsent ? speaker.biography[locale].trim() : "";
      const otherLocale: Locale = locale === "fr" ? "en" : "fr";
      const otherBiography = speaker.biographyConsent ? speaker.biography[otherLocale].trim() : "";
      const portraitAlt = speaker.portraitAlt[locale].trim();
      const portraitSrc =
        speaker.portraitConsent && portraitAlt.length > 0
          ? resolveOriginalImage(speaker.portraitSrc)
          : null;

      return {
        id: speaker.id,
        fullName: speaker.fullName.trim(),
        role: speaker.role[locale].trim(),
        title: speaker.title[locale].trim(),
        organization: speaker.organization.trim(),
        biography: biography.length > 0 ? biography : null,
        biographyUnavailable: biography.length === 0 && otherBiography.length > 0,
        profileUrl: httpsUrl(speaker.profileUrl),
        portraitSrc,
        portraitAlt,
      };
    });
}

function publicImages(
  media: readonly ActivityMediaRecord[],
  locale: Locale,
): readonly PublicActivityImage[] {
  return media
    .filter((image) => image.status === "published")
    .filter((image) => !image.identifiablePeople || image.publicationPermitted)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .flatMap((image) => {
      const src = resolveOriginalImage(image.src);
      const caption = image.caption[locale].trim();
      const alt = image.alt[locale].trim();
      if (!src || (caption.length === 0 && alt.length === 0)) {
        return [];
      }

      return [{ id: image.id, src, caption, alt: alt || caption }];
    });
}

function publicResources(
  resources: readonly ActivityResourceRecord[],
  locale: Locale,
): readonly PublicActivityResource[] {
  return resources
    .filter((resource) => resource.title.fr.trim().length > 0 && resource.title.en.trim().length > 0)
    .filter((resource) =>
      resource.kind === "forum_article" ? isForumUrl(resource.url) : httpsUrl(resource.url) !== null,
    )
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((resource) => ({
      id: resource.id,
      title: resource.title[locale].trim(),
      url: resource.url,
    }));
}

/** Sert l'original tel quel. Une clé de stockage Supabase reste invisible tant que le seau n'existe pas. */
export function resolveOriginalImage(src: string | null): string | null {
  if (!src) {
    return null;
  }

  if (src.startsWith("/") && !src.startsWith("//")) {
    return src;
  }

  return httpsUrl(src);
}

function httpsUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

function isForumUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "forum.cardano.org";
  } catch {
    return false;
  }
}

function isCivilDate(value: string): boolean {
  return /^(\d{4})-(\d{2})-(\d{2})$/.test(value);
}

function todayInGoma(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lubumbashi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
