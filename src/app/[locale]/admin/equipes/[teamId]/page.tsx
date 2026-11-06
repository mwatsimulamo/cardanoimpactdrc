import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminTeamDetail } from "@/components/AdminWorkspace";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";
import { getPreviewTeam, previewTeams } from "@/lib/preview-workspace";

export async function generateStaticParams() {
  return previewTeams.map((team) => ({ teamId: team.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/equipes/[teamId]">): Promise<Metadata> {
  const { locale, teamId } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  const team = previewTeams.find((item) => item.id === teamId);
  return pageMetadata(team?.name ?? dictionary.workspace.adminTitle, dictionary.meta.siteName);
}

export default async function AdminTeamPage({
  params,
}: PageProps<"/[locale]/admin/equipes/[teamId]">) {
  const { locale, teamId } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  const team = previewTeams.find((item) => item.id === teamId);
  if (!team) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  return <AdminTeamDetail locale={locale} dictionary={dictionary} team={getPreviewTeam(team.id)} />;
}
