import type { Metadata } from "next";
import { Suspense } from "react";
import { bodyText } from "@/components/classes";
import { PageFrame } from "@/components/PageHeader";
import { RegistrationForm } from "@/components/RegistrationForm";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale, type Locale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";
import { readRegistrationAvailability } from "@/lib/registration-gate";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/inscription">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.registration.title, dictionary.meta.siteName, locale, "inscription");
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
      <Suspense fallback={<p className={bodyText}>{dictionary.workspace.loading}</p>}>
        <RegistrationScreen locale={locale} />
      </Suspense>
    </PageFrame>
  );
}

async function RegistrationScreen({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const availability = await readRegistrationAvailability();

  return <RegistrationForm locale={locale} dictionary={dictionary} availability={availability} />;
}
