export const locales = ["fr", "en"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return value === "fr" || value === "en";
}

export function localePath(locale: Locale, segment = ""): string {
  return segment.length > 0 ? `/${locale}/${segment}` : `/${locale}`;
}

export const publicSegments = [
  "programme",
  "calendrier",
  "concours",
  "equipes",
  "evaluations",
  "inscription",
  "annonces",
  "activites",
  "resultats",
  "faq",
  "contact",
  "feuille-de-route",
  "galerie",
  "equipe",
  "admin",
] as const;
