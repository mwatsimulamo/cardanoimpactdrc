import { justifiedText, sectionTitle } from "@/components/classes";
import { ExternalLink } from "@/components/ExternalLink";
import { SectionHeading } from "@/components/MenuBook";
import type { Dictionary } from "@/content/types";
import { localePath, type Locale } from "@/lib/locales";

export function guideSectionLinks(dictionary: Dictionary) {
  const guide = dictionary.guide;
  return [
    { id: "guide-overview", label: guide.overviewTitle },
    { id: "guide-forum", label: guide.forumTitle },
    { id: "guide-presentation", label: guide.presentationTitle },
    { id: "guide-who", label: guide.whoTitle },
    { id: "guide-domains", label: dictionary.home.domainsTitle },
    { id: "guide-research", label: guide.researchTitle },
    { id: "guide-deliverable", label: guide.deliverableTitle },
    { id: "guide-ethics", label: guide.ethicsTitle },
    { id: "guide-workshop", label: guide.workshopTitle },
    { id: "guide-rewards", label: guide.rewardsTitle },
  ];
}

const headingClass = `${sectionTitle} scroll-mt-28`;

/** Points cités : filet horizontal coloré, sans case. */
function StripeList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5">
      {items.map((item) => (
        <li key={item} className="border-t border-[#d5dce6] py-4 first:border-t-0 first:pt-0">
          <span aria-hidden="true" className="mb-3 block h-0.5 w-10 bg-[#0033ad]" />
          <p className={justifiedText}>{item}</p>
        </li>
      ))}
    </ul>
  );
}

function Prose({ children }: { children: string }) {
  return <p className={`mt-4 ${justifiedText}`}>{children}</p>;
}

export function ParticipantGuide({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const guide = dictionary.guide;
  const focusCol = locale === "fr" ? "À traiter" : "What to address";

  return (
    <>
      <section aria-labelledby="guide-overview">
        <SectionHeading
          id="guide-overview"
          href={localePath(locale, "concours")}
          title={guide.overviewTitle}
        />
        <Prose>{guide.lede}</Prose>
        <Prose>{guide.overview}</Prose>
      </section>

      <section className="mt-16" aria-labelledby="guide-forum">
        <h2 id="guide-forum" className={headingClass}>
          {guide.forumTitle}
        </h2>
        <Prose>{guide.forumIntro}</Prose>
        <p className={`mt-6 ${justifiedText}`}>{guide.forumCanLead}</p>
        <StripeList items={guide.forumCan} />
        <p className={`mt-4 ${justifiedText}`}>
          {guide.forumAccess}{" "}
          <ExternalLink newTabLabel={dictionary.links.opensNewTab} />
        </p>
        <Prose>{guide.forumCompetition}</Prose>
        <p className={`mt-4 ${justifiedText}`}>
          <span className="font-semibold text-[#0033ad]">{guide.forumAccountLabel}</span>{" "}
          {guide.forumAccount}
        </p>
      </section>

      <section className="mt-16" aria-labelledby="guide-presentation">
        <h2 id="guide-presentation" className={headingClass}>
          {guide.presentationTitle}
        </h2>
        {guide.presentation.map((paragraph) => (
          <Prose key={paragraph}>{paragraph}</Prose>
        ))}
        <Prose>{guide.notHackathon}</Prose>
        <Prose>{guide.independence}</Prose>
      </section>

      <section className="mt-16" aria-labelledby="guide-who">
        <h2 id="guide-who" className={headingClass}>
          {guide.whoTitle}
        </h2>
        <StripeList items={guide.who} />
      </section>

      <section className="mt-16" aria-labelledby="guide-domains">
        <h2 id="guide-domains" className={headingClass}>
          {dictionary.home.domainsTitle}
        </h2>
        <Prose>{dictionary.home.domainsIntro}</Prose>
        <ul className="mt-5 grid gap-x-10 gap-y-2 sm:grid-cols-2">
          {dictionary.home.domains.map((domain) => (
            <li key={domain} className={`flex gap-3 ${justifiedText}`}>
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-[#0033ad]" />
              <span>{domain}</span>
            </li>
          ))}
        </ul>
        <Prose>{dictionary.program.domainsNote}</Prose>
      </section>

      <section className="mt-16" aria-labelledby="guide-research">
        <h2 id="guide-research" className={headingClass}>
          {guide.researchTitle}
        </h2>
        <Prose>{guide.researchIntro}</Prose>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left">
            <caption className="sr-only">{guide.researchTitle}</caption>
            <thead>
              <tr className="border-b-2 border-[#0033ad]">
                <th scope="col" className="w-12 py-3 pr-3 text-[0.9375rem] font-semibold text-[#0033ad]">
                  #
                </th>
                <th scope="col" className="py-3 pr-4 text-[0.9375rem] font-semibold text-[#1b2430]">
                  Question
                </th>
                <th scope="col" className="py-3 text-[0.9375rem] font-semibold text-[#1b2430]">
                  {focusCol}
                </th>
              </tr>
            </thead>
            <tbody>
              {guide.questions.map((question, index) => (
                <tr key={question.title} className="border-b border-[#d5dce6] align-top">
                  <td className="py-4 pr-3 font-semibold tabular-nums text-[#0033ad]">{index + 1}</td>
                  <td className="py-4 pr-4 font-semibold text-[#1b2430]">{question.title}</td>
                  <td className={`py-4 ${justifiedText}`}>{question.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Prose>{guide.researchClose}</Prose>
      </section>

      <section className="mt-16" aria-labelledby="guide-deliverable">
        <h2 id="guide-deliverable" className={headingClass}>
          {guide.deliverableTitle}
        </h2>
        <StripeList items={guide.deliverable} />
      </section>

      <section className="mt-16" aria-labelledby="guide-ethics">
        <h2 id="guide-ethics" className={headingClass}>
          {guide.ethicsTitle}
        </h2>
        <Prose>{guide.ethicsIntro}</Prose>
        <StripeList items={guide.ethics} />
        <Prose>{guide.ethicsClose}</Prose>
      </section>

      <section className="mt-16" aria-labelledby="guide-workshop">
        <h2 id="guide-workshop" className={headingClass}>
          {guide.workshopTitle}
        </h2>
        <StripeList items={guide.workshop} />
      </section>

      <section className="mt-16" aria-labelledby="guide-rewards">
        <h2 id="guide-rewards" className={headingClass}>
          {guide.rewardsTitle}
        </h2>
        <StripeList items={guide.rewards} />
      </section>
    </>
  );
}
