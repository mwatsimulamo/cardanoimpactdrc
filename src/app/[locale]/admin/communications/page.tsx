import type { Metadata } from "next";
import { AdminCommunications } from "@/components/admin/AdminCommunications";
import { getDictionary } from "@/content/get-dictionary";
import { readAdminSession } from "@/lib/admin-session";
import { listDeliveries, listSubscribers, listTeamRecipients } from "@/lib/email/service";
import { isLocale } from "@/lib/locales";
import { privateMetadata } from "@/lib/metadata";

export const instant = false;

type CommunicationsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: CommunicationsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return privateMetadata(dictionary.adminUi.navCommunications, dictionary.meta.siteName);
}

export default async function Page({ params }: CommunicationsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale) || !(await readAdminSession())) {
    return null;
  }

  const [subscribers, teams, deliveries] = await Promise.all([
    listSubscribers().catch(() => ({ availability: "error" as const, rows: [] as const })),
    listTeamRecipients().catch(() => ({ availability: "error" as const, rows: [] as const })),
    listDeliveries().catch(() => ({ availability: "error" as const, rows: [] as const })),
  ]);
  const availability = subscribers.availability !== "ready" ? subscribers.availability : teams.availability !== "ready" ? teams.availability : deliveries.availability !== "ready" ? deliveries.availability : "ready";

  return (
    <AdminCommunications
      subscribers={subscribers.rows}
      teams={teams.rows}
      deliveries={deliveries.rows}
      availability={availability}
    />
  );
}
