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
 * Couleurs de statut pour le calendrier d'accueil :
 * marqueur, pastille et fond de case.
 */
export const statusTone: Record<
  RoadmapStatus,
  { mark: string; card: string; ink: string; paintsCard: boolean }
> = {
  upcoming: {
    mark: "#8ea3c4",
    card: "rgb(18 36 74 / 55%)",
    ink: "#c5d0e2",
    paintsCard: false,
  },
  open: {
    mark: "#3dcf8e",
    card: "rgb(10 48 34 / 72%)",
    ink: "#b6ecd4",
    paintsCard: true,
  },
  current: {
    mark: "#5b8cff",
    card: "rgb(0 51 173 / 48%)",
    ink: "#b7cdff",
    paintsCard: true,
  },
  done: {
    mark: "#6ec9a8",
    card: "rgb(10 48 34 / 48%)",
    ink: "#b6ecd4",
    paintsCard: true,
  },
  closed: {
    mark: "#9aa8bd",
    card: "rgb(18 36 74 / 78%)",
    ink: "#c5d0e2",
    paintsCard: true,
  },
  postponed: {
    mark: "#f6d48a",
    card: "rgb(58 38 8 / 70%)",
    ink: "#f6d48a",
    paintsCard: true,
  },
};

export const legendStatuses: readonly RoadmapStatus[] = [
  "upcoming",
  "open",
  "current",
  "done",
  "closed",
  "postponed",
];

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

/**
 * Avancement public = somme des étapes selon le statut admin.
 * Terminé / clôturé = 1, ouvert / en cours = 0,55, à venir / reporté = 0.
 * Ne suppose pas un ordre strict : suit ce que l'admin enregistre.
 */
export function progressRatio(phases: readonly { status: RoadmapStatus }[]): number {
  if (phases.length === 0) {
    return 0;
  }

  let score = 0;
  for (const phase of phases) {
    if (isStageFilled(phase.status)) {
      score += 1;
      continue;
    }

    if (isStageActive(phase.status)) {
      score += 0.55;
    }
  }

  return Math.min(1, score / phases.length);
}

/** Fenêtre officielle D-42 affichée sur l'accueil. */
export const programCalendarSpan = {
  start: "2026-11-13",
  end: "2026-12-18",
} as const;

function civilUtc(value: string): number {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/** Nombre de jours inclus entre deux dates civiles YYYY-MM-DD. */
export function inclusiveDayCount(start: string, end: string): number {
  return Math.max(1, Math.round((civilUtc(end) - civilUtc(start)) / 86_400_000) + 1);
}

/**
 * Position de l'étape dans la barre du calendrier global
 * (du 13 novembre au 18 décembre 2026).
 */
export function phaseWindowRatio(
  start: string,
  end: string,
): { offset: number; width: number } {
  const total = inclusiveDayCount(programCalendarSpan.start, programCalendarSpan.end);
  const offsetDays = Math.max(0, inclusiveDayCount(programCalendarSpan.start, start) - 1);
  const length = inclusiveDayCount(start, end);
  return {
    offset: Math.min(1, offsetDays / total),
    width: Math.min(1 - offsetDays / total, length / total),
  };
}
