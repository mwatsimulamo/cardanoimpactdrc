import type { Metadata } from "next";
import { Suspense } from "react";
import { bodyText } from "@/components/classes";
import { PageFrame, PageHeader } from "@/components/PageHeader";
import { PublicRoadmap } from "@/components/PublicRoadmap";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/feuille-de-route">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.roadmap.title, dictionary.meta.siteName);
}

export default async function RoadmapPage({ params }: PageProps<"/[locale]/feuille-de-route">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);

  return (
    <PageFrame>
      <PageHeader title={dictionary.roadmap.title} lede={dictionary.roadmap.lede} />
      <Suspense fallback={<p className={`mt-8 ${bodyText}`}>{dictionary.workspace.loading}</p>}>
        <PublicRoadmap locale={locale} dictionary={dictionary} />
      </Suspense>
    </PageFrame>
  );
}
