import { justifiedText, supportText } from "@/components/classes";
import { OriginalImage } from "@/components/OriginalImage";
import { StatusMessage } from "@/components/StatusMessage";
import type { Dictionary } from "@/content/types";

export type PublicGalleryItem = {
  id: string;
  src: string;
  description: string;
};

export function PublicGallery({
  dictionary,
  items = [],
  status = "ready",
}: {
  dictionary: Dictionary;
  items?: readonly PublicGalleryItem[];
  status?: "loading" | "error" | "ready";
}) {
  const copy = dictionary.gallery;

  if (status === "loading") {
    return (
      <div className="mt-8">
        <StatusMessage>{copy.loading}</StatusMessage>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-8">
        <StatusMessage tone="danger">{copy.error}</StatusMessage>
      </div>
    );
  }

  if (items.length === 0) {
    return <p className={`mt-8 ${justifiedText}`}>{copy.empty}</p>;
  }

  return (
    <div className="mt-8">
      <p className={`mb-4 ${supportText}`}>{copy.hoverHint}</p>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <figure className="group relative overflow-hidden">
              <OriginalImage
                src={item.src}
                alt={item.description}
                className="aspect-[4/3] w-full object-cover"
              />
              {item.description.trim() ? (
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-brand-pressed/85 px-4 py-3 text-[0.9375rem] leading-[1.5] text-ink opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                  {item.description}
                </figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
