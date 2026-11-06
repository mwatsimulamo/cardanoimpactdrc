import type { Metadata } from "next";

export function pageMetadata(pageTitle: string, siteName: string): Metadata {
  return {
    title: {
      absolute: `${pageTitle} — ${siteName}`,
    },
  };
}
