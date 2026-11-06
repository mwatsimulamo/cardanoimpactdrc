import type { Metadata } from "next";
import { CompetitionBook } from "@/components/CompetitionBook";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/evaluations">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.evaluation.title, dictionary.meta.siteName, locale, "evaluations");
}

export default async function EvaluationPage({ params }: PageProps<"/[locale]/evaluations">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <CompetitionBook locale={locale} />;
}
