import Link from "next/link";
import { HomeAimsMedia } from "@/components/HomeAimsMedia";
import { blockTitle, justifiedText, sectionTitle, textLink } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import { localePath, type Locale } from "@/lib/locales";

export function HomeAims({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  return (
    <section aria-labelledby="home-aims" className="home-aims">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10 xl:gap-14">
        <HomeAimsMedia alt={dictionary.home.aimsMediaAlt} />

        <div className="lg:py-2">
          <h2 id="home-aims" className={`${sectionTitle} text-pretty`}>
            {dictionary.home.aimsTitle}
          </h2>

          <ol className="mt-8 space-y-0 border-t border-line">
            {dictionary.home.aims.map((aim) => (
              <li key={aim.title} className="border-b border-line py-5 first:pt-6 last:pb-0">
                <h3 className={blockTitle}>{aim.title}</h3>
                <p className={`mt-2 max-w-[34rem] ${justifiedText}`}>{aim.body}</p>
              </li>
            ))}
          </ol>

          <p className="mt-7">
            <Link className={textLink} href={localePath(locale, "programme")}>
              {dictionary.actions.discoverProgram}
              <span aria-hidden="true"> →</span>
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
