"use client";

import { useEffect, useLayoutEffect } from "react";

function scrollToTarget(focusId: string) {
  const hash = window.location.hash.slice(1);
  const hashNode = hash ? document.getElementById(hash) : null;
  const node = hashNode ?? document.getElementById(focusId);
  node?.scrollIntoView({ block: "start" });
}

export function MenuSectionScroll({ focusId }: { focusId: string }) {
  useLayoutEffect(() => {
    scrollToTarget(focusId);
  }, [focusId]);

  useEffect(() => {
    const run = () => scrollToTarget(focusId);
    run();
    const frame = requestAnimationFrame(run);
    const later = window.setTimeout(run, 50);
    window.addEventListener("hashchange", run);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(later);
      window.removeEventListener("hashchange", run);
    };
  }, [focusId]);

  return null;
}
