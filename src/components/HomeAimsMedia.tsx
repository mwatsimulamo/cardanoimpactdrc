"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = ["/accueil/atelier-1.jpg", "/accueil/atelier-2.jpg", "/accueil/atelier-3.jpg"] as const;

export function HomeAimsMedia({ alt }: { alt: string }) {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="home-aims-media relative aspect-[16/10] w-full overflow-hidden bg-brand-pressed md:aspect-[2/1] lg:aspect-[16/11] lg:h-full lg:min-h-[18rem]">
      {slides.map((src, slideIndex) => {
        const active = slideIndex === index;
        return (
          <Image
            key={src}
            src={src}
            alt={active ? alt : ""}
            fill
            unoptimized
            sizes="(max-width: 1024px) 100vw, 55vw"
            className={`home-aims-slide absolute inset-0 h-full w-full object-cover ${active ? "is-active" : ""} ${reducedMotion ? "is-static" : ""}`}
            priority={slideIndex === 0}
          />
        );
      })}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-pressed/35 via-transparent to-transparent"
      />
    </div>
  );
}
