import Link from "next/link";
import { blockTitle, bodyText, pageTitle, supportText, textLink } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import { localePath, type Locale } from "@/lib/locales";
import { readAdminCounts, readPublishedRoadmap } from "@/lib/published-records";

export async function AdminDashboard({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const copy = dictionary.adminUi;
  const phases = (await readPublishedRoadmap()).phases;
  const counts = await readAdminCounts();

  return (
    <div className="space-y-8">
      <h1 className={pageTitle}>{copy.navDashboard}</h1>
      <p className={bodyText}>{dictionary.workspace.adminLede}</p>
      <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          [copy.statsTeams, counts.teams],
          [copy.statsParticipants, counts.participants],
          [copy.statsArticles, counts.articles],
          [copy.statsResults, counts.results],
        ].map(([label, value]) => (
          <div key={label} className="border border-line bg-canvas px-5 py-5">
            <dt className={supportText}>{label}</dt>
            <dd className={`mt-2 ${blockTitle}`}>{value}</dd>
          </div>
        ))}
      </dl>
      <section>
        <h2 className={blockTitle}>{copy.navCalendar}</h2>
        <ol className={`mt-4 space-y-2 ${bodyText}`}>
          {phases.map((phase) => (
            <li key={phase.key}>
              {dictionary.phases[phase.key].title} — {dictionary.timeline[phase.status]}
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h2 className={blockTitle}>{copy.shortcuts}</h2>
        <ul className="mt-4 space-y-2">
          <li>
            <Link className={textLink} href={localePath(locale, "admin/equipes")}>
              {copy.navTeams}
            </Link>
          </li>
          <li>
            <Link className={textLink} href={localePath(locale, "admin/annonces")}>
              {copy.navAnnouncements}
            </Link>
          </li>
          <li>
            <Link className={textLink} href={localePath(locale, "admin/calendrier")}>
              {copy.navCalendar}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
