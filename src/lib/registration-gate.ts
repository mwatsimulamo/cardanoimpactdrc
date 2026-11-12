import "server-only";

import {
  isRegistrationOpen,
  type PhaseKey,
  type RoadmapStatus,
} from "@/lib/program-roadmap";
import { readPublishedRoadmap } from "@/lib/published-records";
import type { RegistrationAvailability } from "@/lib/registration-status";

export type { RegistrationAvailability, RegistrationPublicState } from "@/lib/registration-status";
export { publicRegistrationState } from "@/lib/registration-status";
export { civilDateInGoma } from "@/lib/goma-date";

export type RegistrationGate = "open" | "closed";

function statusOf(
  phases: readonly { key: PhaseKey; status: RoadmapStatus }[],
  key: PhaseKey,
): RoadmapStatus {
  return phases.find((phase) => phase.key === key)?.status ?? "upcoming";
}

/**
 * Source unique : `program_phases` via le calendrier publié.
 * Un formulaire n'est accessible que si l'admin a posé le statut « open ».
 */
export async function readRegistrationAvailability(): Promise<RegistrationAvailability> {
  const roadmap = await readPublishedRoadmap();
  const sessionsStatus = statusOf(roadmap.phases, "sessions_signup");
  const workshopStatus = statusOf(roadmap.phases, "workshop_signup");
  const teamsStatus = statusOf(roadmap.phases, "teams");

  return {
    sessionsStatus,
    workshopStatus,
    teamsStatus,
    sessionsOpen: isRegistrationOpen(sessionsStatus),
    workshopOpen: isRegistrationOpen(workshopStatus),
    teamsOpen: isRegistrationOpen(teamsStatus),
  };
}

export async function teamRegistrationGate(): Promise<RegistrationGate> {
  const availability = await readRegistrationAvailability();
  return availability.teamsOpen ? "open" : "closed";
}
