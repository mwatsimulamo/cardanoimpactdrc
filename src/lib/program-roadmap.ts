import type { Locale } from "@/lib/locales";

export const phaseKeys = [
  "sessions_signup",
  "training",
  "workshop_signup",
  "teams",
  "competition",
  "jury",
  "closing",
] as const;

export type PhaseKey = (typeof phaseKeys)[number];

export type RoadmapStatus = "upcoming" | "open" | "current" | "done" | "closed" | "postponed";

export const registrationPhaseKeys = ["sessions_signup", "workshop_signup", "teams"] as const;

export type RegistrationPhaseKey = (typeof registrationPhaseKeys)[number];

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
  sessions_signup: { start: "2026-11-13", end: "2026-11-29" },
  training: { start: "2026-11-30", end: "2026-12-01" },
  workshop_signup: { start: "2026-11-30", end: "2026-12-17" },
  teams: { start: "2026-12-01", end: "2026-12-05" },
  competition: { start: "2026-12-06", end: "2026-12-15" },
  jury: { start: "2026-12-16", end: "2026-12-17" },
  closing: { start: "2026-12-18", end: "2026-12-18" },
};

/** Couleurs distinctes par étape, dans l'identité Cardano. */
export const phaseAccent: Record<PhaseKey, string> = {
  sessions_signup: "#5b8cff",
  training: "#3cc8c8",
  workshop_signup: "#7eb6ff",
  teams: "#b7cdff",
  competition: "#0033ad",
  jury: "#2454d6",
  closing: "#8eafff",
};

/**
 * Source unique des statuts publics (accueil, calendrier, feuille de route,
 * tableau de bord admin) et de l'ouverture des formulaires d'inscription.
 * Les statuts ne changent qu'après validation organisateur. Ils ne se
 * déduisent pas de la date. Tant qu'aucune étape n'est validée, toutes
 * restent à venir. Les dates prévues restent D-42.
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

export function isRegistrationPhase(key: PhaseKey): boolean {
  return (registrationPhaseKeys as readonly string[]).includes(key);
}

export function statusesForPhase(key: PhaseKey): readonly RoadmapStatus[] {
  if (isRegistrationPhase(key)) {
    return ["upcoming", "open", "closed", "done", "postponed"];
  }

  return ["upcoming", "current", "done", "postponed"];
}

/** Formulaire lié accessible uniquement lorsque l'admin a posé « Ouvert ». */
export function isRegistrationOpen(status: RoadmapStatus): boolean {
  return status === "open";
}

export function isStageFilled(status: RoadmapStatus): boolean {
  return status === "done" || status === "closed";
}

export function isStageActive(status: RoadmapStatus): boolean {
  return status === "open" || status === "current";
}

export function progressRatio(phases: readonly { status: RoadmapStatus }[]): number {
  if (phases.length === 0) {
    return 0;
  }

  let filled = 0;
  for (const phase of phases) {
    if (isStageFilled(phase.status)) {
      filled += 1;
      continue;
    }

    if (isStageActive(phase.status)) {
      filled += 0.55;
      break;
    }

    break;
  }

  return Math.min(1, filled / phases.length);
}
