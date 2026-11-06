import Link from "next/link";
import { Suspense } from "react";
import { justifiedText, supportText, textLink } from "@/components/classes";
import { ContactChannels } from "@/components/ContactChannels";
import { MenuSectionScroll } from "@/components/MenuSectionScroll";
import { PageFrame, PageHeader } from "@/components/PageHeader";
import { getDictionary } from "@/content/get-dictionary";
import { localePath, type Locale } from "@/lib/locales";
import { getWhatsappInvitationUrl, organizerEmail, organizerXUrl } from "@/lib/public-contact";
import { readPublishedAnnouncements } from "@/lib/published-records";

const sectionBreak = "mt-20 md:mt-28";

export function InformationDocument({
  locale,
  current,
}: {
  locale: Locale;
  current: "annonces" | "contact";
}) {
  const dictionary = getDictionary(locale);
  const whatsappInvitationUrl = getWhatsappInvitationUrl();
  const focusId = `section-${current}`;

  return (
    <PageFrame>
      <MenuSectionScroll focusId={focusId} />
      <section aria-labelledby="section-annonces">
        <PageHeader
          id="section-annonces"
          level={current === "annonces" ? 1 : 2}
          title={dictionary.announcements.title}
          lede={dictionary.announcements.lede}
        />
        <Suspense fallback={<p className={`mt-8 ${justifiedText}`}>{dictionary.workspace.loading}</p>}>
          <PublishedAnnouncements locale={locale} dictionary={dictionary} />
        </Suspense>
      </section>

      <section className={sectionBreak} aria-labelledby="section-contact">
        <PageHeader
          id="section-contact"
          level={current === "contact" ? 1 : 2}
          title={dictionary.contact.title}
          lede={dictionary.contact.lede}
        />
        <div className="mt-8">
          <ContactChannels
            tone="page"
            email={organizerEmail}
            emailHref={`mailto:${organizerEmail}`}
            xLabel={dictionary.chrome.followX}
            xHref={organizerXUrl}
            whatsappLabel={dictionary.chrome.joinWhatsApp}
            whatsappHref={whatsappInvitationUrl}
            newTabLabel={dictionary.links.opensNewTab}
          />
        </div>
        {whatsappInvitationUrl ? null : (
          <p className={`mt-6 ${justifiedText}`}>{dictionary.contact.whatsappPending}</p>
        )}
      </section>
    </PageFrame>
  );
}

async function PublishedAnnouncements({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: ReturnType<typeof getDictionary>;
}) {
  const announcements = (await readPublishedAnnouncements()).filter(
    (item) => item.title[locale].trim().length > 0 && item.body[locale].trim().length > 0,
  );

  if (announcements.length === 0) {
    return <p className={`mt-8 ${justifiedText}`}>{dictionary.announcements.empty}</p>;
  }

  return (
    <ul className="mt-8 border border-line">
      {announcements.map((item) => (
        <li key={item.slug} className="border-b border-line px-5 py-5 last:border-b-0 md:px-8">
          <p className={supportText}>
            <time dateTime={item.publishedAt}>{formatDate(item.publishedAt, locale)}</time>
          </p>
          <Link
            className={`mt-2 inline-block text-[1.25rem] font-semibold leading-[1.35] md:text-[1.5rem] ${textLink}`}
            href={localePath(locale, `annonces/${item.slug}`)}
          >
            {item.title[locale]}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lubumbashi",
  }).format(new Date(value));
}
