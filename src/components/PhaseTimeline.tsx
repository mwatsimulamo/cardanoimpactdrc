import Link from "next/link";
import { blockTitle, sectionTitle, supportText, textLink } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import { localePath, type Locale } from "@/lib/locales";
import { readPublishedRoadmap } from "@/lib/published-records";
import type { RoadmapStatus } from "@/lib/program-roadmap";

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

  return (
    <section className="mt-16 md:mt-24" aria-labelledby="home-phases">
      <h2 id="home-phases" className={`${sectionTitle} scroll-mt-28`}>
        {heading}
      </h2>
      <ol className="relative mt-10">
        <span
          aria-hidden="true"
          className="absolute bottom-4 left-4 top-4 w-px bg-line md:left-1/2"
        />
        {phases.map((phase, index) => {
          const copy = dictionary.phases[phase.key];
          const active = phase.status === "current";
          const onLeft = index % 2 === 0;

          return (
            <li key={phase.key} className="relative pb-6 pl-12 last:pb-0 md:min-h-28 md:pb-8 md:pl-0">
              <span
                aria-hidden="true"
                className={`absolute left-4 top-6 z-10 flex size-8 -translate-x-1/2 items-center justify-center md:left-1/2 ${markerClass(phase.status)}`}
              >
                {phase.status === "done" ? <CheckIcon /> : null}
              </span>
              <article
                className={`border bg-canvas px-5 py-5 md:w-[calc(50%-2.5rem)] ${
                  active ? "border-brand" : "border-line"
                } ${onLeft ? "md:mr-auto" : "md:ml-auto"}`}
              >
                <p className={supportText}>
                  <span className="font-semibold text-brand tabular-nums">
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
                  <Link className={textLink} href={`${localePath(locale, "programme")}#programme-${phase.key}`}>
                    {copy.title}
                  </Link>
                </h3>
                <p className={`mt-2 ${supportText}`}>
                  <time dateTime={phase.plannedStart}>{copy.when}</time>
                </p>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function markerClass(status: RoadmapStatus): string {
  if (status === "done" || status === "current") {
    return "bg-action text-white";
  }

  if (status === "postponed") {
    return "border-2 border-warning bg-canvas";
  }

  return "border border-line bg-canvas";
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
