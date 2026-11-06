const timeZone = "Africa/Lubumbashi";

/** La notice A-13 n'a pas encore de texte. */
export const PARTICIPANT_NOTICE_PUBLISHED = false;

/** Ouvert pour accepter les enregistrements d'équipes et les tester. */
export const REGISTRATION_SUBMISSIONS_ACCEPTED = true;

export const REGISTRATION_OPENS_ON = "2026-11-09";
export const REGISTRATION_CLOSES_ON = "2026-11-21";

export type RegistrationGate = "notice" | "window" | "open";

export function civilDateInGoma(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * L'envoi n'est ouvert que si la notice est publiée et si le jour civil
 * à Goma est compris entre le 9 et le 21 novembre 2026.
 */
export function registrationGate(now?: Date): RegistrationGate {
  if (REGISTRATION_SUBMISSIONS_ACCEPTED) {
    return "open";
  }

  if (!PARTICIPANT_NOTICE_PUBLISHED) {
    return "notice";
  }

  const day = civilDateInGoma(now ?? new Date());
  if (day < REGISTRATION_OPENS_ON || day > REGISTRATION_CLOSES_ON) {
    return "window";
  }

  return "open";
}
