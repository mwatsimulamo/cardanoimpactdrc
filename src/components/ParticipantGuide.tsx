import { blockTitle, justifiedText, sectionTitle } from "@/components/classes";
import { ContactChannels } from "@/components/ContactChannels";
import { ExternalLink } from "@/components/ExternalLink";
import { SectionHeading } from "@/components/MenuBook";
import type { Dictionary } from "@/content/types";
import { localePath, type Locale } from "@/lib/locales";
import { getWhatsappInvitationUrl, organizerEmail, organizerXUrl } from "@/lib/public-contact";

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

function ProseList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-4">
      {items.map((item) => (
        <li key={item} className={`border border-line bg-surface px-4 py-3 ${justifiedText}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ParticipantGuide({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const guide = dictionary.guide;

  return (
    <>
        <section aria-labelledby="guide-overview">
          <SectionHeading
            id="guide-overview"
            href={localePath(locale, "concours")}
            title={guide.overviewTitle}
          />
          <p className={`mt-4 ${justifiedText}`}>{guide.lede}</p>
          <p className={`mt-4 ${justifiedText}`}>{guide.overview}</p>
        </section>
        <section className="mt-14" aria-labelledby="guide-forum">
          <h2 id="guide-forum" className={headingClass}>
            {guide.forumTitle}
          </h2>
          <div className="mt-4 space-y-4">
            <p className={justifiedText}>{guide.forumIntro}</p>
            <p className={justifiedText}>{guide.forumCanLead}</p>
            <ProseList items={guide.forumCan} />
            <p className={justifiedText}>
              {guide.forumAccess}{" "}
              <ExternalLink newTabLabel={dictionary.links.opensNewTab} />
            </p>
            <p className={justifiedText}>{guide.forumCompetition}</p>
            <p className={justifiedText}>
              <span className="font-semibold">{guide.forumAccountLabel}</span> {guide.forumAccount}
            </p>
            <p className={justifiedText}>{dictionary.competition.distinct}</p>
            <p className={justifiedText}>{dictionary.competition.condition}</p>
            <p className={justifiedText}>{dictionary.competition.introduction}</p>
            <p className={justifiedText}>{dictionary.competition.invitation}</p>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="guide-presentation">
          <h2 id="guide-presentation" className={headingClass}>
            {guide.presentationTitle}
          </h2>
          <div className="mt-4 space-y-4">
            {guide.presentation.map((paragraph) => (
              <p key={paragraph} className={justifiedText}>
                {paragraph}
              </p>
            ))}
            <p className={justifiedText}>{guide.notHackathon}</p>
            <p className={justifiedText}>{guide.independence}</p>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="guide-who">
          <h2 id="guide-who" className={headingClass}>
            {guide.whoTitle}
          </h2>
          <ProseList items={guide.who} />
        </section>

        <section className="mt-14" aria-labelledby="guide-domains">
          <h2 id="guide-domains" className={headingClass}>
            {dictionary.home.domainsTitle}
          </h2>
          <p className={`mt-4 ${justifiedText}`}>{dictionary.home.domainsIntro}</p>
          <ul className="mt-5 grid gap-x-10 gap-y-2 sm:grid-cols-2">
            {dictionary.home.domains.map((domain) => (
              <li key={domain} className={justifiedText}>
                {domain}
              </li>
            ))}
          </ul>
          <p className={`mt-5 ${justifiedText}`}>{dictionary.program.domainsNote}</p>
        </section>

        <section className="mt-14" aria-labelledby="guide-research">
          <h2 id="guide-research" className={headingClass}>
            {guide.researchTitle}
          </h2>
          <p className={`mt-4 ${justifiedText}`}>{guide.researchIntro}</p>
          <ol className="mt-8 space-y-8">
            {guide.questions.map((question, index) => (
              <li key={question.title} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3">
                <p className="pt-0.5 font-semibold text-brand tabular-nums">{index + 1}</p>
                <div>
                  <h3 className={blockTitle}>{question.title}</h3>
                  <p className={`mt-2 ${justifiedText}`}>{question.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className={`mt-8 ${justifiedText}`}>{guide.researchClose}</p>
        </section>

        <section className="mt-14" aria-labelledby="guide-deliverable">
          <h2 id="guide-deliverable" className={headingClass}>
            {guide.deliverableTitle}
          </h2>
          <ProseList items={guide.deliverable} />
        </section>

        <section className="mt-14" aria-labelledby="guide-ethics">
          <h2 id="guide-ethics" className={headingClass}>
            {guide.ethicsTitle}
          </h2>
          <p className={`mt-4 ${justifiedText}`}>{guide.ethicsIntro}</p>
          <ProseList items={guide.ethics} />
          <p className={`mt-5 ${justifiedText}`}>{guide.ethicsClose}</p>
        </section>

        <section className="mt-14" aria-labelledby="guide-workshop">
          <h2 id="guide-workshop" className={headingClass}>
            {guide.workshopTitle}
          </h2>
          <ProseList items={guide.workshop} />
        </section>

        <section className="mt-14" aria-labelledby="guide-rewards">
          <h2 id="guide-rewards" className={headingClass}>
            {guide.rewardsTitle}
          </h2>
          <ProseList items={guide.rewards} />
        </section>

        <div className="mt-14">
          <ContactChannels
            tone="page"
            email={organizerEmail}
            emailHref={`mailto:${organizerEmail}`}
            xLabel={dictionary.chrome.followX}
            xHref={organizerXUrl}
            whatsappLabel={dictionary.chrome.joinWhatsApp}
            whatsappHref={getWhatsappInvitationUrl()}
            newTabLabel={dictionary.links.opensNewTab}
          />
        </div>
    </>
  );
}
