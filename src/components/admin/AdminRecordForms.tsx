"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArticleBody } from "@/components/ArticleBody";
import { bodyText, fieldControl, fieldLabel, primaryLink, secondaryLink, supportText } from "@/components/classes";
import { RichTextField } from "@/components/admin/RichTextField";
import { StatusMessage } from "@/components/StatusMessage";
import type { Dictionary } from "@/content/types";
import {
  saveActivityAction,
  saveAnnouncementAction,
  saveGalleryAction,
  savePhaseAction,
  saveResultAction,
  type AdminActionState,
} from "@/lib/admin-record-actions";
import type { ActivityCategory } from "@/lib/documented-activities";
import {
  isRegistrationOpen,
  isRegistrationPhase,
  phaseKeys,
  statusesForPhase,
  type PhaseKey,
  type RoadmapStatus,
} from "@/lib/program-roadmap";
import type { AdminTeamOption } from "@/lib/published-records";

const IMAGE_LIMIT = Math.floor(3.5 * 1024 * 1024);

export function PhaseStatusForm({
  phaseKey,
  title,
  when,
  status,
  dictionary,
}: {
  phaseKey: string;
  title: string;
  when: string;
  status: RoadmapStatus;
  dictionary: Dictionary;
}) {
  const [state, action, pending] = useActionState(savePhaseAction, null);
  const key = phaseKeys.includes(phaseKey as PhaseKey) ? (phaseKey as PhaseKey) : null;
  const options = key ? statusesForPhase(key) : (["upcoming", "current", "done", "postponed"] as const);
  const registration = key ? isRegistrationPhase(key) : false;
  const formOpen = isRegistrationOpen(status);

  return (
    <form action={action} className="border border-line bg-canvas px-5 py-5 transition-colors duration-150 hover:bg-surface/40">
      <h2 className="text-[1.25rem] font-semibold text-ink">{title}</h2>
      <p className={`mt-1 ${supportText}`}>{when}</p>
      <input name="phase" type="hidden" value={phaseKey} />
      <label className={`mt-4 ${fieldLabel}`} htmlFor={`phase-${phaseKey}`}>
        {dictionary.adminUi.phaseStatus}
      </label>
      <select id={`phase-${phaseKey}`} name="status" defaultValue={status} className={`mt-2 ${fieldControl}`}>
        {options.map((item) => (
          <option key={item} value={item}>
            {dictionary.timeline[item]}
          </option>
        ))}
      </select>
      {registration ? (
        <p className={`mt-3 ${supportText}`}>
          {dictionary.adminUi.phaseRegistration} :{" "}
          <span className="font-semibold text-ink">
            {formOpen ? dictionary.adminUi.phaseFormOpen : dictionary.adminUi.phaseFormClosed}
          </span>
          . Ouvert = formulaire accessible. Clôturé ou Terminé = formulaire indisponible. Les enregistrements déjà reçus restent.
        </p>
      ) : (
        <p className={`mt-3 ${supportText}`}>
          Étape de programme sans formulaire d&apos;inscription lié. « En cours » et « Terminé » décrivent l&apos;avancement, pas une ouverture de formulaire.
        </p>
      )}
      <div className="mt-4">
        <button type="submit" className={primaryLink} disabled={pending}>
          {dictionary.adminUi.save}
        </button>
      </div>
      <ActionNotice state={state} dictionary={dictionary} />
    </form>
  );
}

export function AnnouncementForm({
  dictionary,
  record,
}: {
  dictionary: Dictionary;
  record?: { id: string; title: string; body: string };
}) {
  const [state, action, pending] = useActionState(saveAnnouncementAction, null);
  const [preview, setPreview] = useState("");
  const copy = dictionary.adminUi;
  const formRef = useResetOnSuccess(state, !record);

  return (
    <form ref={formRef} action={action} className="max-w-3xl space-y-4">
      {record ? <input type="hidden" name="id" value={record.id} /> : null}
      <h2 className="text-[1.25rem] font-semibold text-ink">{record ? "Modifier l'annonce" : copy.create}</h2>
      <p className={bodyText}>
        {record
          ? "Le brouillon retire l'annonce du site. Publier la remet en ligne, à la même adresse."
          : "Le texte est publié tel que vous l'écrivez, sur les pages française et anglaise."}
      </p>
      <TextField name="title" label="Titre" defaultValue={record?.title ?? ""} required />
      <RichTextField key={record?.id ?? "new-announcement"} name="body" label="Texte" defaultValue={record?.body ?? ""} />
      <button
        type="button"
        className={secondaryLink}
        onClick={() => {
          if (!formRef.current) {
            return;
          }
          setPreview(String(new FormData(formRef.current).get("body") ?? ""));
        }}
      >
        Aperçu
      </button>
      {preview ? (
        <div className="border border-line bg-canvas px-5 py-5">
          <p className={supportText}>Aperçu du texte, avant publication.</p>
          <div className="mt-4">
            <ArticleBody text={preview} />
          </div>
        </div>
      ) : null}
      <NotifyFields />
      <PublishButtons pending={pending} draft={copy.draft} publish={copy.publish} />
      <ActionNotice state={state} dictionary={dictionary} />
    </form>
  );
}

