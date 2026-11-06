"use client";

import { useEffect, useId, useRef, useState } from "react";
import { OriginalImage } from "@/components/OriginalImage";
import type { PublicActivityImage } from "@/lib/documented-activities";

export function ActivityGallery({
  title,
  images,
  enlargeLabel,
  closeLabel,
  previousLabel,
  nextLabel,
}: {
  title: string;
  images: readonly PublicActivityImage[];
  enlargeLabel: string;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [index, setIndex] = useState(0);
  const [request, setRequest] = useState(0);
  const active = images[index] ?? images[0];

  useEffect(() => {
    if (request === 0) {
      return;
    }

    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [request]);

  if (images.length === 0 || !active) {
    return null;
  }

  function openAt(nextIndex: number) {
    setIndex(nextIndex);
    setRequest((current) => current + 1);
  }

  function move(step: number) {
    setIndex((current) => (current + step + images.length) % images.length);
  }

  return (
    <section className="mt-12" aria-labelledby={titleId}>
      <h2 id={titleId} className="text-[1.5rem] font-semibold leading-[1.25] text-ink md:text-[1.75rem]">
        {title}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image, imageIndex) => (
          <li key={image.id} className="border border-line bg-canvas">
            <button
              type="button"
              className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              onClick={() => openAt(imageIndex)}
            >
              <OriginalImage src={image.src} alt={image.alt} className="aspect-[4/3] w-full object-contain" />
              <span className="sr-only">{enlargeLabel}</span>
              {image.caption ? (
                <span className="block px-4 py-3 text-[0.9375rem] leading-[1.5] text-muted">
                  {image.caption}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialogRef}
        className="w-[min(72rem,calc(100%-2rem))] border border-line bg-canvas p-4 text-ink backdrop:bg-[#050b1f]/80"
        aria-labelledby={`${titleId}-viewer`}
        onClose={() => setIndex(0)}
      >
        <div className="flex items-center justify-between gap-4">
          <p id={`${titleId}-viewer`} className="text-base font-semibold">
            {active.caption || active.alt}
          </p>
          <button
            type="button"
            className="min-h-11 px-3 text-[0.9375rem] font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => dialogRef.current?.close()}
          >
            {closeLabel}
          </button>
        </div>
        <OriginalImage src={active.src} alt={active.alt} className="mt-4 max-h-[70vh] w-full object-contain" />
        {images.length > 1 ? (
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="min-h-11 border border-line px-4 text-[0.9375rem] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              onClick={() => move(-1)}
            >
              {previousLabel}
            </button>
            <button
              type="button"
              className="min-h-11 border border-line px-4 text-[0.9375rem] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              onClick={() => move(1)}
            >
              {nextLabel}
            </button>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
