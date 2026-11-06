/** Coordonnées publiques approuvées par D-32. */
export const organizerEmail = "mwatsimulamoolivier@gmail.com";

export const organizerXUrl = "https://x.com/OlivierMWATSIM1";

/** Invitation officielle fournie par l'organisateur. Remplaçable ici. */
export const whatsappInvitationUrl: string | null = "https://chat.whatsapp.com/BqgI2xN2EDNI34a06TsNTZ";

export function getWhatsappInvitationUrl(): string | null {
  const value = whatsappInvitationUrl?.trim() ?? "";
  if (!value.startsWith("https://") || value.includes(" ")) {
    return null;
  }

  return value;
}
