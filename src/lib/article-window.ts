import { civilDateInGoma } from "@/lib/goma-date";

export const ARTICLE_OPENS_ON = "2026-12-06";
export const ARTICLE_CLOSES_ON = "2026-12-15";

/** Ouvert pour tester la soumission avant la fenêtre officielle. */
export const ARTICLE_SUBMISSIONS_ACCEPTED = true;

export type ArticleWindow = "open" | "closed";

export function articleWindow(now?: Date): ArticleWindow {
  if (ARTICLE_SUBMISSIONS_ACCEPTED) {
    return "open";
  }

  const day = civilDateInGoma(now ?? new Date());
  if (day < ARTICLE_OPENS_ON || day > ARTICLE_CLOSES_ON) {
    return "closed";
  }

  return "open";
}
