import type { Metadata } from "next";
import { ActivitiesDocument } from "@/components/ActivitiesDocument";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/activites">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.activities.title, dictionary.meta.siteName, locale, "activites");
}

export default async function ActivitiesPage({ params }: PageProps<"/[locale]/activites">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <ActivitiesDocument locale={locale} current="activites" />;
}
