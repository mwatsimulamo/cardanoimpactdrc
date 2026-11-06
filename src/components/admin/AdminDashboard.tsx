import Link from "next/link";
import { blockTitle, bodyText, justifiedText, pageTitle, sectionTitle, supportText } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import { readMailStats } from "@/lib/email/service";
import { localePath, type Locale } from "@/lib/locales";
import {
  readAdminActivities,
  readAdminAnnouncements,
  readAdminCounts,
  readAdminTeams,
  readPublishedRoadmap,
} from "@/lib/published-records";

export async function AdminDashboard({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const copy = dictionary.adminUi;
  const [phases, counts, teams, announcements, activities, mail] = await Promise.all([
    readPublishedRoadmap(),
    readAdminCounts(),
    readAdminTeams(),
    readAdminAnnouncements(),
    readAdminActivities(),
    readMailStats(),
  ]);
  const submitted = teams.availability === "ready" ? teams.teams.filter((team) => team.status === "submitted") : [];
  const leaders = submitted.reduce((total, team) => total + team.members.filter((member) => member.role === "leader").length, 0);
  const members = submitted.reduce((total, team) => total + team.members.filter((member) => member.role !== "leader").length, 0);
  const publishedAnnouncements = announcements.items.filter((item) => item.status === "published").length;
  const draftAnnouncements = announcements.items.filter((item) => item.status !== "published").length;
  const publishedActivities = activities.items.filter((item) => item.status === "published").length;
  const draftActivities = activities.items.filter((item) => item.status !== "published").length;
  const mailReady = mail.availability === "ready";
  const cards = [
    { href: "admin/equipes", title: "Équipes enregistrées", value: teams.availability === "ready" ? String(submitted.length) : counts.teams, detail: "Équipes soumises.", icon: "teams" },
    { href: "admin/equipes", title: "Responsables", value: teams.availability === "ready" ? String(leaders) : "—", detail: "Un responsable par équipe.", icon: "leader" },
    { href: "admin/equipes", title: "Membres", value: teams.availability === "ready" ? String(members) : "—", detail: "Hors responsables.", icon: "members" },
    { href: "admin/communications", title: "Abonnés actifs", value: mailReady ? String(mail.activeSubscribers) : "—", detail: "Consentement en cours.", icon: "news" },
    { href: "admin/annonces", title: "Annonces publiées", value: announcements.availability === "ready" ? String(publishedAnnouncements) : "—", detail: announcements.availability === "ready" ? `${draftAnnouncements} brouillon(s).` : "Donnée indisponible.", icon: "note" },
    { href: "admin/activites", title: "Activités publiées", value: activities.availability === "ready" ? String(publishedActivities) : "—", detail: activities.availability === "ready" ? `${draftActivities} brouillon(s).` : "Donnée indisponible.", icon: "activity" },
    { href: "admin/resultats", title: "Résultat publié", value: counts.results, detail: "0 ou 1. Les notes restent privées.", icon: "result" },
    { href: "admin/communications", title: "Courriels envoyés", value: mailReady ? String(mail.sent) : "—", detail: mailReady ? `${mail.failed} échec(s), ${mail.pending} en attente.` : "Journal indisponible.", icon: "sent" },
  ] as const;
  const attention = [
    draftAnnouncements > 0 ? { href: "admin/annonces", text: `${draftAnnouncements} annonce(s) encore en brouillon.` } : null,
    draftActivities > 0 ? { href: "admin/activites", text: `${draftActivities} activité(s) encore en brouillon.` } : null,
    mailReady && mail.failed > 0 ? { href: "admin/communications", text: `${mail.failed} envoi(s) en échec à reprendre.` } : null,
    mailReady && mail.pending > 0 ? { href: "admin/communications", text: `${mail.pending} envoi(s) encore en attente.` } : null,
  ].filter((item) => item !== null);

  return (
    <div className="space-y-10">
      <header>
        <h1 className={pageTitle}>{copy.navDashboard}</h1>
        <p className={`mt-3 max-w-3xl ${bodyText}`}>{dictionary.workspace.adminLede}</p>
      </header>
      <section aria-label="Synthèse">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <li key={card.title}>
              <Link href={localePath(locale, card.href)} className="block h-full border border-line bg-canvas px-5 py-5 hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                <span className="text-brand" aria-hidden="true">{cardIcon(card.icon)}</span>
                <p className={`mt-3 ${supportText}`}>{card.title}</p>
                <p className={`mt-2 ${blockTitle}`}>{card.value}</p>
                <p className={`mt-2 ${supportText}`}>{card.detail}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <div className="max-w-3xl space-y-8 border-t border-line pt-8">
      {attention.length > 0 ? (
        <section>
          <h2 className={sectionTitle}>À traiter</h2>
          <ul className="mt-3 space-y-2">
            {attention.map((item) => (
              <li key={item.text}>
                <Link href={localePath(locale, item.href)} className={`${justifiedText} underline decoration-brand underline-offset-2`}>
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section>
        <h2 className={sectionTitle}>Campagnes récentes</h2>
        {mailReady && mail.recent.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {mail.recent.map((item, index) => (
              <li key={`${item.kind}-${item.subject}-${index}`} className={justifiedText}>
                {item.kind === "publication" ? "Publication" : "Campagne"} — {item.subject}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`mt-3 ${justifiedText}`}>Aucune campagne indépendante ou notification de publication.</p>
        )}
      </section>
      <section>
        <h2 className={sectionTitle}>{copy.navCalendar}</h2>
        <ol className="mt-3 space-y-2">
          {phases.phases.map((phase) => (
            <li key={phase.key} className={justifiedText}>
              {dictionary.phases[phase.key].title}. {dictionary.timeline[phase.status]}.
            </li>
          ))}
        </ol>
      </section>
      </div>
    </div>
  );
}

function cardIcon(name: "teams" | "leader" | "members" | "news" | "note" | "activity" | "result" | "sent") {
  const paths: Record<typeof name, string> = {
    teams: "M4 19v-2a4 4 0 0 1 4-4h2M16 19v-2a4 4 0 0 0-4-4H10M12 7a3 3 0 1 0 0.01 0",
    leader: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 8a7 7 0 0 1 14 0",
    members: "M8 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zM3 19a5 5 0 0 1 8-4 5 5 0 0 1 8 4",
    news: "M5 6h14v12H5zM8 10h8M8 14h5",
    note: "M7 4h8l4 4v12H7zM15 4v4h4",
    activity: "M5 6h14v4H5zm0 6h14v6H5z",
    result: "M6 18V9m6 9V6m6 12v-7",
    sent: "M4 6h16v12H4zm0 0 8 7 8-7",
  };
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d={paths[name]} />
    </svg>
  );
}
