import type { Locale } from "@/lib/locales";

export const phaseKeys = [
  "launch",
  "training",
  "teams",
  "competition",
  "jury",
  "workshop",
] as const;

export type PhaseKey = (typeof phaseKeys)[number];

export type RoadmapStatus = "upcoming" | "current" | "done" | "postponed";

export type PublishedRoadmapPhase = {
  key: PhaseKey;
  plannedStart: string;
  plannedEnd: string;
  status: RoadmapStatus;
  actualStart: string | null;
  actualEnd: string | null;
  supplement: Record<Locale, string>;
  report: Record<Locale, string>;
};

const planned: Record<PhaseKey, { start: string; end: string }> = {
  launch: { start: "2026-11-09", end: "2026-11-21" },
  training: { start: "2026-11-23", end: "2026-11-24" },
  teams: { start: "2026-11-25", end: "2026-11-29" },
  competition: { start: "2026-11-30", end: "2026-12-13" },
  jury: { start: "2026-12-14", end: "2026-12-17" },
  workshop: { start: "2026-12-18", end: "2026-12-18" },
};

/**
 * Source unique des statuts publics (accueil, calendrier, feuille de route,
 * tableau de bord admin). Les statuts ne changent qu'après validation
 * organisateur. Ils ne se déduisent pas de la date. Tant qu'aucune étape
 * n'est validée, toutes restent à venir. Les dates prévues restent D-30.
 */
export function listPublishedRoadmap(): readonly PublishedRoadmapPhase[] {
  return phaseKeys.map((key) => ({
    key,
    plannedStart: planned[key].start,
    plannedEnd: planned[key].end,
    status: "upcoming",
    actualStart: null,
    actualEnd: null,
    supplement: { fr: "", en: "" },
    report: { fr: "", en: "" },
  }));
}
