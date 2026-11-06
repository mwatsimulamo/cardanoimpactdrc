import { existsSync } from "node:fs";
import path from "node:path";
import { blockTitle, justifiedText, sectionTitle, supportText, textLink } from "@/components/classes";
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
      <h2 id="organizer-contact" className={`${sectionTitle} scroll-mt-28`}>
        {dictionary.reach.title}
      </h2>
      {intro ? <p className={`mt-4 ${justifiedText}`}>{intro}</p> : null}
      {people.length > 0 ? (
        <p className={`mt-4 ${justifiedText}`}>{dictionary.reach.lede}</p>
      ) : portraits.length === 0 ? (
        <p className={`mt-4 ${justifiedText}`}>{dictionary.reach.unpublished}</p>
      ) : null}
      {people.length > 0 ? (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {people.map((person) => {
            const biography = organizerBiography(person, locale);
            const emailHref = organizerEmailHref(person.email);
            const profileHref = organizerProfileUrl(person.xUrl);
            return (
              <li key={person.id} className="border border-line bg-canvas px-5 py-6 md:px-6">
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
        <ul className={featureCards ? "mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"}>
          {portraits.map((person) =>
            featureCards ? (
              <li key={person.id} className="flex h-full flex-col border border-line bg-canvas">
                {person.imageSrc ? (
                  <OriginalImage src={person.imageSrc} alt="" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="aspect-[4/3] bg-surface" />
                )}
                <div className="flex flex-1 flex-col px-5 py-6 text-center md:px-6">
                  <h3 className={blockTitle}>{person.name}</h3>
                  <p className={`mt-2 ${supportText}`}>{person.role[locale]}</p>
                  <PortraitLinks person={person} dictionary={dictionary} className="mt-auto justify-center pt-6" />
                </div>
              </li>
            ) : (
              <li key={person.id} className="grid grid-cols-[4.25rem_minmax(0,1fr)] border border-line bg-canvas">
                {person.imageSrc ? (
                  <OriginalImage src={person.imageSrc} alt="" className="h-full min-h-24 w-full object-cover" />
                ) : (
                  <div className="min-h-24 bg-surface" />
                )}
                <div className="px-4 py-3">
                  <h3 className="text-base font-semibold leading-[1.35] text-ink">{person.name}</h3>
                  <p className={`mt-1 ${supportText}`}>{person.role[locale]}</p>
                  <PortraitLinks person={person} dictionary={dictionary} className="mt-3" />
                </div>
              </li>
            ),
          )}
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

function PortraitLinks({
  person,
  dictionary,
  className,
}: {
  person: OrganizerPortrait;
  dictionary: Dictionary;
  className: string;
}) {
  return (
    <div className={`flex flex-wrap gap-x-5 gap-y-2 ${className}`}>
      <ProfileLink
        label="X"
        href={organizerProfileUrl(person.xUrl)}
        name={person.name}
        newTab={dictionary.links.opensNewTab}
      />
      <ProfileLink
        label="LinkedIn"
        href={organizerProfileUrl(person.linkedInUrl)}
        name={person.name}
        newTab={dictionary.links.opensNewTab}
      />
    </div>
  );
}

function ProfileLink({
  label,
  href,
  name,
  newTab,
}: {
  label: string;
  href: string | null;
  name: string;
  newTab: string;
}) {
  if (!href) {
    return <span className={supportText}>{label}</span>;
  }

  return (
    <a className={textLink} href={href} target="_blank" rel="noopener noreferrer">
      {label}
      <span className="sr-only">
        {" "}
        {name} ({newTab})
      </span>
    </a>
  );
}
