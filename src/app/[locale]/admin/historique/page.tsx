import type { Metadata } from "next";
import { AdminHistoryScreen } from "@/components/admin/AdminLive";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { privateMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/historique">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return privateMetadata(dictionary.adminUi.navHistory, dictionary.meta.siteName);
}

export default async function Page({ params }: PageProps<"/[locale]/admin/historique">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <AdminHistoryScreen dictionary={getDictionary("fr")} />;
}
