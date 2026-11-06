import { blockTitle, justifiedText, supportText } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import type { Locale } from "@/lib/locales";
import { readPublishedRoadmap } from "@/lib/published-records";
import type { RoadmapStatus } from "@/lib/program-roadmap";

export async function PublicRoadmap({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const phases = (await readPublishedRoadmap()).phases;
  const copy = dictionary.roadmap;

  return (
    <ol className="mt-10 space-y-4">
      {phases.map((phase, index) => {
        const text = dictionary.phases[phase.key];
        return (
          <li key={phase.key} className="border border-line bg-canvas px-5 py-6 md:px-8">
            <p className={supportText}>
              <span className="font-semibold text-brand tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mx-2">·</span>
              {statusLabel(dictionary, phase.status)}
            </p>
            <h2 className={`mt-3 ${blockTitle}`}>{text.title}</h2>
            <p className={`mt-2 ${justifiedText}`}>{text.body}</p>
            <dl className={`mt-4 grid gap-3 md:grid-cols-2 ${supportText}`}>
              <div>
                <dt>{copy.planned}</dt>
                <dd className="mt-1 text-ink">{text.when}</dd>
              </div>
              <div>
                <dt>{copy.actual}</dt>
                <dd className="mt-1 text-ink">
                  {phase.actualStart ?? copy.unpublishedActual}
                </dd>
              </div>
            </dl>
            {phase.supplement[locale].trim() ? (
              <p className={`mt-4 ${justifiedText}`}>{phase.supplement[locale]}</p>
            ) : null}
            <p className={`mt-2 ${supportText}`}>
              {phase.report[locale].trim() || copy.emptyReport}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function statusLabel(dictionary: Dictionary, status: RoadmapStatus): string {
  if (status === "done") {
    return dictionary.timeline.done;
  }

  if (status === "current") {
    return dictionary.timeline.current;
  }

  if (status === "postponed") {
    return dictionary.timeline.postponed;
  }

  return dictionary.timeline.upcoming;
}
