import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActivityDetail } from "@/components/ActivityDetail";
import { PageFrame } from "@/components/PageHeader";
import { getDictionary } from "@/content/get-dictionary";
import { getPublicActivity } from "@/lib/documented-activities";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/activites/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  const activity = await getPublicActivity(slug, locale);
  if (!activity) {
    return pageMetadata(dictionary.notFound.title, dictionary.meta.siteName);
  }

  return pageMetadata(activity.title, dictionary.meta.siteName);
}

export default async function ActivityPage({
  params,
}: PageProps<"/[locale]/activites/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const activity = await getPublicActivity(slug, locale);
  if (!activity) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <PageFrame>
      <ActivityDetail activity={activity} locale={locale} dictionary={dictionary} />
    </PageFrame>
  );
}
