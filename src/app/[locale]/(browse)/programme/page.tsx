import type { Metadata } from "next";
import { Suspense } from "react";
import { bodyText } from "@/components/classes";
import { ProgramPresentation } from "@/components/ProgramPresentation";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/programme">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.program.title, dictionary.meta.siteName, locale, "programme");
}

export default async function ProgramPage({ params }: PageProps<"/[locale]/programme">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);

  return (
    <Suspense fallback={<p className={`mx-auto max-w-[72rem] px-5 py-16 ${bodyText}`}>{dictionary.workspace.loading}</p>}>
      <ProgramPresentation locale={locale} />
    </Suspense>
  );
}
