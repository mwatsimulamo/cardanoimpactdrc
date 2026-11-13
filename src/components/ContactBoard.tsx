import { NewsletterForm } from "@/components/NewsletterForm";
import { blockTitle, justifiedText, supportText } from "@/components/classes";
import type { Dictionary } from "@/content/types";
import type { Locale } from "@/lib/locales";
import { getWhatsappInvitationUrl, organizerEmail, organizerXUrl } from "@/lib/public-contact";

export function ContactBoard({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const whatsappHref = getWhatsappInvitationUrl();
  const channels = [
    {
      id: "email",
      href: `mailto:${organizerEmail}`,
      label: dictionary.contact.emailLabel,
      detail: organizerEmail,
      external: false,
      icon: <MailIcon className="size-5 shrink-0 text-brand" />,
    },
    {
      id: "whatsapp",
      href: whatsappHref,
      label: dictionary.contact.whatsappLabel,
      detail: dictionary.chrome.joinWhatsApp,
      external: true,
      icon: <WhatsAppIcon className="size-5 shrink-0 text-brand" />,
    },
    {
      id: "x",
      href: organizerXUrl,
      label: dictionary.contact.xLabel,
      detail: dictionary.chrome.followX,
      external: true,
      icon: <XIcon className="size-5 shrink-0 text-brand" />,
    },
  ] as const;

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:items-stretch">
      <section className="bg-canvas px-5 py-6 md:px-7 md:py-8" aria-labelledby="contact-channels">
        <h3 id="contact-channels" className={blockTitle}>
          {dictionary.contact.channelsTitle}
        </h3>
        <p className={`mt-2 ${justifiedText}`}>{dictionary.contact.channelsLede}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {channels.map((channel) => {
            if (!channel.href) {
              return (
                <li key={channel.id}>
                  <div className="flex h-full min-h-16 items-center gap-3 bg-surface px-4 py-4 text-ink">
                    {channel.icon}
                    <span>
                      <span className="block text-[0.9375rem] font-semibold">{channel.label}</span>
                      <span className={`mt-0.5 block ${supportText}`}>{dictionary.contact.whatsappPending}</span>
                    </span>
                  </div>
                </li>
              );
            }

            return (
              <li key={channel.id}>
                <a
                  href={channel.href}
                  className="flex h-full min-h-16 items-center gap-3 bg-surface px-4 py-4 text-ink transition-colors duration-150 hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  {...(channel.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {channel.icon}
                  <span className="min-w-0">
                    <span className="block text-[0.9375rem] font-semibold">{channel.label}</span>
                    <span className={`mt-0.5 block truncate ${supportText}`}>{channel.detail}</span>
                  </span>
                  {channel.external ? (
                    <span className="sr-only"> ({dictionary.links.opensNewTab})</span>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-canvas px-5 py-6 md:px-7 md:py-8" aria-labelledby="contact-newsletter">
        <h3 id="contact-newsletter" className={blockTitle}>
          {dictionary.newsletter.title}
        </h3>
        <p className={`mt-2 ${justifiedText}`}>{dictionary.newsletter.lede}</p>
        <div className="mt-6">
          <NewsletterForm locale={locale} copy={dictionary.newsletter} tone="page" />
        </div>
      </section>
    </div>
  );
}

function MailIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M3.5 5.5h17a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17V7a1.5 1.5 0 0 1 1.5-1.5Zm.7 2 7.1 5.1a1.2 1.2 0 0 0 1.4 0L19.8 7.5H4.2Zm15.3 1.7-5.7 4.1a3.2 3.2 0 0 1-3.6 0L4.5 9.2V16.5h15V9.2Z"
      />
    </svg>
  );
}

function XIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M14.7 3h3.1l-6.8 7.8L19 21h-5.2l-4.1-6-4.7 6H1.9l7.3-8.3L1.4 3h5.3l3.7 5.5L14.7 3Zm-1.1 16.2h1.7L6.5 4.7H4.7l8.9 14.5Z"
      />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12.1 3.2A8.7 8.7 0 0 0 4.6 16.3L3.4 20.6l4.4-1.2a8.7 8.7 0 0 0 4.3 1.1h.1a8.7 8.7 0 0 0 0-17.3Zm0 15.9h-.1a7.2 7.2 0 0 1-3.7-1l-.3-.2-2.6.7.7-2.5-.2-.3a7.2 7.2 0 1 1 6.2 3.3Zm4-5.4c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1l-.6.7c-.1.2-.3.2-.5.1a6 6 0 0 1-1.8-1.1 6.5 6.5 0 0 1-1.2-1.5c-.1-.2 0-.3.1-.5l.4-.4.1-.3c0-.1 0-.3-.1-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4 1.4.6 1.9.6 2.6.5.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1 0-.1-.2-.1-.4-.2Z"
      />
    </svg>
  );
}
