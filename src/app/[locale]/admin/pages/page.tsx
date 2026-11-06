import type { Metadata } from "next";
import { AdminNoteScreen } from "@/components/admin/AdminLive";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { privateMetadata } from "@/lib/metadata";

export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/pages">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return privateMetadata(dictionary.adminUi.navPages, dictionary.meta.siteName);
}

export default async function Page({ params }: PageProps<"/[locale]/admin/pages">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return (
    <AdminNoteScreen
      title={getDictionary("fr").adminUi.navPages}
      body="Les pages du programme, du guide et de la FAQ restent dans les fichiers du site. Cet écran ne les réécrit pas."
    />
  );
}
