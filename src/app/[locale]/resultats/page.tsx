import type { Metadata } from "next";
import { CompetitionBook } from "@/components/CompetitionBook";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/resultats">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.results.title, dictionary.meta.siteName, locale, "resultats");
}

export default async function ResultsPage({ params }: PageProps<"/[locale]/resultats">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <CompetitionBook locale={locale} />;
}
