import type { Metadata } from "next";
import { AdminActivityScreen } from "@/components/admin/AdminLive";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/activites">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.adminUi.navActivities, dictionary.meta.siteName);
}

export default async function Page({ params }: PageProps<"/[locale]/admin/activites">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <AdminActivityScreen dictionary={getDictionary("fr")} />;
}