export function ResultForm({
  dictionary,
  teams,
  statement,
  place1,
  place2,
  place3,
  workbookName = "",
  teamPlaces = [],
}: {
  dictionary: Dictionary;
  teams: readonly AdminTeamOption[];
  statement: string;
  place1: string;
  place2: string;
  place3: string;
  workbookName?: string;
  teamPlaces?: readonly { teamId: string; place: number }[];
}) {
  const [state, action, pending] = useActionState(saveResultAction, null);
  const copy = dictionary.adminUi;
  const places = [
    ["place1", "1", place1],
    ["place2", "2", place2],
    ["place3", "3", place3],
  ] as const;

  return (
    <form action={action} className="max-w-2xl space-y-4 border border-line bg-canvas px-5 py-6 md:px-8">
      <h2 className="text-[1.25rem] font-semibold text-ink">Saisie du résultat</h2>
      <p className={bodyText}>{copy.resultsPublish}</p>
      {places.map(([name, label, value]) => (
        <label key={name} className={fieldLabel}>
          {copy.resultsPlace} {label}
          <select name={name} defaultValue={value} className={`mt-2 ${fieldControl}`}>
            <option value="">—</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
      ))}
      <div className="space-y-3 border border-line bg-surface px-4 py-4">
        <p className={fieldLabel}>Places suivantes</p>
        <p className={supportText}>
          Indiquez 4, 5, puis les places suivantes. 4 et 5 s&apos;affichent en jaune. Les autres gardent la fiche habituelle. Une case vide n&apos;affiche pas de rang.
        </p>
        <ul className="space-y-3">
          {teams.map((team) => (
            <li key={team.id}>
              <label className={fieldLabel}>
                {team.name}
                <input
                  name={`extraPlace-${team.id}`}
                  type="number"
                  min={4}
                  max={99}
                  inputMode="numeric"
                  defaultValue={teamPlaces.find((item) => item.teamId === team.id)?.place ?? ""}
                  className={`mt-2 ${fieldControl}`}
                />
              </label>
            </li>
          ))}
        </ul>
      </div>
      <RichTextField name="statement" label="Texte du résultat" defaultValue={statement} />
      <label className={fieldLabel}>
        Classeur des résultats totaux
        <input
          name="workbook"
          type="file"
          accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className={`mt-2 ${fieldControl}`}
        />
      </label>
      <p className={supportText}>
        Fichier .xls ou .xlsx, 3,5 Mo au plus. L&apos;original est conservé. Le site ne lit pas les notes.
        {workbookName
          ? ` Fichier actuel : ${workbookName}. Laisser vide pour le conserver.`
          : " Sans fichier, le bouton public n'apparaît pas."}
      </p>
      <NotifyFields />
      <PublishButtons pending={pending} draft={copy.draft} publish={copy.publish} />
      <ActionNotice state={state} dictionary={dictionary} />
    </form>
  );
}

export function ActivityForm({
  dictionary,
  categories,
  record,
}: {
  dictionary: Dictionary;
  categories: readonly { id: ActivityCategory; label: string }[];
  record?: { id: string; category: ActivityCategory; title: string; description: string; occurredOn: string };
}) {
  const [state, action, pending] = useActionState(saveActivityAction, null);
  const [preview, setPreview] = useState("");
  const copy = dictionary.adminUi;
  const formRef = useResetOnSuccess(state, !record);

  return (
    <form ref={formRef} action={action} className="max-w-3xl space-y-4">
      {record ? <input type="hidden" name="id" value={record.id} /> : null}
      <h2 className="text-[1.25rem] font-semibold text-ink">{record ? "Modifier l'activité" : copy.create}</h2>
      <p className={bodyText}>
        Date déjà passée, description et photographie. L&apos;original est conservé. Une activité à venir ne peut pas être publiée comme tenue.
        {record ? " Le brouillon retire la fiche du site. Sans nouvelle photographie, l'originale est conservée." : ""}
      </p>
      <label className={fieldLabel}>
        Catégorie
        <select name="category" className={`mt-2 ${fieldControl}`} defaultValue={record?.category ?? categories[0]?.id}>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <TextField name="title" label="Titre (ex. Première session)" defaultValue={record?.title ?? ""} required />
      <RichTextField key={record?.id ?? "new-activity"} name="description" label="Description" defaultValue={record?.description ?? ""} />
      <label className={fieldLabel}>
        Date réelle
        <input name="occurredOn" type="date" defaultValue={record?.occurredOn ?? ""} className={`mt-2 ${fieldControl}`} />
      </label>
      <ImageField hint={record ? "Laisser vide pour conserver la photographie actuelle." : undefined} />
      <button
        type="button"
        className={secondaryLink}
        onClick={() => {
          if (!formRef.current) {
            return;
          }
          setPreview(String(new FormData(formRef.current).get("description") ?? ""));
        }}
      >
        Aperçu
      </button>
      {preview ? (
        <div className="border border-line bg-canvas px-5 py-5">
          <p className={supportText}>Aperçu de la description, avant publication.</p>
          <div className="mt-4">
            <ArticleBody text={preview} />
          </div>
        </div>
      ) : null}
      <NotifyFields />
      <PublishButtons pending={pending} draft={copy.draft} publish={copy.publish} />
      <ActionNotice state={state} dictionary={dictionary} />
    </form>
  );
}

