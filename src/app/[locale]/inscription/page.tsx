import type { Metadata } from "next";
import { PageFrame } from "@/components/PageHeader";
import { RegistrationForm } from "@/components/RegistrationForm";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/inscription">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.registration.title, dictionary.meta.siteName);
}

export default async function RegistrationPage({
  params,
}: PageProps<"/[locale]/inscription">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);

  return (
    <PageFrame>
      <RegistrationForm locale={locale} dictionary={dictionary} />
    </PageFrame>
  );
}
