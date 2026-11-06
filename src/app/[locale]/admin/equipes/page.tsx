import type { Metadata } from "next";
import { AdminTeamsScreen } from "@/components/admin/AdminLive";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/equipes">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.adminUi.navTeams, dictionary.meta.siteName);
}

export default async function AdminTeamsPage({ params }: PageProps<"/[locale]/admin/equipes">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <AdminTeamsScreen dictionary={getDictionary("fr")} />;
}
