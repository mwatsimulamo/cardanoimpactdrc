import type { Metadata } from "next";
import { AdminResultScreen } from "@/components/admin/AdminLive";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { privateMetadata } from "@/lib/metadata";

export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/resultats">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return privateMetadata(dictionary.adminUi.navResults, dictionary.meta.siteName);
}

export default async function Page({ params }: PageProps<"/[locale]/admin/resultats">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <AdminResultScreen dictionary={getDictionary("fr")} />;
}
