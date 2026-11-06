import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { LeaderWorkspace } from "@/components/LeaderWorkspace";
import { PageFrame } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import type { Dictionary } from "@/content/types";
import { getDictionary } from "@/content/get-dictionary";
import { loadLeaderTeam } from "@/lib/leader-workspace";
import { isLocale, type Locale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/equipe">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.workspace.accessTitle, dictionary.meta.siteName);
}

export default async function LeaderPage({ params }: PageProps<"/[locale]/equipe">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);

  return (
    <PageFrame>
      <Suspense fallback={<StatusMessage>{dictionary.workspace.loading}</StatusMessage>}>
        <LiveLeaderWorkspace locale={locale} dictionary={dictionary} />
      </Suspense>
    </PageFrame>
  );
}

async function LiveLeaderWorkspace({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  await connection();
  const initialTeam = await loadLeaderTeam();
  return <LeaderWorkspace locale={locale} dictionary={dictionary} initialTeam={initialTeam} />;
}
