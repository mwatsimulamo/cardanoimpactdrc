import { textLink } from "@/components/classes";

export function ContactChannels({
  email,
  emailHref,
  xLabel,
  xHref,
  whatsappLabel,
  whatsappHref,
  newTabLabel,
  tone,
}: {
  email: string;
  emailHref: string;
  xLabel: string;
  xHref: string;
  whatsappLabel: string;
  whatsappHref: string | null;
  newTabLabel: string;
  tone: "footer" | "page";
}) {
  const linkClass =
    tone === "footer"
      ? "inline-flex min-h-12 items-center gap-3 text-base text-white underline decoration-white/70 underline-offset-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      : `inline-flex min-h-12 items-center gap-3 text-base ${textLink}`;
  const iconClass = tone === "footer" ? "size-5 shrink-0 text-white" : "size-5 shrink-0 text-brand";

  return (
    <ul className={tone === "footer" ? "mt-3 flex flex-col" : "flex flex-col gap-1 md:flex-row md:flex-wrap md:gap-x-10"}>
      <li>
        <a className={`${linkClass} break-all`} href={emailHref}>
          {email}
        </a>
      </li>
      <li>
        <a className={linkClass} href={xHref} target="_blank" rel="noopener noreferrer">
          <XIcon className={iconClass} />
          {xLabel}
          <span className="sr-only"> ({newTabLabel})</span>
        </a>
      </li>
      {whatsappHref ? (
        <li>
          <a className={linkClass} href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className={iconClass} />
            {whatsappLabel}
            <span className="sr-only"> ({newTabLabel})</span>
          </a>
        </li>
      ) : null}
    </ul>
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
