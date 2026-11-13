import Link from "next/link";
import { OriginalImage } from "@/components/OriginalImage";
import { blockTitle, justifiedText } from "@/components/classes";

export function EditorialCard({
  href,
  title,
  badge,
  imageSrc,
  imageAlt = "",
}: {
  href: string;
  title: string;
  badge: string;
  imageSrc?: string | null;
  imageAlt?: string;
  /** Conservé pour compatibilité des appels ; non affiché sur la carte. */
  excerpt?: string;
  meta?: string;
  cta?: string;
}) {
  return (
    <article className="group flex h-full min-h-full flex-col overflow-hidden rounded-xl bg-canvas transition-colors duration-150 hover:bg-surface focus-within:bg-surface">
      <Link
        href={href}
        className="flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-surface">
          {imageSrc ? (
            <>
              <OriginalImage
                src={imageSrc}
                alt={imageAlt}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-brand-pressed/30" aria-hidden="true" />
            </>
          ) : (
            <div className="absolute inset-0 bg-action/70" aria-hidden="true" />
          )}
          <span className="absolute left-3 top-3 bg-action px-2.5 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-white">
            {badge}
          </span>
        </div>
        <div className="flex flex-1 flex-col px-5 py-5 md:px-6">
          <h3 className={`line-clamp-3 ${blockTitle}`}>{title}</h3>
        </div>
      </Link>
    </article>
  );
}

export function EditorialEmptyCard({
  badge,
  title,
  body,
}: {
  badge: string;
  title: string;
  body: string;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl bg-canvas">
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-surface">
        <div className="absolute inset-0 bg-action/50" aria-hidden="true" />
        <span className="absolute left-3 top-3 bg-canvas/90 px-2.5 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-muted">
          {badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5 py-5 md:px-6">
        <h3 className={`line-clamp-3 ${blockTitle}`}>{title}</h3>
        <p className={`mt-3 line-clamp-3 ${justifiedText}`}>{body}</p>
      </div>
    </article>
  );
}
