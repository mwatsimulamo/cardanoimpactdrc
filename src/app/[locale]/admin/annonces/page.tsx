import type { Metadata } from "next";
import { AdminAnnouncementScreen } from "@/components/admin/AdminLive";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/annonces">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.adminUi.navAnnouncements, dictionary.meta.siteName);
}

export default async function Page({ params }: PageProps<"/[locale]/admin/annonces">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <AdminAnnouncementScreen dictionary={getDictionary("fr")} />;
}
