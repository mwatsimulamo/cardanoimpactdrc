import Link from "next/link";
import { blockTitle, sectionTitle, supportText } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import { type Locale } from "@/lib/locales";
import { readPublishedRoadmap } from "@/lib/published-records";
import {
  inclusiveDayCount,
  isStageActive,
  isStageFilled,
  legendStatuses,
  phaseTargetHref,
  phaseWindowRatio,
  progressRatio,
  statusTone,
  type PhaseKey,
  type RoadmapStatus,
} from "@/lib/program-roadmap";

export async function PhaseTimeline({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
  heading?: string;
}) {
  const phases = (await readPublishedRoadmap()).phases;
  const fill = progressRatio(phases);

  return (
    <section className="mt-16 md:mt-24" aria-labelledby="home-phases">
      <h2 id="home-phases" className={`scroll-mt-28 text-center ${sectionTitle}`}>
        {dictionary.home.phasesRange}
      </h2>

      <ol className="relative mt-10">
        <span aria-hidden="true" className="absolute bottom-4 left-4 top-4 w-px overflow-hidden bg-line md:left-1/2">
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
          const tone = statusTone[phase.status];
          const days = inclusiveDayCount(phase.plannedStart, phase.plannedEnd);
          const window = phaseWindowRatio(phase.plannedStart, phase.plannedEnd);
          const dayLabel = days === 1 ? dictionary.home.phaseDay : dictionary.home.phaseDays;
          const showLegend = index === 0;
          const href = phaseTargetHref(locale, phase.key);
          return (
            <li
              id={`home-phase-${phase.key}`}
              key={phase.key}
              className={`roadmap-stage relative scroll-mt-28 pb-6 pl-12 last:pb-0 md:min-h-28 md:pb-8 md:pl-0 ${
                onLeft ? "roadmap-stage-left" : "roadmap-stage-right"
              }`}
              style={{
                ["--admin-delay" as string]: `${index * 70}ms`,
                ["--phase-accent" as string]: tone.mark,
              }}
            >
              <span
                aria-hidden="true"
                className="absolute left-4 top-6 z-10 size-2.5 -translate-x-1/2 md:left-1/2"
                style={{
                  backgroundColor: tone.mark,
                  boxShadow: active ? `0 0 0 4px color-mix(in srgb, ${tone.mark} 30%, transparent)` : undefined,
                  opacity: filled || active ? 1 : 0.85,
                }}
              />

              <Link
                href={href}
                className={`roadmap-card group relative block overflow-hidden rounded-xl border px-5 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:w-[calc(50%-2.5rem)] ${
                  onLeft ? "md:mr-auto" : "md:ml-auto"
                }`}
                style={{
                  ["--phase-accent" as string]: tone.mark,
                  borderColor: tone.mark,
                  backgroundColor: tone.paintsCard ? tone.card : "rgb(10 22 52 / 86%)",
                }}
              >
                <p
                  className="relative z-[1] inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold uppercase tracking-[0.04em]"
                  style={{ color: tone.ink }}
                >
                  <span aria-hidden="true" className="inline-block size-2.5" style={{ backgroundColor: tone.mark }} />
                  {dictionary.timeline[phase.status]}
                </p>

                <h3 className={`relative z-[1] mt-3 ${blockTitle}`}>
                  <span className="text-ink transition-colors duration-150 group-hover:text-white">
                    {copy.title}
                  </span>
                </h3>

                <div className={`relative z-[1] mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 ${supportText}`}>
                  <time dateTime={phase.plannedStart}>{copy.when}</time>
                  <span className="tabular-nums">
                    {days} {dayLabel}
                  </span>
                </div>

                {isRegistrationStage(phase.key) ? (
                  <p className={`relative z-[1] mt-3 ${supportText}`}>{registrationHint(dictionary, phase.status)}</p>
                ) : null}

                <div
                  className="relative z-[1] mt-4 h-1.5 w-full overflow-hidden"
                  style={{ backgroundColor: "rgb(176 204 242 / 18%)" }}
                  aria-hidden="true"
                >
                  <span
                    className="block h-full"
                    style={{
                      width: `${Math.max(3, window.width * 100)}%`,
                      marginLeft: `${window.offset * 100}%`,
                      backgroundColor: tone.mark,
                    }}
                  />
                </div>

                <span className="roadmap-card-cta relative z-[1] mt-4 inline-flex text-[0.875rem] font-semibold">
                  {dictionary.home.phasesCardCta}
                  <span aria-hidden="true"> →</span>
                </span>
              </Link>

              {showLegend ? (
                <aside
                  className="mt-4 bg-canvas px-4 py-3 md:absolute md:left-[calc(50%+2.5rem)] md:right-0 md:top-0 md:mt-0"
                  aria-label={dictionary.home.phasesLegendTitle}
                >
                  <p className="text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-brand">
                    {dictionary.home.phasesLegendTitle}
                  </p>
                  <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {legendStatuses.map((status) => {
                      const item = statusTone[status];
                      return (
                        <li key={status} className="flex items-center gap-1.5 text-[0.8125rem] leading-tight text-ink">
                          <span aria-hidden="true" className="size-2 shrink-0" style={{ backgroundColor: item.mark }} />
                          {dictionary.timeline[status]}
                        </li>
                      );
                    })}
                  </ul>
                  <p className={`mt-2 text-[0.8125rem] leading-snug text-muted`}>{dictionary.home.phasesBarHint}</p>
                </aside>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 md:mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[0.9375rem] font-semibold text-ink">{dictionary.home.phasesProgressLabel}</p>
          <p className="tabular-nums text-[0.9375rem] font-semibold text-brand">{Math.round(fill * 100)}&nbsp;%</p>
        </div>
        <div
          className="mt-3 h-2.5 w-full overflow-hidden border border-line bg-surface"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(fill * 100)}
          aria-label={dictionary.home.phasesProgressLabel}
        >
          <span
            className="roadmap-progress-x block h-full bg-brand"
            style={{ width: `${Math.max(fill > 0 ? 4 : 0, fill * 100)}%` }}
          />
        </div>
      </div>
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
