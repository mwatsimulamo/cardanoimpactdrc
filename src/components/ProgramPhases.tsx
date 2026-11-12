import Link from "next/link";
import { blockTitle, justifiedText, sectionTitle, supportText, textLink } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import { localePath, type Locale } from "@/lib/locales";
import { phaseAccent } from "@/lib/program-roadmap";
import { readPublishedRoadmap } from "@/lib/published-records";

export async function ProgramPhases({
  locale,
  dictionary,
  heading,
  detailed = false,
  idPrefix = "programme",
}: {
  locale: Locale;
  dictionary: Dictionary;
  heading?: string;
  detailed?: boolean;
  idPrefix?: string;
}) {
  const headingId = `${idPrefix}-phases`;
  const phases = (await readPublishedRoadmap()).phases;

  return (
    <section className="mt-16 md:mt-24" aria-labelledby={headingId}>
      {heading ? (
        <h2 id={headingId} className={sectionTitle}>
          {heading}
        </h2>
      ) : (
        <h2 id={headingId} className="sr-only">
          {dictionary.home.phasesTitle}
        </h2>
      )}
      <ol
        className={
          detailed
            ? "mt-6 flex flex-col gap-4"
            : "mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        }
      >
        {phases.map((item, index) => {
          const key = item.key;
          const phase = dictionary.phases[key];
          const anchor = `${localePath(locale, "programme")}#programme-${key}`;
          return (
            <li
              key={key}
              id={detailed ? `${idPrefix}-${key}` : undefined}
              className={`relative scroll-mt-28 border border-line bg-canvas px-5 py-6 md:px-6 ${
                detailed
                  ? "md:grid md:grid-cols-[4.5rem_minmax(0,1fr)] md:gap-x-8 md:py-8"
                  : "flex h-full flex-col"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute ${detailed ? "inset-y-0 left-0 w-1.5" : "inset-x-0 top-0 h-1.5"}`}
                style={{ backgroundColor: phaseAccent[key] }}
              />
              <p
                className="text-[1.75rem] font-semibold leading-none tabular-nums"
                style={{ color: phaseAccent[key] }}
              >
                {String(index + 1).padStart(2, "0")}
              </p>
              <div className={detailed ? "mt-4 md:mt-0" : "mt-4 flex flex-1 flex-col"}>
                <h3 className={blockTitle}>
                  {detailed ? (
                    phase.title
                  ) : (
                    <Link className={textLink} href={anchor}>
                      {phase.title}
                    </Link>
                  )}
                </h3>
                <p className={`mt-2 ${supportText}`}>{dictionary.timeline[item.status]}</p>
                <p className={`mt-3 ${justifiedText}`}>{phase.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
