"use client";

import { useMemo, useState } from "react";
import {
  blockTitle,
  bodyText,
  justifiedText,
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
import { articleWindow } from "@/lib/article-window";
import { ARTICLE_SUMMARY_MAX } from "@/lib/forum-links";
import {
  saveLeaderForumAction,
  signOutLeaderAction,
  submitLeaderArticleAction,
  verifyLeaderAccessAction,
} from "@/lib/leader-actions";
import type { ArticleStatus, ForumProfileStatus, LeaderTeam } from "@/lib/leader-types";
import { localePath, type Locale } from "@/lib/locales";
import type { MemberRole } from "@/lib/team-registration";

type Panel = "dashboard" | "members" | "article";

export function LeaderWorkspace({
  locale,
  dictionary,
  initialTeam,
}: {
  locale: Locale;
  dictionary: Dictionary;
  initialTeam: LeaderTeam | null;
}) {
  const copy = dictionary.workspace;
  const teamForm = dictionary.registration.teamForm;
  const [team, setTeam] = useState<LeaderTeam | null>(initialTeam);
  const [panel, setPanel] = useState<Panel>("dashboard");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<"forum" | "article" | null>(null);
  const [error, setError] = useState<"access" | "code" | "forum" | "article" | "closed" | "generic" | null>(null);

  const missing = useMemo(() => {
    if (team === null) {
      return { forum: 0, article: false };
    }

    return {
      forum: team.members.filter(
        (member) => member.forumUsername.length === 0 || member.forumProfileUrl.length === 0,
      ).length,
      article:
        team.articleStatus === "not_submitted" ||
        team.articleTitle.trim().length === 0 ||
        team.articleSummary.trim().length === 0 ||
        team.articleUrl.trim().length === 0,
    };
  }, [team]);

  const nav: { id: Panel; label: string }[] = [
    { id: "dashboard", label: copy.navDashboard },
    { id: "members", label: copy.navMembers },
    { id: "article", label: copy.navArticle },
  ];

  async function onVerifyAccess() {
    setError(null);
    setPending(true);
    try {
      const result = await verifyLeaderAccessAction(code);
      if (result.status === "ok") {
        setTeam(result.team);
        setPanel("dashboard");
        setCode("");
        return;
      }

      setError(result.status === "invalid" ? "code" : "generic");
    } catch {
      setError("generic");
    } finally {
      setPending(false);
    }
  }

  async function onSignOut() {
    setPending(true);
    try {
      await signOutLeaderAction();
    } finally {
      setTeam(null);
      setPanel("dashboard");
      setNotice(null);
      setError(null);
      setCode("");
      setPending(false);
    }
  }

  async function onSaveForum() {
    if (team === null) {
      return;
    }

    setError(null);
    setNotice(null);
    setPending(true);
    try {
      const result = await saveLeaderForumAction(
        team.members.map((member) => ({
          memberId: member.id,
          forumUsername: member.forumUsername,
          forumProfileUrl: member.forumProfileUrl,
        })),
      );
      if (result.status === "ok") {
        setTeam(result.team);
        setNotice("forum");
        return;
      }

      setError(result.status === "invalid" ? "forum" : "generic");
    } catch {
      setError("generic");
    } finally {
      setPending(false);
    }
  }

  async function onSubmitArticle() {
    if (team === null) {
      return;
    }

    setError(null);
    setNotice(null);
    setPending(true);
    try {
      const result = await submitLeaderArticleAction(
        team.articleTitle,
        team.articleSummary,
        team.articleUrl,
      );
      if (result.status === "ok") {
        setTeam(result.team);
        setNotice("article");
        return;
      }

      if (result.status === "closed") {
        setError("closed");
        return;
      }

      setError(result.status === "invalid" ? "article" : "generic");
    } catch {
      setError("generic");
    } finally {
      setPending(false);
    }
  }

  function patchMember(memberId: string, patch: Partial<LeaderTeam["members"][number]>) {
    setTeam((current) => {
      if (current === null) {
        return current;
      }

      return {
        ...current,
        members: current.members.map((member) => (member.id === memberId ? { ...member, ...patch } : member)),
      };
    });
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className={pageTitle}>{copy.accessTitle}</h1>
        <p className={`mt-3 ${justifiedText}`}>{copy.accessLede}</p>
        <p className={`mt-3 ${justifiedText}`}>{copy.accessNeedCode}</p>
      </header>

      {notice === "forum" ? <StatusMessage tone="success">{copy.forumSaved}</StatusMessage> : null}
      {notice === "article" ? <StatusMessage tone="success">{copy.articleSaved}</StatusMessage> : null}
      {error === "access" ? <StatusMessage tone="danger">{copy.accessError}</StatusMessage> : null}
      {error === "code" ? <StatusMessage tone="danger">{copy.accessCodeError}</StatusMessage> : null}
      {error === "forum" ? <StatusMessage tone="danger">{copy.forumInvalid}</StatusMessage> : null}
      {error === "article" ? <StatusMessage tone="danger">{copy.articleInvalid}</StatusMessage> : null}
      {error === "closed" ? <StatusMessage tone="warning">{copy.articleClosed}</StatusMessage> : null}
      {error === "generic" ? <StatusMessage tone="danger">{copy.error}</StatusMessage> : null}

      {team === null ? (
        <section className="space-y-4 border border-line bg-canvas px-5 py-6 md:px-8">
          <form
            className="space-y-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void onVerifyAccess();
            }}
          >
            <div>
              <label className={fieldLabel} htmlFor="leader-code">
                {copy.accessCode}
              </label>
              <input
                id="leader-code"
                autoCapitalize="characters"
                autoComplete="one-time-code"
                spellCheck={false}
                required
                className={fieldControl}
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
            <button type="submit" className={primaryLink} disabled={pending}>
              {copy.accessVerify}
            </button>
          </form>
        </section>
      ) : (
        <>
          <nav aria-label={copy.accessTitle} className="flex flex-wrap gap-2">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                className={panel === item.id ? primaryLink : secondaryLink}
                onClick={() => setPanel(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {panel === "dashboard" ? (
            <section className="space-y-6 border border-line bg-canvas px-5 py-6 md:px-8">
              <h2 className={blockTitle}>{copy.dashboardTitle}</h2>
              <p className={bodyText}>{copy.dashboardLede}</p>
              <p className={bodyText}>
                {copy.teamName}: {team.name}
              </p>
              <p className={supportText}>
                {copy.membersTitle}: {team.members.length}
              </p>
              <p className={supportText}>
                {copy.statusLabel}: {statusLabel(copy, team.status)}
              </p>
              <div>
                <h3 className={blockTitle}>{copy.missingTitle}</h3>
                <ul className={`mt-3 space-y-2 ${bodyText}`}>
                  {missing.forum > 0 ? (
                    <li>
                      {copy.missingForum}: {missing.forum}
                    </li>
                  ) : null}
                  {missing.article ? <li>{copy.missingArticle}</li> : null}
                  {missing.forum === 0 && !missing.article ? <li>{copy.complete}</li> : null}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={secondaryLink} onClick={() => setPanel("members")}>
                  {copy.openMembers}
                </button>
                <button type="button" className={secondaryLink} onClick={() => setPanel("article")}>
                  {copy.openArticle}
                </button>
              </div>
            </section>
          ) : null}

          {panel === "members" ? (
            <section className="space-y-4 border border-line bg-canvas px-5 py-6 md:px-8">
              <h2 className={blockTitle}>{copy.membersTitle}</h2>
              <p className={bodyText}>{copy.membersForumLede}</p>
              <p className={supportText}>{copy.membersPrivateNote}</p>
              <ul className="space-y-6">
                {team.members.map((member) => (
                  <li key={member.id} className="space-y-3 border border-line px-4 py-4">
                    <p className="font-semibold text-ink">
                      {member.givenName} {member.familyName}
                    </p>
                    <p className={supportText}>{roleLabel(teamForm, member.role)}</p>
                    <p className={`mt-2 ${bodyText}`}>{member.email}</p>
                    <p className={supportText}>
                      {copy.forumStatus}: {forumLabel(copy, member.forumStatus)}
                    </p>
                    <div>
                      <label className={fieldLabel} htmlFor={`forum-user-${member.id}`}>
                        {copy.forumUsername}
                      </label>
                      <input
                        id={`forum-user-${member.id}`}
                        className={fieldControl}
                        value={member.forumUsername}
                        onChange={(event) => patchMember(member.id, { forumUsername: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className={fieldLabel} htmlFor={`forum-url-${member.id}`}>
                        {copy.forumUrl}
                      </label>
                      <input
                        id={`forum-url-${member.id}`}
                        type="url"
                        className={fieldControl}
                        value={member.forumProfileUrl}
                        onChange={(event) => patchMember(member.id, { forumProfileUrl: event.target.value })}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <button type="button" className={primaryLink} disabled={pending} onClick={() => void onSaveForum()}>
                {copy.saveForum}
              </button>
            </section>
          ) : null}

          {panel === "article" ? (
            <section className="space-y-4 border border-line bg-canvas px-5 py-6 md:px-8">
              <h2 className={blockTitle}>{copy.articleTitle}</h2>
              <p className={bodyText}>{copy.articlePeriod}</p>
              <p className={supportText}>
                {copy.articleStatus}: {articleLabel(copy, team.articleStatus)}
              </p>
              <div>
                <label className={fieldLabel} htmlFor="article-title">
                  {copy.articleName}
                </label>
                <input
                  id="article-title"
                  className={fieldControl}
                  value={team.articleTitle}
                  onChange={(event) => setTeam({ ...team, articleTitle: event.target.value })}
                />
              </div>
              <div>
                <label className={fieldLabel} htmlFor="article-summary">
                  {copy.articleSummary}
                </label>
                <textarea
                  id="article-summary"
                  className={`${fieldControl} min-h-28`}
                  maxLength={ARTICLE_SUMMARY_MAX}
                  value={team.articleSummary}
                  onChange={(event) => setTeam({ ...team, articleSummary: event.target.value })}
                />
                <p className={`mt-2 ${supportText}`}>
                  {copy.articleSummaryLimit} {team.articleSummary.length}/{ARTICLE_SUMMARY_MAX}
                </p>
              </div>
              <div>
                <label className={fieldLabel} htmlFor="article-url">
                  {copy.articleUrl}
                </label>
                <input
                  id="article-url"
                  type="url"
                  className={fieldControl}
                  value={team.articleUrl}
                  onChange={(event) => setTeam({ ...team, articleUrl: event.target.value })}
                />
              </div>
              <button
                type="button"
                className={primaryLink}
                disabled={pending || articleWindow() !== "open"}
                onClick={() => void onSubmitArticle()}
              >
                {team.articleStatus === "not_submitted" ? copy.articleSubmit : copy.articleReplace}
              </button>
            </section>
          ) : null}

          <button type="button" className={ghostButton} disabled={pending} onClick={() => void onSignOut()}>
            {copy.signOut}
          </button>
        </>
      )}

      <p>
        <a className={ghostButton} href={localePath(locale, "equipes")}>
          {dictionary.nav.participatingTeams}
        </a>
      </p>
    </div>
  );
}

function roleLabel(teamForm: Dictionary["registration"]["teamForm"], role: MemberRole): string {
  if (role === "leader") {
    return teamForm.roleLeader;
  }

  if (role === "deputy") {
    return teamForm.roleDeputy;
  }

  return teamForm.roleMember;
}

function statusLabel(copy: Dictionary["workspace"], status: LeaderTeam["status"]): string {
  if (status === "suspended") {
    return copy.statusSuspended;
  }

  if (status === "rejected") {
    return copy.statusRejected;
  }

  return copy.statusSubmitted;
}

function articleLabel(copy: Dictionary["workspace"], status: ArticleStatus): string {
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

function forumLabel(copy: Dictionary["workspace"], status: ForumProfileStatus): string {
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
