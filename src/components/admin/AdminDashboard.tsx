import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { blockTitle, bodyText, justifiedText, primaryLink, secondaryLink, sectionTitle, supportText } from "@/components/classes";
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
  const shortcuts = [
    { href: "admin/annonces", label: "Nouvelle annonce", tone: "primary" as const },
    { href: "admin/activites", label: "Nouvelle activité", tone: "secondary" as const },
    { href: "admin/galerie", label: "Nouvelle image", tone: "secondary" as const },
    { href: "admin/resultats", label: "Saisir les résultats", tone: "secondary" as const },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader title={copy.navDashboard} lede={dictionary.workspace.adminLede} />

      <section aria-label="Synthèse">
        <ul className="admin-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <li key={card.title}>
              <Link
                href={localePath(locale, card.href)}
                className="group block h-full border border-line bg-canvas px-5 py-5 transition-colors duration-150 hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className={`min-w-0 ${supportText}`}>{card.title}</span>
                  <span className="text-brand transition-colors duration-150 group-hover:text-brand-hover" aria-hidden="true">
                    {cardIcon(card.icon)}
                  </span>
                </span>
                <p className={`mt-4 tabular-nums ${blockTitle}`}>{card.value}</p>
                <p className={`mt-2 ${supportText}`}>{card.detail}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-in-up border border-line bg-canvas px-5 py-6 md:px-8" style={{ ["--admin-delay" as string]: "220ms" }} aria-labelledby="admin-shortcuts">
        <h2 id="admin-shortcuts" className={sectionTitle}>
          {copy.shortcuts}
        </h2>
        <p className={`mt-2 ${supportText}`}>Publier ou préparer le prochain contenu depuis ici.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((item) => (
            <Link key={item.href} href={localePath(locale, item.href)} className={item.tone === "primary" ? primaryLink : secondaryLink}>
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="admin-in-left space-y-8" style={{ ["--admin-delay" as string]: "280ms" }}>
          {attention.length > 0 ? (
            <section className="border border-line bg-canvas px-5 py-6">
              <h2 className={sectionTitle}>{copy.attentionTitle}</h2>
              <ul className="mt-4 space-y-3">
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
          <section className="border border-line bg-canvas px-5 py-6">
            <h2 className={sectionTitle}>{copy.recentCampaigns}</h2>
            {mailReady && mail.recent.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {mail.recent.map((item, index) => (
                  <li key={`${item.kind}-${item.subject}-${index}`} className={justifiedText}>
                    {item.kind === "publication" ? "Publication" : "Campagne"} — {item.subject}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`mt-4 ${justifiedText}`}>{copy.emptyCampaigns}</p>
            )}
          </section>
        </div>

        <section className="admin-in-right border border-line bg-canvas px-5 py-6" style={{ ["--admin-delay" as string]: "320ms" }}>
          <h2 className={sectionTitle}>{copy.navCalendar}</h2>
          <p className={`mt-2 ${supportText}`}>État choisi par les organisateurs, indépendant de la date civile.</p>
          <ol className="mt-5 space-y-3">
            {phases.phases.map((phase) => (
              <li key={phase.key} className="border-l-2 border-brand/70 pl-4">
                <p className="font-semibold text-ink">{dictionary.phases[phase.key].title}</p>
                <p className={`mt-1 ${bodyText}`}>{dictionary.timeline[phase.status]}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5">
            <Link href={localePath(locale, "admin/calendrier")} className={secondaryLink}>
              {copy.navCalendar}
            </Link>
          </p>
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
