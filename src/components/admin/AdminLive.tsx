import { OriginalImage } from "@/components/OriginalImage";
import {
  ActivityForm,
  AnnouncementForm,
  GalleryForm,
  PhaseStatusForm,
  ResultForm,
} from "@/components/admin/AdminRecordForms";
import { RemoveRecordForm } from "@/components/admin/RemoveRecordForm";
import { blockTitle, bodyText, pageTitle, supportText } from "@/components/classes";
import { ExternalLink } from "@/components/ExternalLink";
import type { Dictionary } from "@/content/types";
import { activityCategories } from "@/lib/documented-activities";
import { listGalleryItems } from "@/lib/editorial-store";
import {
  readAdminActivities,
  readAdminAnnouncements,
  readAdminHistory,
  readAdminResult,
  readAdminTeams,
  readPublishedRoadmap,
} from "@/lib/published-records";

const teamStatusLabel: Record<string, string> = {
  submitted: "Enregistrée",
  suspended: "Suspendue",
  rejected: "Refusée",
};

export async function AdminCalendarScreen({ dictionary }: { dictionary: Dictionary }) {
  const roadmap = await readPublishedRoadmap();

  return (
    <div className="space-y-6">
      <h1 className={pageTitle}>{dictionary.adminUi.navCalendar}</h1>
      <p className={bodyText}>{dictionary.adminUi.pagesProtected}</p>
      <StoreNotice availability={roadmap.availability} dictionary={dictionary} />
      <div className="max-w-2xl space-y-4">
        {roadmap.phases.map((phase) => (
          <PhaseStatusForm
            key={phase.key}
            phaseKey={phase.key}
            title={dictionary.phases[phase.key].title}
            when={dictionary.phases[phase.key].when}
            status={phase.status}
            dictionary={dictionary}
          />
        ))}
      </div>
    </div>
  );
}

export async function AdminAnnouncementScreen({ dictionary }: { dictionary: Dictionary }) {
  const records = await readAdminAnnouncements();

  return (
    <div className="space-y-6">
      <h1 className={pageTitle}>{dictionary.adminUi.navAnnouncements}</h1>
      <p className={bodyText}>Une annonce publiée apparaît sur le site public.</p>
      <StoreNotice availability={records.availability} dictionary={dictionary} />
      <AnnouncementForm dictionary={dictionary} />
      <EditorialList
        empty={dictionary.adminUi.empty}
        kind="announcement"
        items={records.items.map((item) => ({
          id: item.id,
          title: item.titleFr || item.slug,
          detail: statusLabel(item.status),
          imageSrc: null,
        }))}
      />
    </div>
  );
}

export async function AdminActivityScreen({ dictionary }: { dictionary: Dictionary }) {
  const records = await readAdminActivities();

  return (
    <div className="space-y-6">
      <h1 className={pageTitle}>{dictionary.adminUi.navActivities}</h1>
      <p className={bodyText}>Une fiche publiée apparaît dans Activités, avec sa date, son texte et sa photographie.</p>
      <StoreNotice availability={records.availability} dictionary={dictionary} />
      <ActivityForm
        dictionary={dictionary}
        categories={activityCategories.map((id) => ({ id, label: dictionary.activities.categories[id] }))}
      />
      <EditorialList
        empty={dictionary.adminUi.empty}
        kind="activity"
        items={records.items.map((item) => ({
          id: item.id,
          title: item.title || item.slug,
          detail: `${statusLabel(item.status)}${item.occurredOn ? ` · ${item.occurredOn}` : ""}`,
          imageSrc: item.hasImage ? `/media/activity/${item.id}?v=${encodeURIComponent(item.updatedAt)}` : null,
          text: item.description,
        }))}
      />
    </div>
  );
}

export async function AdminGalleryScreen({ dictionary }: { dictionary: Dictionary }) {
  const stored = await listGalleryItems();
  const records = stored === "missing" || stored === "error" ? [] : [...stored].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return (
    <div className="space-y-6">
      <h1 className={pageTitle}>{dictionary.adminUi.navGallery}</h1>
      <p className={bodyText}>Une image publiée, avec sa description, apparaît dans la galerie publique. L&apos;original n&apos;est pas transformé.</p>
      <StoreNotice availability={stored === "missing" || stored === "error" ? stored : "ready"} dictionary={dictionary} />
      <GalleryForm dictionary={dictionary} />
      <EditorialList
        empty={dictionary.adminUi.empty}
        kind="gallery"
        items={records.map((item) => ({
          id: item.id,
          title: item.description,
          detail: statusLabel(item.status),
          imageSrc: item.hasImage ? `/media/gallery/${item.id}?v=${encodeURIComponent(item.updatedAt)}` : null,
        }))}
      />
    </div>
  );
}

export async function AdminResultScreen({ dictionary }: { dictionary: Dictionary }) {
  const records = await readAdminResult();

  return (
    <div className="space-y-6">
      <h1 className={pageTitle}>{dictionary.adminUi.resultsTitle}</h1>
      <StoreNotice availability={records.availability} dictionary={dictionary} />
      <ResultForm
        dictionary={dictionary}
        teams={records.teams}
        statement={records.draft.statementFr}
        place1={records.draft.place1}
        place2={records.draft.place2}
        place3={records.draft.place3}
      />
      <p className={supportText}>{statusLabel(records.draft.status)}</p>
    </div>
  );
}

