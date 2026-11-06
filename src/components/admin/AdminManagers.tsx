"use client";

import { useMemo, useState } from "react";
import {
  blockTitle,
  bodyText,
  fieldControl,
  fieldLabel,
  ghostButton,
  pageTitle,
  primaryLink,
  secondaryLink,
  supportText,
} from "@/components/classes";
import { StatusMessage } from "@/components/StatusMessage";
import type { Dictionary } from "@/content/types";
import type { Locale } from "@/lib/locales";
import { organizerPortraits } from "@/lib/organizer-team";
import {
  previewFaqs,
  previewHistory,
  previewMedia,
  type PublicationStatus,
} from "@/lib/preview/admin-catalog";
import { listPublishedRoadmap, type RoadmapStatus } from "@/lib/program-roadmap";

export function ConfirmBar({
  dictionary,
  onConfirm,
  onCancel,
}: {
  dictionary: Dictionary;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-3 border border-line bg-surface px-5 py-4">
      <p className={bodyText}>{dictionary.adminUi.confirmBody}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" className={primaryLink} onClick={onConfirm}>
          {dictionary.adminUi.confirm}
        </button>
        <button type="button" className={secondaryLink} onClick={onCancel}>
          {dictionary.adminUi.cancel}
        </button>
      </div>
    </div>
  );
}

