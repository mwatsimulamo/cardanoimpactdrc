import type { Metadata } from "next";
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
  return pageMetadata(dictionary.program.title, dictionary.meta.siteName);
}

export default async function ProgramPage({ params }: PageProps<"/[locale]/programme">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <ProgramPresentation locale={locale} />;
}