export async function AdminTeamsScreen({ dictionary }: { dictionary: Dictionary }) {
  const records = await readAdminTeams();
  const copy = dictionary.participatingTeams;

  return (
    <div className="space-y-6">
      <h1 className={pageTitle}>{dictionary.adminUi.navTeams}</h1>
      <p className={bodyText}>
        Même lecture que la page publique, avec en plus le courriel, le profil Cardano Forum et le code d&apos;accès.
      </p>
      {records.availability !== "ready" ? <p className={bodyText}>{dictionary.adminUi.actionFailed}</p> : null}
      {records.teams.length === 0 ? <p className={bodyText}>{dictionary.adminUi.empty}</p> : null}
      <ul className="grid gap-4 xl:grid-cols-2">
        {records.teams.map((team) => {
          const hasArticle = Boolean(team.articleTitle || team.articleUrl);
          return (
            <li key={team.id} className="flex h-full flex-col border border-line bg-canvas">
              <span aria-hidden="true" className="h-1.5 bg-brand" />
              <div className="flex flex-1 flex-col px-5 py-6">
                <h2 className={blockTitle}>{team.name}</h2>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="text-[1.75rem] font-semibold leading-none text-ink tabular-nums">{team.members.length}</span>
                  <span className={supportText}>{copy.memberCount}</span>
                </p>
                {team.members.length > 0 ? (
                  <ul className="mt-6 space-y-3 border-t border-line pt-5">
                    {team.members.map((member) => (
                      <li key={`${team.id}-${member.email}-${member.name}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
                        <div>
                          <p className="font-semibold text-ink">{member.name}</p>
                          <p className={supportText}>{member.email}</p>
                          {member.forumUsername ? <p className={supportText}>{member.forumUsername}</p> : null}
                        </div>
                        <p className={supportText}>{roleLabel(copy, member.role)}</p>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-auto pt-6">
                  {hasArticle ? (
                    <div className="space-y-2 border-t border-line pt-5">
                      <h3 className="text-[0.9375rem] font-semibold text-ink">{copy.topicHeading}</h3>
                      {team.articleTitle ? <p className={bodyText}>{team.articleTitle}</p> : null}
                      {team.articleUrl ? (
                        <ExternalLink href={team.articleUrl} newTabLabel={dictionary.links.opensNewTab}>
                          {copy.readArticle}
                        </ExternalLink>
                      ) : null}
                    </div>
                  ) : (
                    <p className={`border-t border-line pt-5 ${supportText}`}>{copy.topicMissing}</p>
                  )}
                </div>
                <dl className="mt-6 space-y-2 border-t border-line pt-5">
                  <div>
                    <dt className={supportText}>Ville et état</dt>
                    <dd className={bodyText}>
                      {team.city} · {teamStatusLabel[team.status] ?? team.status}
                    </dd>
                  </div>
                  <div>
                    <dt className={supportText}>Code d&apos;accès</dt>
                    <dd className={bodyText}>{team.accessCode || "non enregistré"}</dd>
                  </div>
                </dl>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export async function AdminHistoryScreen({ dictionary }: { dictionary: Dictionary }) {
  const records = await readAdminHistory();

  return (
    <div className="space-y-6">
      <h1 className={pageTitle}>{dictionary.adminUi.navHistory}</h1>
      {records.availability === "missing" ? <p className={bodyText}>{dictionary.adminUi.tableMissing}</p> : null}
      {records.rows.length === 0 && records.availability === "ready" ? (
        <p className={bodyText}>{dictionary.adminUi.empty}</p>
      ) : null}
      <ul className="space-y-3">
        {records.rows.map((row) => (
          <li key={row.id} className="border border-line bg-canvas px-5 py-4">
            <p className={supportText}>{row.createdAt}</p>
            <p className={`mt-1 ${bodyText}`}>{row.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminNoteScreen({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-4">
      <h1 className={pageTitle}>{title}</h1>
      <p className={bodyText}>{body}</p>
    </div>
  );
}

function EditorialList({
  items,
  empty,
  kind,
}: {
  items: readonly { id: string; title: string; detail: string; imageSrc: string | null; text?: string }[];
  empty: string;
  kind: "announcement" | "activity" | "gallery";
}) {
  if (items.length === 0) {
    return <p className={bodyText}>{empty}</p>;
  }

  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <li key={item.id} className="flex h-full flex-col border border-line bg-canvas">
          {item.imageSrc ? (
            <OriginalImage src={item.imageSrc} alt="" className="aspect-[4/3] w-full object-cover" />
          ) : null}
          <div className="flex flex-1 flex-col px-5 py-5">
            <p className={blockTitle}>{item.title}</p>
            <p className={`mt-1 ${supportText}`}>{item.detail}</p>
            {item.text ? <p className={`mt-3 ${bodyText}`}>{item.text}</p> : null}
            <div className="mt-4">
              <RemoveRecordForm id={item.id} kind={kind} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function StoreNotice({
  availability,
  dictionary,
}: {
  availability: "ready" | "missing" | "error";
  dictionary: Dictionary;
}) {
  if (availability === "ready") {
    return null;
  }

  return (
    <p className={bodyText}>
      {availability === "missing" ? dictionary.adminUi.tableMissing : dictionary.adminUi.actionFailed}
    </p>
  );
}

function roleLabel(copy: Dictionary["participatingTeams"], role: string): string {
  if (role === "leader") {
    return copy.roleLeader;
  }

  if (role === "deputy") {
    return copy.roleDeputy;
  }

  return copy.roleMember;
}

function statusLabel(status: string): string {
  if (status === "published") {
    return "Publié";
  }

  if (status === "draft") {
    return "Brouillon";
  }

  return status;
}
