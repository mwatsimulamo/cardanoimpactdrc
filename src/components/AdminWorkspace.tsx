"use client";

import Link from "next/link";
import { useState } from "react";
import {
  blockTitle,
  bodyText,
  justifiedText,
  fieldControl,
  fieldLabel,
  pageTitle,
  primaryLink,
  secondaryLink,
  supportText,
  textLink,
} from "@/components/classes";
import { StatusMessage } from "@/components/StatusMessage";
import type { Dictionary } from "@/content/types";
import { localePath, type Locale } from "@/lib/locales";
import {
  previewTeams,
  type ArticleStatus,
  type ForumProfileStatus,
  type PreviewTeam,
} from "@/lib/preview-workspace";

export function AdminTeamList({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const copy = dictionary.workspace;
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="space-y-8">
      <header>
        <h1 className={pageTitle}>{copy.adminTitle}</h1>
        <p className={`mt-3 ${justifiedText}`}>{copy.adminLede}</p>
      </header>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled
          className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-[2px] bg-surface px-6 text-[0.9375rem] font-semibold text-muted md:w-auto"
        >
          {copy.adminExport}
        </button>
        <p className={`self-center ${supportText}`}>{copy.adminExportHint}</p>
      </div>
      <label className="flex items-center gap-3 text-[0.9375rem] text-ink">
        <input
          type="checkbox"
          checked={showPreview}
          onChange={(event) => setShowPreview(event.target.checked)}
        />
        {copy.previewBanner}
      </label>
      {!showPreview || previewTeams.length === 0 ? (
        <p className={bodyText}>{copy.emptyTeams}</p>
      ) : (
        <ul className="space-y-4">
          {previewTeams.map((team) => (
            <li key={team.id} className="border border-line bg-canvas px-5 py-5">
              <h2 className={blockTitle}>{team.name}</h2>
              <p className={`mt-2 ${supportText}`}>
                {dictionary.participatingTeams.memberCount}: {team.memberCount}
              </p>
              <p className="mt-4">
                <Link className={textLink} href={localePath(locale, `admin/equipes/${team.id}`)}>
                  {copy.adminDetail}
                </Link>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminTeamDetail({
  locale,
  dictionary,
  team,
}: {
  locale: Locale;
  dictionary: Dictionary;
  team: PreviewTeam;
}) {
  const copy = dictionary.workspace;
  const [justification, setJustification] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  function inactive() {
    setNotice(copy.adminNoAction);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className={pageTitle}>{team.name}</h1>
        <p className={`mt-3 ${bodyText}`}>{copy.adminLede}</p>
      </header>
      <StatusMessage tone="warning">{copy.previewBanner}</StatusMessage>
      {notice ? <StatusMessage>{notice}</StatusMessage> : null}

      <section className="space-y-3 border border-line bg-canvas px-5 py-6">
        <h2 className={blockTitle}>{copy.membersTitle}</h2>
        <ul className="space-y-4">
          {team.members.map((member) => (
            <li key={member.id} className="border border-line px-4 py-4">
              <p className="font-semibold text-ink">
                {member.givenName} {member.familyName} · {member.role}
              </p>
              <p className={supportText}>{member.email}</p>
              <p className={`mt-2 ${supportText}`}>
                {copy.forumStatus}: {forumStatusLabel(copy, member.forumStatus)}
              </p>
              <button type="button" className={`${secondaryLink} mt-3`} onClick={inactive}>
                {copy.adminVerifyForum}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 border border-line bg-canvas px-5 py-6">
        <h2 className={blockTitle}>{copy.articleTitle}</h2>
        <p className={bodyText}>{copy.articlePeriod}</p>
        <p className={supportText}>{team.articleTitle || copy.articleNotSubmitted}</p>
        <p className={supportText}>{team.articleUrl || "—"}</p>
        <p className={supportText}>
          {copy.articleStatus}: {articleStatusLabel(copy, team.articleStatus)}
        </p>
        <button type="button" className={secondaryLink} onClick={inactive}>
          {copy.adminVerifyArticle}
        </button>
      </section>

      <section className="space-y-3 border border-line bg-canvas px-5 py-6">
        <h2 className={blockTitle}>{copy.adminJustify}</h2>
        <label className={fieldLabel} htmlFor="admin-justification">
          {copy.adminJustify}
        </label>
        <textarea
          id="admin-justification"
          className={`${fieldControl} min-h-32`}
          value={justification}
          onChange={(event) => setJustification(event.target.value)}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" className={secondaryLink} onClick={inactive}>
            {copy.adminSuspend}
          </button>
          <button type="button" className={primaryLink} onClick={inactive}>
            {copy.adminReject}
          </button>
        </div>
      </section>

      <section className="space-y-3 border border-line bg-canvas px-5 py-6">
        <h2 className={blockTitle}>{copy.historyTitle}</h2>
        <ol className="space-y-3">
          {team.history.map((entry) => (
            <li key={entry.id} className={bodyText}>
              <span className="mr-3 tabular-nums text-muted">{entry.at}</span>
              {entry.summary[locale]}
            </li>
          ))}
        </ol>
      </section>

      <p>
        <Link className={textLink} href={localePath(locale, "admin/equipes")}>
          {copy.adminList}
        </Link>
      </p>
    </div>
  );
}

function forumStatusLabel(copy: Dictionary["workspace"], status: ForumProfileStatus): string {
  if (status === "pending_review") {
    return copy.forumPending;
  }

  if (status === "verified") {
    return copy.forumVerified;
  }

  if (status === "mismatch") {
    return copy.forumMismatch;
  }

  return copy.forumNotProvided;
}

function articleStatusLabel(copy: Dictionary["workspace"], status: ArticleStatus): string {
  if (status === "submitted") {
    return copy.articleSubmitted;
  }

  if (status === "verified") {
    return copy.articleVerified;
  }

  if (status === "correction_requested") {
    return copy.articleCorrection;
  }

  return copy.articleNotSubmitted;
}
