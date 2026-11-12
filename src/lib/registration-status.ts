import type { RoadmapStatus } from "@/lib/program-roadmap";

export type RegistrationPublicState = "upcoming" | "open" | "closed";

export type RegistrationAvailability = {
  sessionsOpen: boolean;
  workshopOpen: boolean;
  teamsOpen: boolean;
  sessionsStatus: RoadmapStatus;
  workshopStatus: RoadmapStatus;
  teamsStatus: RoadmapStatus;
};

export function publicRegistrationState(status: RoadmapStatus): RegistrationPublicState {
  if (status === "open") {
    return "open";
  }

  if (status === "closed" || status === "done") {
    return "closed";
  }

  return "upcoming";
}
