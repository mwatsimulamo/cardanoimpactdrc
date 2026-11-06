import type { Metadata } from "next";
import { CompetitionBook } from "@/components/CompetitionBook";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/equipes">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.participatingTeams.title, dictionary.meta.siteName);
}

export default async function ParticipatingTeamsPage({
  params,
}: PageProps<"/[locale]/equipes">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <CompetitionBook locale={locale} />;
}
