import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { bodyText, primaryLink } from "@/components/classes";
import { PageFrame, PageHeader } from "@/components/PageHeader";
import { ProgramPhases } from "@/components/ProgramPhases";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale, localePath } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/calendrier">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.schedule.title, dictionary.meta.siteName, locale, "calendrier");
}

export default async function SchedulePage({ params }: PageProps<"/[locale]/calendrier">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);

  return (
    <PageFrame>
      <PageHeader id="section-calendrier" title={dictionary.schedule.title} lede={dictionary.schedule.lede} />
      <Suspense fallback={<p className={`mt-8 ${bodyText}`}>{dictionary.workspace.loading}</p>}>
        <ProgramPhases locale={locale} dictionary={dictionary} detailed idPrefix="calendrier" />
      </Suspense>
      <div className="mt-10">
        <Link className={primaryLink} href={localePath(locale, "inscription")}>
          {dictionary.nav.register}
        </Link>
      </div>
    </PageFrame>
  );
}
