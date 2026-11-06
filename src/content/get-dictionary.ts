import { en } from "@/content/en";
import { fr } from "@/content/fr";
import type { Dictionary } from "@/content/types";
import { isLocale, type Locale } from "@/lib/locales";
import { notFound } from "next/navigation";

const dictionaries: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: string): Dictionary {
  if (!isLocale(locale)) {
    notFound();
  }

  return dictionaries[locale];
}
