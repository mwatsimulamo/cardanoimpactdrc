import type { Metadata } from "next";
import { locales, localePath, type Locale } from "@/lib/locales";

export const canonicalOrigin = "https://www.cardanoimpactdrc.org";

export function pageMetadata(
  pageTitle: string,
  siteName: string,
  locale: Locale,
  segment = "",
  available: readonly Locale[] = locales,
): Metadata {
  const languages = Object.fromEntries(
    available.map((item) => [item, localePath(item, segment)]),
  );

  return {
    metadataBase: new URL(canonicalOrigin),
    title: {
      absolute: `${pageTitle} — ${siteName}`,
    },
    alternates: {
      canonical: localePath(locale, segment),
      languages,
    },
  };
}

export function privateMetadata(pageTitle: string, siteName: string): Metadata {
  return {
    title: {
      absolute: `${pageTitle} — ${siteName}`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}