export function GalleryForm({ dictionary }: { dictionary: Dictionary }) {
  const [state, action, pending] = useActionState(saveGalleryAction, null);
  const formRef = useResetOnSuccess(state);

  return (
    <form ref={formRef} action={action} className="max-w-2xl space-y-4 border border-line bg-canvas px-5 py-5">
      <h2 className="text-[1.25rem] font-semibold text-ink">{dictionary.adminUi.create}</h2>
      <ImageField />
      <TextArea name="description" label="Description" />
      <PublishButtons pending={pending} draft={dictionary.adminUi.draft} publish={dictionary.adminUi.publish} />
      <ActionNotice state={state} dictionary={dictionary} />
    </form>
  );
}

function NotifyFields() {
  return (
    <fieldset className="space-y-2 border border-line px-4 py-4">
      <legend className={fieldLabel}>Courriel après publication</legend>
      <p className={supportText}>
        La publication est enregistrée même si l&apos;envoi échoue. Le sujet indique la catégorie et le titre. Le bouton ouvre la page publiée. Aucun envoi sans case cochée. Les abonnés ne reçoivent que cette nouvelle liée au site.
      </p>
      <label className="flex min-h-11 items-center gap-3 text-base text-ink">
        <input name="audience" type="checkbox" value="teams" />
        Toutes les équipes
      </label>
      <label className="flex min-h-11 items-center gap-3 text-base text-ink">
        <input name="audience" type="checkbox" value="leaders" />
        Responsables d&apos;équipe
      </label>
      <label className="flex min-h-11 items-center gap-3 text-base text-ink">
        <input name="audience" type="checkbox" value="members" />
        Membres, hors responsables
      </label>
      <label className="flex min-h-11 items-center gap-3 text-base text-ink">
        <input name="audience" type="checkbox" value="subscribers" />
        Abonnés à la lettre
      </label>
      <label className={fieldLabel}>
        Message du courriel
        <textarea name="mailNote" rows={4} className={fieldControl} />
      </label>
    </fieldset>
  );
}

function PublishButtons({ pending, draft, publish }: { pending: boolean; draft: string; publish: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button type="submit" name="intent" value="draft" className={secondaryLink} disabled={pending}>
        {draft}
      </button>
      <button type="submit" name="intent" value="publish" className={primaryLink} disabled={pending}>
        {publish}
      </button>
    </div>
  );
}

function TextField({
  name,
  label,
  defaultValue = "",
  required = false,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className={fieldLabel}>
      {label}
      <input name={name} defaultValue={defaultValue} required={required} maxLength={180} className={`mt-2 ${fieldControl}`} />
    </label>
  );
}

function TextArea({ name, label, defaultValue = "" }: { name: string; label: string; defaultValue?: string }) {
  return (
    <label className={fieldLabel}>
      {label}
      <textarea name={name} defaultValue={defaultValue} rows={5} className={`mt-2 ${fieldControl}`} />
    </label>
  );
}

function ImageField({ hint }: { hint?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) {
      return;
    }

    const onReset = () => {
      setPreview((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return null;
      });
      setMessage("");
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  return (
    <div>
      <label className={fieldLabel}>
        Image
        <input
          ref={inputRef}
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={`mt-2 ${fieldControl}`}
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPreview((current) => {
              if (current) {
                URL.revokeObjectURL(current);
              }
              return file ? URL.createObjectURL(file) : null;
            });
            setMessage(file && file.size > IMAGE_LIMIT ? "Cette image dépasse 3,5 Mo." : "");
          }}
        />
      </label>
      {hint ? <p className={`mt-2 ${supportText}`}>{hint}</p> : null}
      {message ? <p className={`mt-2 ${supportText}`}>{message}</p> : null}
      {preview ? (
        // Aperçu local de l'original choisi. Le fichier déposé n'est pas recompressé.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="mt-3 aspect-[4/3] w-full max-w-sm border border-line object-contain" />
      ) : null}
    </div>
  );
}

function useResetOnSuccess(state: AdminActionState, enabled = true) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (enabled && state?.status === "ok") {
      formRef.current?.reset();
    }
  }, [enabled, state]);

  return formRef;
}

function ActionNotice({ state, dictionary }: { state: AdminActionState; dictionary: Dictionary }) {
  if (state === null) {
    return null;
  }

  const copy = dictionary.adminUi;
  const message =
    state.detail ??
    (state.status === "ok"
      ? copy.saved
      : state.status === "missing"
        ? copy.tableMissing
        : state.status === "forbidden"
          ? copy.unauthorized
          : copy.actionFailed);

  return (
    <div className="mt-4">
      <StatusMessage tone={state.status === "ok" ? "success" : "warning"}>{message}</StatusMessage>
    </div>
  );
}
