import type { Metadata } from "next";
import { AdminGalleryScreen } from "@/components/admin/AdminLive";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/galerie">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.adminUi.navGallery, dictionary.meta.siteName);
}

export default async function Page({ params }: PageProps<"/[locale]/admin/galerie">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <AdminGalleryScreen dictionary={getDictionary("fr")} />;
}
