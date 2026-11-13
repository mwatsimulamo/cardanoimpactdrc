import { existsSync } from "node:fs";
import path from "node:path";
import { blockTitle, justifiedText, sectionLede, sectionTitle, supportText, textLink } from "@/components/classes";
import { OriginalImage } from "@/components/OriginalImage";
import { ContactChannels } from "@/components/ContactChannels";
import type { Dictionary } from "@/content/types";
import {
  organizerBiography,
  organizerEmailHref,
  organizerPortraits,
  organizerProfileUrl,
  publishedOrganizers,
  type OrganizerPortrait,
} from "@/lib/organizer-team";
import { getWhatsappInvitationUrl, organizerEmail, organizerXUrl } from "@/lib/public-contact";
import type { Locale } from "@/lib/locales";

export function OrganizerContact({
  locale,
  dictionary,
  intro,
  channels = true,
  featureCards = false,
}: {
  locale: Locale;
  dictionary: Dictionary;
  intro?: string;
  channels?: boolean;
  featureCards?: boolean;
}) {
  return (
    <OrganizerContactLive
      locale={locale}
      dictionary={dictionary}
      intro={intro}
      channels={channels}
      featureCards={featureCards}
    />
  );
}

function OrganizerContactLive({
  locale,
  dictionary,
  intro,
  channels = true,
  featureCards = false,
}: {
  locale: Locale;
  dictionary: Dictionary;
  intro?: string;
  channels?: boolean;
  featureCards?: boolean;
}) {
  const people = publishedOrganizers();
  const portraits = organizerPortraits.map((person) => ({
    ...person,
    imageSrc: portraitOnDisk(person.imageSrc),
  }));

  return (
    <section className="mt-16 md:mt-24" aria-labelledby="organizer-contact">
      <h2 id="organizer-contact" className={`${sectionTitle} scroll-mt-28 text-center`}>
        {dictionary.reach.title}
      </h2>
      {intro ? <p className={`mt-4 ${sectionLede}`}>{intro}</p> : null}
      {people.length > 0 ? (
        <p className={`mt-3 ${sectionLede}`}>{dictionary.reach.lede}</p>
      ) : portraits.length === 0 ? (
        <p className={`mt-3 ${sectionLede}`}>{dictionary.reach.unpublished}</p>
      ) : null}
      {people.length > 0 ? (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {people.map((person) => {
            const biography = organizerBiography(person, locale);
            const emailHref = organizerEmailHref(person.email);
            const profileHref = organizerProfileUrl(person.xUrl);
            return (
              <li key={person.id} className="bg-canvas px-5 py-6 md:px-6">
                <h3 className={blockTitle}>{person.name}</h3>
                <p className={`mt-3 ${justifiedText}`}>
                  {biography ?? dictionary.activities.biographyMissing}
                </p>
                {emailHref || profileHref ? (
                  <ul className="mt-4">
                    {emailHref && person.email ? (
                      <li>
                        <a className={`${textLink} break-all`} href={emailHref}>
                          {person.email}
                        </a>
                      </li>
                    ) : null}
                    {profileHref ? (
                      <li className="mt-2">
                        <a
                          className={textLink}
                          href={profileHref}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {dictionary.activities.profile}
                          <span className="sr-only"> ({dictionary.links.opensNewTab})</span>
                        </a>
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <p className={`mt-4 ${supportText}`}>{dictionary.contact.empty}</p>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
      {channels ? (
        <div className="mt-6">
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
      ) : null}
      {portraits.length > 0 ? (
        <ul className={featureCards ? "mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-3" : "mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"}>
          {portraits.map((person) => (
            <li key={person.id} className="flex h-full flex-col text-center">
              <PortraitPhoto person={person} dictionary={dictionary} />
              <div className="mt-4 min-h-24">
                <h3 className={blockTitle}>{person.name}</h3>
                <p className={`mt-1 ${supportText}`}>{person.role[locale]}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function portraitOnDisk(src: string | null): string | null {
  if (src === null || !src.startsWith("/equipe/")) {
    return src;
  }

  const file = path.join(process.cwd(), "public", src);
  return existsSync(file) ? src : null;
}

function PortraitPhoto({
  person,
  dictionary,
}: {
  person: OrganizerPortrait;
  dictionary: Dictionary;
}) {
  const xHref = organizerProfileUrl(person.xUrl);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl bg-surface">
      {person.imageSrc ? (
        <OriginalImage src={person.imageSrc} alt="" className="h-full w-full object-contain" />
      ) : null}
      {person.imageSrc && xHref ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-brand-pressed/80 px-3 py-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          <a
            className="pointer-events-auto inline-flex items-center gap-2 text-[0.875rem] font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            href={xHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{dictionary.reach.contactOn}</span>
            <XIcon />
            <span className="sr-only">
              X {person.name} ({dictionary.links.opensNewTab})
            </span>
          </a>
        </div>
      ) : null}
    </div>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        fill="currentColor"
        d="M14.7 3h3.1l-6.8 7.8L19 21h-5.2l-4.1-6-4.7 6H1.9l7.3-8.3L1.4 3h5.3l3.7 5.5L14.7 3Zm-1.1 16.2h1.7L6.5 4.7H4.7l8.9 14.5Z"
      />
    </svg>
  );
}
