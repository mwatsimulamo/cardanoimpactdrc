import { OriginalImage } from "@/components/OriginalImage";
import { justifiedText, sectionTitle, supportText } from "@/components/classes";
import { ExternalLink } from "@/components/ExternalLink";
import type { PublicActivitySpeaker } from "@/lib/documented-activities";

export function ActivitySpeakers({
  title,
  speakers,
  profileLabel,
  biographyMissing,
  newTabLabel,
}: {
  title: string;
  speakers: readonly PublicActivitySpeaker[];
  profileLabel: string;
  biographyMissing: string;
  newTabLabel: string;
}) {
  if (speakers.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className={sectionTitle}>{title}</h2>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {speakers.map((speaker) => {
          const role = speaker.role || speaker.title;
          return (
            <li key={speaker.id} className="border border-line bg-canvas p-5">
              <div className="flex gap-4">
                {speaker.portraitSrc ? (
                  <OriginalImage
                    src={speaker.portraitSrc}
                    alt={speaker.portraitAlt}
                    className="size-20 shrink-0 object-contain"
                  />
                ) : null}
                <div>
                  <h3 className="text-[1.25rem] font-semibold leading-[1.35] text-ink">{speaker.fullName}</h3>
                  {role ? <p className={`mt-1 ${supportText}`}>{role}</p> : null}
                  {speaker.organization ? <p className={`mt-1 ${supportText}`}>{speaker.organization}</p> : null}
                </div>
              </div>
              {speaker.biography ? (
                <p className={`mt-4 whitespace-pre-wrap ${justifiedText}`}>{speaker.biography}</p>
              ) : null}
              {speaker.biographyUnavailable ? (
                <p className={`mt-4 ${justifiedText}`}>{biographyMissing}</p>
              ) : null}
              {speaker.profileUrl ? (
                <p className="mt-4">
                  <ExternalLink href={speaker.profileUrl} newTabLabel={newTabLabel}>
                    {profileLabel}
                  </ExternalLink>
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
