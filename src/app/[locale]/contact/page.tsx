import type { Metadata } from "next";
import { InformationDocument } from "@/components/InformationDocument";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.contact.title, dictionary.meta.siteName);
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <InformationDocument locale={locale} current="contact" />;
}
