import type { Metadata } from "next";
import { ActivitiesDocument } from "@/components/ActivitiesDocument";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/galerie">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.gallery.title, dictionary.meta.siteName, locale, "galerie");
}

export default async function GalleryPage({ params }: PageProps<"/[locale]/galerie">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <ActivitiesDocument locale={locale} current="galerie" />;
}
