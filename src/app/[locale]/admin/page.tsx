import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { privateMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return privateMetadata(dictionary.adminUi.navDashboard, dictionary.meta.siteName);
}

export default async function AdminHomePage({ params }: PageProps<"/[locale]/admin">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <AdminDashboard locale="fr" dictionary={getDictionary("fr")} />;
}
