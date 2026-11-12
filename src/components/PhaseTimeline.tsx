import Link from "next/link";
import { blockTitle, sectionTitle, supportText, textLink } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import { localePath, type Locale } from "@/lib/locales";
import { readPublishedRoadmap } from "@/lib/published-records";
import {
  isStageActive,
  isStageFilled,
  phaseAccent,
  progressRatio,
  type PhaseKey,
  type RoadmapStatus,
} from "@/lib/program-roadmap";

export async function PhaseTimeline({
  locale,
  dictionary,
  heading,
}: {
  locale: Locale;
  dictionary: Dictionary;
  heading: string;
}) {
  const phases = (await readPublishedRoadmap()).phases;
  const fill = progressRatio(phases);

  return (
    <section className="mt-16 md:mt-24" aria-labelledby="home-phases">
      <h2 id="home-phases" className={`${sectionTitle} scroll-mt-28`}>
        {heading}
      </h2>
      <ol className="relative mt-10">
        <span
          aria-hidden="true"
          className="absolute bottom-4 left-4 top-4 w-px overflow-hidden bg-line md:left-1/2"
        >
          <span
            className="roadmap-progress absolute inset-x-0 top-0 w-full origin-top bg-brand"
            style={{ height: `${Math.max(8, fill * 100)}%` }}
          />
        </span>
        {phases.map((phase, index) => {
          const copy = dictionary.phases[phase.key];
          const active = isStageActive(phase.status);
          const filled = isStageFilled(phase.status);
          const onLeft = index % 2 === 0;
          const accent = phaseAccent[phase.key];

          return (
            <li
              key={phase.key}
              className={`roadmap-stage relative pb-6 pl-12 last:pb-0 md:min-h-28 md:pb-8 md:pl-0 ${
                onLeft ? "roadmap-stage-left" : "roadmap-stage-right"
              }`}
              style={{ ["--admin-delay" as string]: `${index * 70}ms`, ["--phase-accent" as string]: accent }}
            >
              <span
                aria-hidden="true"
                className={`absolute left-4 top-6 z-10 flex size-8 -translate-x-1/2 items-center justify-center md:left-1/2 ${markerClass(phase.status)}`}
                style={{
                  backgroundColor: filled || active ? accent : undefined,
                  borderColor: accent,
                  boxShadow: active ? `0 0 0 3px color-mix(in srgb, ${accent} 35%, transparent)` : undefined,
                }}
              >
                {filled ? <CheckIcon /> : <span className="size-2 rounded-[1px] bg-current opacity-80" />}
              </span>
              <article
                className={`border bg-canvas px-5 py-5 md:w-[calc(50%-2.5rem)] ${
                  active ? "border-[color:var(--phase-accent)]" : "border-line"
                } ${onLeft ? "md:mr-auto" : "md:ml-auto"} ${filled ? "opacity-100" : active ? "opacity-100" : "opacity-80"}`}
                style={{ borderTopWidth: "3px", borderTopColor: accent }}
              >
                <p className={supportText}>
                  <span className="font-semibold tabular-nums" style={{ color: accent }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mx-2 text-line" aria-hidden="true">
                    ·
                  </span>
                  <span className={active ? "font-semibold text-ink" : ""}>
                    {dictionary.timeline[phase.status]}
                  </span>
                </p>
                <h3 className={`mt-3 ${blockTitle}`}>
                  <Link className={textLink} href={`${localePath(locale, "calendrier")}#calendrier-${phase.key}`}>
                    {copy.title}
                  </Link>
                </h3>
                <p className={`mt-2 ${supportText}`}>
                  <time dateTime={phase.plannedStart}>{copy.when}</time>
                </p>
                {isRegistrationStage(phase.key) ? (
                  <p className={`mt-3 ${supportText}`}>{registrationHint(dictionary, phase.status)}</p>
                ) : null}
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function isRegistrationStage(key: PhaseKey): boolean {
  return key === "sessions_signup" || key === "workshop_signup" || key === "teams";
}

function registrationHint(dictionary: Dictionary, status: RoadmapStatus): string {
  if (status === "open") {
    return dictionary.registrationState.open;
  }

  if (status === "closed" || status === "done") {
    return dictionary.registrationState.closed;
  }

  return dictionary.registrationState.upcoming;
}

function markerClass(status: RoadmapStatus): string {
  if (isStageFilled(status) || isStageActive(status)) {
    return "text-white";
  }

  if (status === "postponed") {
    return "border-2 border-warning bg-canvas text-warning";
  }

  return "border-2 bg-canvas text-muted";
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
      <path
        d="M3.5 8.2 6.4 11 12.5 4.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
