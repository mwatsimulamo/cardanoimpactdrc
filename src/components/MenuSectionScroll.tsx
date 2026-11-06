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
    scrollToTarget(focusId);
    const frame = requestAnimationFrame(() => scrollToTarget(focusId));
    const later = window.setTimeout(() => scrollToTarget(focusId), 50);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(later);
    };
  }, [focusId]);

  return null;
}
