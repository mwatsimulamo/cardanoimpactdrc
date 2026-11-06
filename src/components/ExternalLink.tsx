import { textLink } from "@/components/classes";

const forumUrl = "https://forum.cardano.org/";

export function ExternalLink({
  href = forumUrl,
  newTabLabel,
  children,
}: {
  href?: string;
  newTabLabel: string;
  children?: string;
}) {
  return (
    <a
      className={textLink}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children ?? href}
      <span className="sr-only"> ({newTabLabel})</span>
    </a>
  );
}

export { forumUrl };
