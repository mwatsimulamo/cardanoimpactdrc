import type { Locale } from "@/lib/locales";

export type OrganizerProfile = {
  id: string;
  name: string;
  biography: Record<Locale, string>;
  email: string | null;
  xUrl: string | null;
};

export type OrganizerPortrait = {
  id: string;
  name: string;
  role: Record<Locale, string>;
  /** Fichier dans `public/equipe`. Le site l'affiche seulement si le fichier est présent. */
  imageSrc: string | null;
  xUrl: string | null;
};

/**
 * Fiches publiées de l'équipe. Une fiche n'entre ici que lorsque le nom,
 * la biographie et les contacts ont été fournis. Le tableau reste vide
 * tant que cette liste n'existe pas.
 */
export const organizerTeam: readonly OrganizerProfile[] = [];

/**
 * Noms et rôles fournis pour l'accueil. Chaque photographie porte le nom
 * du fichier indiqué. Elle se dépose dans `public/equipe`.
 * L'administration ne saisit pas ces fiches. Seuls les profils X fournis
 * sont liés ; aucun LinkedIn n'est inventé.
 */
export const organizerPortraits: readonly OrganizerPortrait[] = [
  {
    id: "martin-musagara",
    name: "Martin Musagara",
    role: { fr: "Programmes", en: "Programs" },
    imageSrc: "/equipe/martin-musagara.png",
    xUrl: "https://x.com/martin_musagara",
  },
  {
    id: "olivier-mwatsimulamo",
    name: "Olivier Mwatsimulamo",
    role: { fr: "Tech Lead", en: "Tech Lead" },
    imageSrc: "/equipe/olivier-mwatsimulamo.jpg",
    xUrl: "https://x.com/OlivierMWATSIM1",
  },
  {
    id: "meschak",
    name: "8pro",
    role: { fr: "Formateur & jury", en: "Trainer & jury" },
    imageSrc: "/equipe/meschak.png",
    xUrl: "https://x.com/MakasiMechack",
  },
  {
    id: "boaz",
    name: "Boaz",
    role: { fr: "Formateur & jury", en: "Trainer & jury" },
    imageSrc: "/equipe/boaz.jpg",
    xUrl: "https://x.com/BoazB318",
  },
  {
    id: "paul",
    name: "Paul",
    role: { fr: "Formateur & jury", en: "Trainer & jury" },
    imageSrc: "/equipe/paul.jpg",
    xUrl: null,
  },
  {
    id: "rishi",
    name: "Rishi",
    role: { fr: "Logistique", en: "Logistics" },
    imageSrc: "/equipe/rishi.png",
    xUrl: "https://x.com/ORishimatabaro",
  },
];

export function publishedOrganizers(): readonly OrganizerProfile[] {
  return organizerTeam.filter((profile) => profile.name.trim().length > 0);
}

export function organizerBiography(profile: OrganizerProfile, locale: Locale): string | null {
  const text = profile.biography[locale].trim();
  return text.length > 0 ? text : null;
}

export function organizerEmailHref(email: string | null): string | null {
  if (email === null) {
    return null;
  }

  const value = email.trim();
  if (value.length === 0 || value.includes(" ") || !value.includes("@")) {
    return null;
  }

  return `mailto:${value}`;
}

export function organizerProfileUrl(url: string | null): string | null {
  if (url === null || !url.startsWith("https://") || url.includes(" ")) {
    return null;
  }

  return url;
}
