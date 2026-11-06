import { justifiedText } from "@/components/classes";
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
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <li key={item.id} className="border border-line bg-canvas">
          <OriginalImage src={item.src} alt={item.description} className="aspect-[4/3] w-full object-cover" />
          <p className={`px-4 py-3 ${justifiedText}`}>{item.description}</p>
        </li>
      ))}
    </ul>
  );
}
