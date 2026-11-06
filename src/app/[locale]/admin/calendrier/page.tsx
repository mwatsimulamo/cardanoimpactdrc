import type { Metadata } from "next";
import { AdminCalendarScreen } from "@/components/admin/AdminLive";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/calendrier">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.adminUi.navCalendar, dictionary.meta.siteName);
}

export default async function Page({ params }: PageProps<"/[locale]/admin/calendrier">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <AdminCalendarScreen dictionary={getDictionary("fr")} />;
}
