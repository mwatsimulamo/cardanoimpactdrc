import type { ReactNode } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTeamsTable } from "@/components/admin/AdminTeamsTable";
import { SearchableList } from "@/components/admin/SearchableList";
import { OriginalImage } from "@/components/OriginalImage";
import {
  ActivityForm,
  AnnouncementForm,
  GalleryForm,
  PhaseStatusForm,
  ResultForm,
} from "@/components/admin/AdminRecordForms";
import { RemoveRecordForm } from "@/components/admin/RemoveRecordForm";
import { blockTitle, bodyText, supportText } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import { activityCategories, type ActivityCategory } from "@/lib/documented-activities";
import { plainExcerpt } from "@/lib/rich-text";
import { listGalleryItems } from "@/lib/editorial-store";
import {
  readAdminActivities,
  readAdminAnnouncements,
  readAdminHistory,
  readAdminResult,
  readAdminTeams,
  readPublishedRoadmap,
} from "@/lib/published-records";

export async function AdminCalendarScreen({ dictionary }: { dictionary: Dictionary }) {
  const roadmap = await readPublishedRoadmap();

  return (
    <div className="space-y-8">
      <AdminPageHeader title={dictionary.adminUi.navCalendar} lede={dictionary.adminUi.pagesProtected} />
      <StoreNotice availability={roadmap.availability} dictionary={dictionary} />
      <div className="admin-stagger max-w-2xl space-y-4">
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
    <div className="space-y-8">
      <AdminPageHeader title={dictionary.adminUi.navAnnouncements} lede="Une annonce publiée apparaît sur le site public." />
      <StoreNotice availability={records.availability} dictionary={dictionary} />
      <div className="admin-in-right" style={{ ["--admin-delay" as string]: "100ms" }}>
        <AnnouncementForm dictionary={dictionary} />
      </div>
      <EditorialList
        empty={dictionary.adminUi.empty}
        kind="announcement"
        items={records.items.map((item) => ({
          id: item.id,
          title: item.titleFr || item.slug,
          detail: statusLabel(item.status),
          imageSrc: null,
          editor: (
            <AnnouncementForm
              dictionary={dictionary}
              record={{ id: item.id, title: item.titleFr, body: item.bodyFr }}
            />
          ),
        }))}
      />
    </div>
  );
}

export async function AdminActivityScreen({ dictionary }: { dictionary: Dictionary }) {
  const records = await readAdminActivities();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={dictionary.adminUi.navActivities}
        lede="Une fiche publiée apparaît dans Activités, avec sa date, son texte et sa photographie."
      />
      <StoreNotice availability={records.availability} dictionary={dictionary} />
      <div className="admin-in-right" style={{ ["--admin-delay" as string]: "100ms" }}>
        <ActivityForm
          dictionary={dictionary}
          categories={activityCategories.map((id) => ({ id, label: dictionary.activities.categories[id] }))}
        />
      </div>
      <EditorialList
        empty={dictionary.adminUi.empty}
        kind="activity"
        items={records.items.map((item) => ({
          id: item.id,
          title: item.title || item.slug,
          detail: `${statusLabel(item.status)}${item.occurredOn ? ` · ${item.occurredOn}` : ""}`,
          imageSrc: item.hasImage ? `/media/activity/${item.id}?v=${encodeURIComponent(item.updatedAt)}` : null,
          text: plainExcerpt(item.description),
          editor: activityCategories.includes(item.category as ActivityCategory) ? (
            <ActivityForm
              dictionary={dictionary}
              categories={activityCategories.map((id) => ({ id, label: dictionary.activities.categories[id] }))}
              record={{
                id: item.id,
                category: item.category as ActivityCategory,
                title: item.title,
                description: item.description,
                occurredOn: item.occurredOn,
              }}
            />
          ) : null,
        }))}
      />
    </div>
  );
}

export async function AdminGalleryScreen({ dictionary }: { dictionary: Dictionary }) {
  const stored = await listGalleryItems();
  const records = stored === "missing" || stored === "error" ? [] : [...stored].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={dictionary.adminUi.navGallery}
        lede="Une image publiée, avec sa description, apparaît dans la galerie publique. L'original n'est pas transformé."
      />
      <StoreNotice availability={stored === "missing" || stored === "error" ? stored : "ready"} dictionary={dictionary} />
      <div className="admin-in-right" style={{ ["--admin-delay" as string]: "100ms" }}>
        <GalleryForm dictionary={dictionary} />
      </div>
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
    <div className="space-y-8">
      <AdminPageHeader title={dictionary.adminUi.resultsTitle} lede={dictionary.adminUi.resultsPublish} />
      <StoreNotice availability={records.availability} dictionary={dictionary} />
      <div className="admin-in-right" style={{ ["--admin-delay" as string]: "100ms" }}>
        <ResultForm
          dictionary={dictionary}
          teams={records.teams}
          statement={records.draft.statementFr}
          place1={records.draft.place1}
          place2={records.draft.place2}
          place3={records.draft.place3}
          workbookName={records.draft.workbookName}
          workbookUrl={records.draft.workbookUrl}
          teamPlaces={records.draft.teamPlaces}
        />
      </div>
      <p className={`admin-in-up ${supportText}`} style={{ ["--admin-delay" as string]: "180ms" }}>
        {statusLabel(records.draft.status)}
      </p>
    </div>
  );
}

export async function AdminTeamsScreen({ dictionary }: { dictionary: Dictionary }) {
  const records = await readAdminTeams();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={dictionary.adminUi.navTeams}
        lede={dictionary.adminUi.teamsTableLede}
      />
      {records.availability !== "ready" ? <p className={bodyText}>{dictionary.adminUi.actionFailed}</p> : null}
      {records.availability === "ready" && records.teams.length === 0 ? (
        <p className={bodyText}>{dictionary.adminUi.empty}</p>
      ) : null}
      {records.availability === "ready" && records.teams.length > 0 ? (
        <AdminTeamsTable teams={records.teams} dictionary={dictionary} />
      ) : null}
    </div>
  );
}

export async function AdminHistoryScreen({ dictionary }: { dictionary: Dictionary }) {
  const records = await readAdminHistory();

  return (
    <div className="space-y-8">
      <AdminPageHeader title={dictionary.adminUi.navHistory} />
      {records.availability === "missing" ? (
        <p className={bodyText}>{dictionary.adminUi.historyTableMissing}</p>
      ) : null}
      {records.rows.length === 0 && records.availability === "ready" ? (
        <p className={bodyText}>{dictionary.adminUi.empty}</p>
      ) : null}
      <ul className="admin-stagger space-y-3">
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
      <AdminPageHeader title={title} lede={body} />
    </div>
  );
}

function EditorialList({
  items,
  empty,
  kind,
}: {
  items: readonly {
    id: string;
    title: string;
    detail: string;
    imageSrc: string | null;
    text?: string;
    editor?: ReactNode;
  }[];
  empty: string;
  kind: "announcement" | "activity" | "gallery";
}) {
  if (items.length === 0) {
    return <p className={bodyText}>{empty}</p>;
  }

  return (
    <ul className="admin-stagger grid gap-4 lg:grid-cols-2">
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
            {item.editor ? (
              <details className="mt-4 border-t border-line pt-4">
                <summary className="min-h-11 cursor-pointer font-semibold text-ink">Modifier</summary>
                <div className="mt-4">{item.editor}</div>
              </details>
            ) : null}
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
    <p className={`admin-in-up ${bodyText}`}>
      {availability === "missing" ? dictionary.adminUi.tableMissing : dictionary.adminUi.actionFailed}
    </p>
  );
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