export function AdminCalendarManager({ dictionary }: { dictionary: Dictionary }) {
  const copy = dictionary.adminUi;
  const [phases, setPhases] = useState(() => listPublishedRoadmap().map((phase) => ({ ...phase })));
  const [pending, setPending] = useState<{ key: string; status: RoadmapStatus } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h1 className={pageTitle}>{copy.navCalendar}</h1>
      <p className={bodyText}>{copy.pagesProtected}</p>
      {notice ? <StatusMessage>{notice}</StatusMessage> : null}
      {pending ? (
        <ConfirmBar
          dictionary={dictionary}
          onCancel={() => setPending(null)}
          onConfirm={() => {
            setPhases((current) =>
              current.map((phase) =>
                phase.key === pending.key ? { ...phase, status: pending.status } : phase,
              ),
            );
            setPending(null);
            setNotice(dictionary.workspace.confirm);
          }}
        />
      ) : null}
      <ol className="space-y-4">
        {phases.map((phase) => (
          <li key={phase.key} className="border border-line bg-canvas px-5 py-5">
            <h2 className={blockTitle}>{dictionary.phases[phase.key].title}</h2>
            <p className={supportText}>{dictionary.phases[phase.key].when}</p>
            <p className={`mt-2 ${bodyText}`}>{dictionary.timeline[phase.status]}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="button" className={secondaryLink} onClick={() => setPending({ key: phase.key, status: "current" })}>
                {copy.startPhase}
              </button>
              <button type="button" className={secondaryLink} onClick={() => setPending({ key: phase.key, status: "done" })}>
                {copy.completePhase}
              </button>
              <button type="button" className={ghostButton} onClick={() => setPending({ key: phase.key, status: "postponed" })}>
                {copy.postponePhase}
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function AdminPeopleManager({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const copy = dictionary.adminUi;
  const [notice, setNotice] = useState<string | null>(null);
  const [category, setCategory] = useState<"organization" | "jury">("organization");

  return (
    <div className="space-y-6">
      <h1 className={pageTitle}>{copy.peopleTitle}</h1>
      <p className={bodyText}>{copy.previewBanner}</p>
      {notice ? <StatusMessage>{notice}</StatusMessage> : null}
      <div className="flex gap-3">
        <button type="button" className={category === "organization" ? primaryLink : secondaryLink} onClick={() => setCategory("organization")}>
          {copy.peopleCategoryOrg}
        </button>
        <button type="button" className={category === "jury" ? primaryLink : secondaryLink} onClick={() => setCategory("jury")}>
          {copy.peopleCategoryJury}
        </button>
      </div>
      {category === "jury" ? (
        <p className={bodyText}>{copy.empty}</p>
      ) : (
        <ul className="space-y-3">
          {organizerPortraits.map((person) => (
            <li key={person.id} className="border border-line bg-canvas px-5 py-4">
              <p className="font-semibold text-ink">{person.name}</p>
              <p className={supportText}>{person.role[locale]}</p>
            </li>
          ))}
        </ul>
      )}
      <form
        className="space-y-4 border border-line px-5 py-5"
        onSubmit={(event) => {
          event.preventDefault();
          setNotice(dictionary.workspace.inactive);
        }}
      >
        <h2 className={blockTitle}>{copy.create}</h2>
        <label className={fieldLabel} htmlFor="person-name">{copy.peopleName}</label>
        <input id="person-name" className={fieldControl} />
        <label className={fieldLabel} htmlFor="person-role">{copy.peopleRole}</label>
        <input id="person-role" className={fieldControl} />
        <label className={fieldLabel} htmlFor="person-bio">{copy.peopleBio}</label>
        <textarea id="person-bio" className={`${fieldControl} min-h-32`} />
        <button type="submit" className={primaryLink}>{copy.save}</button>
      </form>
    </div>
  );
}

export function AdminListManager({
  title,
  items,
  dictionary,
}: {
  title: string;
  items: readonly { id: string; label: string; status: PublicationStatus }[];
  dictionary: Dictionary;
}) {
  const copy = dictionary.adminUi;
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const filtered = useMemo(
    () => items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  return (
    <div className="space-y-6">
      <h1 className={pageTitle}>{title}</h1>
      <label className={fieldLabel} htmlFor={`search-${title}`}>
        {copy.search}
      </label>
      <input
        id={`search-${title}`}
        className={fieldControl}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {notice ? <StatusMessage>{notice}</StatusMessage> : null}
      {pending ? (
        <ConfirmBar
          dictionary={dictionary}
          onCancel={() => setPending(null)}
          onConfirm={() => {
            setPending(null);
            setNotice(dictionary.workspace.inactive);
          }}
        />
      ) : null}
      {filtered.length === 0 ? (
        <p className={bodyText}>{copy.empty}</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => (
            <li key={item.id} className="border border-line bg-canvas px-5 py-4">
              <p className="font-semibold text-ink">{item.label}</p>
              <p className={supportText}>{statusLabel(copy, item.status)}</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <button type="button" className={secondaryLink} onClick={() => setPending(item.id)}>
                  {copy.publish}
                </button>
                <button type="button" className={ghostButton} onClick={() => setNotice(dictionary.workspace.inactive)}>
                  {copy.unpublish}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className={primaryLink} onClick={() => setNotice(dictionary.workspace.inactive)}>
        {copy.create}
      </button>
    </div>
  );
}

export function AdminResultsManager({ dictionary }: { dictionary: Dictionary }) {
  const copy = dictionary.adminUi;
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className={pageTitle}>{copy.resultsTitle}</h1>
      <p className={bodyText}>{copy.resultsPublish}</p>
      {notice ? <StatusMessage>{notice}</StatusMessage> : null}
      {pending ? (
        <ConfirmBar dictionary={dictionary} onCancel={() => setPending(false)} onConfirm={() => { setPending(false); setNotice(dictionary.workspace.inactive); }} />
      ) : null}
      <ol className="space-y-4">
        {[1, 2, 3].map((place) => (
          <li key={place} className="border border-line bg-canvas px-5 py-5">
            <p className={supportText}>
              {copy.resultsPlace} {place}
            </p>
            <label className={`${fieldLabel} mt-3`} htmlFor={`winner-${place}`}>
              {dictionary.registration.teamForm.teamName}
            </label>
            <input id={`winner-${place}`} className={fieldControl} />
          </li>
        ))}
      </ol>
      <button type="button" className={primaryLink} onClick={() => setPending(true)}>
        {copy.publish}
      </button>
    </div>
  );
}

export function AdminPagesManager({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const copy = dictionary.adminUi;
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h1 className={pageTitle}>{copy.pagesTitle}</h1>
      <p className={bodyText}>{copy.pagesProtected}</p>
      {notice ? <StatusMessage>{notice}</StatusMessage> : null}
      <section className="border border-line bg-canvas px-5 py-5">
        <h2 className={blockTitle}>{copy.pagesFaq}</h2>
        {previewFaqs.map((item) => (
          <article key={item.id} className="mt-4">
            <p className="font-semibold text-ink">{item.question[locale]}</p>
            <p className={`mt-2 ${bodyText}`}>{item.answer[locale]}</p>
            <p className={`mt-2 ${supportText}`}>{statusLabel(copy, item.status)}</p>
          </article>
        ))}
      </section>
      <section className="border border-line bg-canvas px-5 py-5">
        <h2 className={blockTitle}>{copy.pagesHome}</h2>
        <p className={bodyText}>{dictionary.home.summary}</p>
      </section>
      <button type="button" className={primaryLink} onClick={() => setNotice(dictionary.workspace.inactive)}>
        {copy.save}
      </button>
    </div>
  );
}

export function AdminMediaManager({ dictionary }: { dictionary: Dictionary }) {
  const copy = dictionary.adminUi;
  const [query, setQuery] = useState("");
  const items = previewMedia.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className={pageTitle}>{copy.mediaTitle}</h1>
      <p className={bodyText}>{copy.mediaHint}</p>
      <input className={fieldControl} value={query} onChange={(event) => setQuery(event.target.value)} aria-label={copy.search} />
      {items.length === 0 ? (
        <p className={bodyText}>{copy.empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="border border-line bg-canvas px-5 py-4">
              <p className="font-semibold text-ink">{item.title}</p>
              <p className={supportText}>{item.kind}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminHistoryManager({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  return (
    <div className="space-y-6">
      <h1 className={pageTitle}>{dictionary.adminUi.historyTitle}</h1>
      <ol className="space-y-3">
        {previewHistory.map((item) => (
          <li key={item.id} className="border border-line bg-canvas px-5 py-4">
            <p className={supportText}>{item.at}</p>
            <p className={`mt-2 ${bodyText}`}>{item.action[locale]}</p>
            <p className={supportText}>{item.subject[locale]}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function statusLabel(copy: Dictionary["adminUi"], status: PublicationStatus): string {
  if (status === "published") {
    return copy.publish;
  }

  if (status === "unpublished") {
    return copy.unpublish;
  }

  if (status === "scheduled") {
    return copy.scheduled;
  }

  return copy.draft;
}
