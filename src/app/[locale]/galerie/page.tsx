import type { Metadata } from "next";
import { Suspense } from "react";
import { PageFrame, PageHeader } from "@/components/PageHeader";
import { PublicGallery } from "@/components/PublicGallery";
import { listGalleryItems } from "@/lib/editorial-store";
import { getDictionary } from "@/content/get-dictionary";
import type { Dictionary } from "@/content/types";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/galerie">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.gallery.title, dictionary.meta.siteName, locale, "galerie");
}

export default async function GalleryPage({ params }: PageProps<"/[locale]/galerie">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);

  return (
    <PageFrame>
      <PageHeader title={dictionary.gallery.title} lede={dictionary.gallery.lede} />
      <Suspense fallback={<PublicGallery dictionary={dictionary} status="loading" />}>
        <PublishedGallery dictionary={dictionary} />
      </Suspense>
    </PageFrame>
  );
}

async function PublishedGallery({ dictionary }: { dictionary: Dictionary }) {
  const records = await listGalleryItems();
  const items =
    records === "missing" || records === "error"
      ? []
      : records
          .filter((item) => item.status === "published" && item.hasImage && item.description.trim().length > 0)
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
          .map((item) => ({
            id: item.id,
            src: `/media/gallery/${item.id}?v=${encodeURIComponent(item.updatedAt)}`,
            description: item.description,
          }));

  return <PublicGallery dictionary={dictionary} items={items} status={records === "error" ? "error" : "ready"} />;
}
