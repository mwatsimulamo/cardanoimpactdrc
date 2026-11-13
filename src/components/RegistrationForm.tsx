"use client";

import Link from "next/link";
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
  sectionTitle,
  supportText,
  textLink,
} from "@/components/classes";
import { MenuSectionScroll } from "@/components/MenuSectionScroll";
import { StatusMessage } from "@/components/StatusMessage";
import type { Dictionary } from "@/content/types";
import { lumaEvents } from "@/lib/luma-events";
import { localePath, type Locale } from "@/lib/locales";
import {
  publicRegistrationState,
  type RegistrationAvailability,
} from "@/lib/registration-status";
import { submitTeamRegistration } from "@/lib/submit-team-registration";
import {
  emptyMember,
  emptyTeamDraft,
  hasTeamDraftErrors,
  MAX_TEAM_MEMBERS,
  MIN_TEAM_MEMBERS,
  validateTeamDraft,
  type MemberRole,
  type TeamDraft,
  type TeamDraftErrors,
} from "@/lib/team-registration";

export function RegistrationForm({
  locale,
  dictionary,
  availability,
}: {
  locale: Locale;
  dictionary: Dictionary;
  availability: RegistrationAvailability;
}) {
  const fields = dictionary.registration.fields;
  const journey = dictionary.registration.journey;
  const teamForm = dictionary.registration.teamForm;
  const [draft, setDraft] = useState<TeamDraft>(emptyTeamDraft);
  const [errors, setErrors] = useState<TeamDraftErrors | null>(null);
  const [checked, setChecked] = useState(false);
  const [pending, setPending] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [accessCodeCopied, setAccessCodeCopied] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<"recorded" | "duplicate_email" | "duplicate_name" | "error" | null>(
    null,
  );

  const messages = useMemo(
    () => ({
      required: fields.required,
      tooLong: teamForm.tooLong,
      memberCount: teamForm.memberCount,
      oneLeader: teamForm.oneLeader,
      maxDeputy: teamForm.maxDeputy,
      emailFormat: teamForm.emailFormat,
      emailUnique: teamForm.emailUnique,
    }),
    [fields.required, teamForm],
  );

  const registrationOpen = availability.teamsOpen;
  const sessionsState = publicRegistrationState(availability.sessionsStatus);
  const workshopState = publicRegistrationState(availability.workshopStatus);
  const describedBy = registrationOpen ? "registration-window" : "registration-closed registration-window";
  const teamsHref = localePath(locale, "equipes");
  const leaderHref = localePath(locale, "equipe");

  function runCheck() {
    const next = validateTeamDraft(draft, messages);
    setErrors(next);
    setChecked(true);
    return next;
  }

  async function onSubmit() {
    setSubmitMessage(null);
    setAccessCode(null);
    const next = runCheck();
    if (hasTeamDraftErrors(next) || !registrationOpen || pending) {
      return;
    }

    setPending(true);
    try {
      const result = await submitTeamRegistration(draft, locale);
      if (result.status === "ok") {
        setAccessCode(result.accessCode ?? null);
        setAccessCodeCopied(false);
        setSubmitMessage("recorded");
        setDraft(emptyTeamDraft());
        setErrors(null);
        setChecked(false);
        return;
      }

      if (result.status === "invalid") {
        setErrors(validateTeamDraft(draft, messages));
        return;
      }

      setSubmitMessage(result.status === "duplicate_email" || result.status === "duplicate_name" ? result.status : "error");
    } catch {
      setSubmitMessage("error");
    } finally {
      setPending(false);
    }
  }

  const valid = checked && errors !== null && !hasTeamDraftErrors(errors);

  return (
    <>
      <MenuSectionScroll focusId="registration-lead" />
      <section aria-labelledby="registration-lead">
        <h1 id="registration-lead" className={`${pageTitle} scroll-mt-28`}>
          {dictionary.registration.title}
        </h1>
        <div className="mt-4 space-y-3">
          {journey.pathsIntro.map((paragraph) => (
            <p key={paragraph} className={justifiedText}>
              {paragraph}
            </p>
          ))}
        </div>
        <div
          id="registration-sessions"
          className="mt-8 grid scroll-mt-28 gap-4 sm:grid-cols-2"
        >
          <SessionCard
            kicker={journey.training.session1Title}
            title={journey.training.session1Topic}
            when={journey.training.session1When}
            cta={journey.training.session1Cta}
            href={lumaEvents.session1}
            newTab={dictionary.links.opensNewTab}
            open={availability.sessionsOpen}
            stateLabel={
              sessionsState === "open"
                ? dictionary.registration.sessionsOpen
                : sessionsState === "closed"
                  ? dictionary.registration.sessionsClosed
                  : dictionary.registration.sessionsUpcoming
            }
          />
          <SessionCard
            kicker={journey.training.session2Title}
            title={journey.training.session2Topic}
            when={journey.training.session2When}
            cta={journey.training.session2Cta}
            href={lumaEvents.session2}
            newTab={dictionary.links.opensNewTab}
            open={availability.sessionsOpen}
            stateLabel={
              sessionsState === "open"
                ? dictionary.registration.sessionsOpen
                : sessionsState === "closed"
                  ? dictionary.registration.sessionsClosed
                  : dictionary.registration.sessionsUpcoming
            }
          />
        </div>
        <div id="registration-workshop" className="mt-4 max-w-xl scroll-mt-28">
          <SessionCard
            title={journey.workshop.sessionTitle}
            when={journey.workshop.when}
            cta={journey.workshop.cta}
            href={lumaEvents.workshop}
            newTab={dictionary.links.opensNewTab}
            open={availability.workshopOpen}
            stateLabel={
              workshopState === "open"
                ? dictionary.registration.workshopOpen
                : workshopState === "closed"
                  ? dictionary.registration.workshopClosed
                  : dictionary.registration.workshopUpcoming
            }
          />
        </div>
      </section>

      <section className="mt-16 border-t border-line pt-12 md:mt-24" aria-labelledby="registration-form">
        <h2 id="registration-form" className={`${sectionTitle} scroll-mt-28`}>
          {journey.formTitle}
        </h2>
        <p className={`mt-3 ${justifiedText}`}>{journey.formIntro}</p>
        <div className="mt-6 space-y-3">
          {registrationOpen ? (
            <>
              <StatusMessage id="registration-closed" tone="success">
                {dictionary.registration.teamsOpen}
              </StatusMessage>
              <p id="registration-window" className={justifiedText}>
                {dictionary.registration.periodOpen}
              </p>
              <p className={`text-[0.9375rem] leading-[1.55] text-muted`}>{dictionary.registration.review}</p>
              <p className={`text-[0.9375rem] leading-[1.55] text-muted`}>{dictionary.registration.laterUpdate}</p>
            </>
          ) : (
            <>
              <StatusMessage id="registration-closed" tone="danger">
                <span className="font-semibold">{dictionary.registration.closed}</span>{" "}
                {dictionary.registration.closedHintBefore}
                <Link className={textLink} href={`${localePath(locale)}#newsletter`}>
                  {dictionary.registration.closedNewsletter}
                </Link>
                {dictionary.registration.closedHintMiddle}
                <Link className={textLink} href={localePath(locale, "contact")}>
                  {dictionary.registration.closedContact}
                </Link>
                {dictionary.registration.closedHintAfter}
              </StatusMessage>
              <p id="registration-window" className={`text-[0.9375rem] leading-[1.55] text-muted`}>
                {dictionary.registration.period}
              </p>
            </>
          )}
        </div>

        <form
          className="mt-8 space-y-6"
          aria-describedby={describedBy}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit();
          }}
        >
          <section className="space-y-4 border border-line bg-canvas px-5 py-6 md:px-8">
            <h3 className={blockTitle}>{teamForm.teamInfo}</h3>
            <TextField
              id="team-name"
              label={teamForm.teamName}
              requiredLabel={fields.required}
              value={draft.name}
              error={errors?.name}
              onChange={(value) => setDraft((current) => ({ ...current, name: value }))}
            />
            <TextField
              id="team-city"
              label={teamForm.city}
              requiredLabel={fields.required}
              value={draft.city}
              error={errors?.city}
              onChange={(value) => setDraft((current) => ({ ...current, city: value }))}
            />
          </section>

          <section className="space-y-4 border border-line bg-canvas px-5 py-6 md:px-8">
            <h3 className={blockTitle}>{teamForm.members}</h3>
            <p className={supportText}>{teamForm.rules}</p>
            <p className={supportText}>{teamForm.forumLater}</p>
            {errors?.members ? (
              <p className="text-[0.9375rem] text-danger" role="alert">
                {errors.members}
              </p>
            ) : null}
            <ol className="space-y-6">
              {draft.members.map((member, index) => (
                <li key={index} className="border border-line px-4 py-5 md:px-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[0.9375rem] font-semibold text-ink">
                      {teamForm.memberLabel} {index + 1}
                    </p>
                    {draft.members.length > MIN_TEAM_MEMBERS ? (
                      <button
                        type="button"
                        className={ghostButton}
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            members: current.members.filter((_, memberIndex) => memberIndex !== index),
                          }))
                        }
                      >
                        {teamForm.removeMember}
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <TextField
                      id={`member-${index}-given`}
                      label={fields.givenName}
                      requiredLabel={fields.required}
                      autoComplete="given-name"
                      value={member.givenName}
                      error={errors?.memberFields[`${index}.givenName`]}
                      onChange={(value) => updateMember(setDraft, index, { givenName: value })}
                    />
                    <TextField
                      id={`member-${index}-family`}
                      label={fields.familyName}
                      requiredLabel={fields.required}
                      autoComplete="family-name"
                      value={member.familyName}
                      error={errors?.memberFields[`${index}.familyName`]}
                      onChange={(value) => updateMember(setDraft, index, { familyName: value })}
                    />
                    <TextField
                      id={`member-${index}-email`}
                      label={fields.email}
                      requiredLabel={fields.required}
                      autoComplete="email"
                      type="email"
                      value={member.email}
                      error={errors?.memberFields[`${index}.email`]}
                      onChange={(value) => updateMember(setDraft, index, { email: value })}
                    />
                    <div>
                      <label className={fieldLabel} htmlFor={`member-${index}-role`}>
                        {teamForm.role}
                        <span className="ml-2 font-normal text-muted">{fields.required}</span>
                      </label>
                      <select
                        id={`member-${index}-role`}
                        className={fieldControl}
                        value={member.role}
                        onChange={(event) =>
                          updateMember(setDraft, index, { role: event.target.value as MemberRole })
                        }
                      >
                        <option value="leader">{teamForm.roleLeader}</option>
                        <option value="deputy">{teamForm.roleDeputy}</option>
                        <option value="member">{teamForm.roleMember}</option>
                      </select>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            {draft.members.length < MAX_TEAM_MEMBERS ? (
              <button
                type="button"
                className={ghostButton}
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    members: [...current.members, emptyMember("member")],
                  }))
                }
              >
                {teamForm.addMember}
              </button>
            ) : null}
          </section>

          {valid && submitMessage === null ? <StatusMessage tone="success">{teamForm.valid}</StatusMessage> : null}
          {submitMessage === "recorded" ? (
            <div className="space-y-3">
              <StatusMessage tone="success">{teamForm.recorded}</StatusMessage>
              {accessCode ? (
                <div className="space-y-2">
                  <p className={bodyText}>{teamForm.accessCodeTitle}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold tabular-nums tracking-[0.2em] text-ink">{accessCode}</p>
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center rounded-[2px] border border-line bg-canvas px-3 text-[0.9375rem] font-semibold text-ink"
                      aria-live="polite"
                      onClick={() => {
                        void navigator.clipboard.writeText(accessCode).then(
                          () => setAccessCodeCopied(true),
                          () => setAccessCodeCopied(false),
                        );
                      }}
                    >
                      {accessCodeCopied ? teamForm.accessCodeCopied : teamForm.accessCodeCopy}
                    </button>
                  </div>
                  <p className={supportText}>{teamForm.accessCodeKeep}</p>
                </div>
              ) : (
                <p className={bodyText}>{teamForm.accessCodeMissing}</p>
              )}
              <p>
                <Link className={textLink} href={teamsHref}>
                  {dictionary.home.statsLink}
                </Link>
              </p>
              <p>
                <Link className={textLink} href={leaderHref}>
                  {dictionary.workspace.workspaceLink}
                </Link>
              </p>
            </div>
          ) : null}
          {submitMessage === "duplicate_email" ? (
            <StatusMessage tone="danger">{teamForm.duplicateEmail}</StatusMessage>
          ) : null}
          {submitMessage === "duplicate_name" ? (
            <StatusMessage tone="danger">{teamForm.duplicateName}</StatusMessage>
          ) : null}
          {submitMessage === "error" ? <StatusMessage tone="danger">{teamForm.saveError}</StatusMessage> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className={ghostButton}
              onClick={() => {
                runCheck();
              }}
            >
              {teamForm.verify}
            </button>
            <button
              type="submit"
              disabled={!registrationOpen || pending}
              className={`${primaryLink} disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {pending ? teamForm.submitting : dictionary.registration.submit}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

function updateMember(
  setDraft: React.Dispatch<React.SetStateAction<TeamDraft>>,
  index: number,
  patch: Partial<TeamDraft["members"][number]>,
) {
  setDraft((current) => ({
    ...current,
    members: current.members.map((member, memberIndex) =>
      memberIndex === index ? { ...member, ...patch } : member,
    ),
  }));
}

function TextField({
  id,
  label,
  requiredLabel,
  value,
  onChange,
  error,
  autoComplete = "off",
  type = "text",
}: {
  id: string;
  label: string;
  requiredLabel?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  type?: string;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label className={fieldLabel} htmlFor={id}>
        {label}
        {requiredLabel ? <span className="ml-2 font-normal text-muted">{requiredLabel}</span> : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={fieldControl}
      />
      {error ? (
        <p id={errorId} className="mt-2 text-[0.9375rem] text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SessionCard({
  kicker,
  title,
  when,
  cta,
  href,
  newTab,
  open,
  stateLabel,
}: {
  kicker?: string;
  title: string;
  when: string;
  cta: string;
  href: string;
  newTab: string;
  open: boolean;
  stateLabel: string;
}) {
  return (
    <article className="path-reveal flex h-full flex-col gap-2 border border-line bg-surface px-5 py-6">
      {kicker ? <p className="text-base font-semibold text-brand">{kicker}</p> : null}
      <h2 className={blockTitle}>{title}</h2>
      <p className={`${blockTitle} text-brand`}>{when}</p>
      <p className={supportText}>{stateLabel}</p>
      <div className="mt-auto pt-6">
        {open ? (
          <a className={primaryLink} href={href} target="_blank" rel="noopener noreferrer">
            {cta}
            <span className="sr-only"> ({newTab})</span>
          </a>
        ) : (
          <p className={`${supportText} font-semibold`}>{stateLabel}</p>
        )}
      </div>
    </article>
  );
}
