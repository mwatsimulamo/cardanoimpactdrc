import type { Locale } from "@/lib/locales";

export type PublicationStatus = "draft" | "published" | "unpublished" | "scheduled";

export type PreviewAnnouncement = {
  id: string;
  slug: string;
  status: PublicationStatus;
  publishedAt: string;
  category: Record<Locale, string>;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  body: Record<Locale, string>;
  imageSrc: string | null;
  links: readonly { label: Record<Locale, string>; href: string }[];
};

export type PreviewActivity = {
  id: string;
  slug: string;
  status: PublicationStatus;
  kind: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  date: string;
  time: string | null;
  place: Record<Locale, string>;
  speakers: readonly string[];
};

export type PreviewAlbum = {
  id: string;
  title: Record<Locale, string>;
  status: PublicationStatus;
  date: string;
  description: Record<Locale, string>;
  images: readonly {
    id: string;
    caption: Record<Locale, string>;
    alt: Record<Locale, string>;
    src: string | null;
  }[];
};

export type PreviewFaq = {
  id: string;
  status: PublicationStatus;
  question: Record<Locale, string>;
  answer: Record<Locale, string>;
};

export type PreviewMediaItem = {
  id: string;
  kind: "image" | "document" | "video";
  title: string;
  category: string;
};

export type PreviewHistoryItem = {
  id: string;
  at: string;
  action: Record<Locale, string>;
  subject: Record<Locale, string>;
};

export const previewAnnouncements: readonly PreviewAnnouncement[] = [
  {
    id: "preview-notice",
    slug: "apercu-notice",
    status: "draft",
    publishedAt: "2026-11-09",
    category: { fr: "Organisation", en: "Organization" },
    title: {
      fr: "Exemple d'annonce (aperçu)",
      en: "Sample announcement (preview)",
    },
    summary: {
      fr: "Ceci n'est pas une annonce publiée.",
      en: "This is not a published announcement.",
    },
    body: {
      fr: "Texte d'exemple pour préparer l'interface. Aucune publication réelle.",
      en: "Sample text to prepare the interface. No real publication.",
    },
    imageSrc: null,
    links: [],
  },
];

export const previewActivities: readonly PreviewActivity[] = [
  {
    id: "preview-session",
    slug: "apercu-session",
    status: "draft",
    kind: "online_training",
    title: {
      fr: "Exemple d'activité (aperçu)",
      en: "Sample activity (preview)",
    },
    description: {
      fr: "Fiche d'exemple. Ce n'est pas une activité tenue.",
      en: "Sample record. This is not a held activity.",
    },
    date: "2026-11-23",
    time: null,
    place: { fr: "En ligne", en: "Online" },
    speakers: [],
  },
];

export const previewAlbums: readonly PreviewAlbum[] = [
  {
    id: "preview-album",
    title: { fr: "Album d'exemple", en: "Sample album" },
    status: "draft",
    date: "2026-11-23",
    description: {
      fr: "Aucun original n'est affiché. Les photographies réelles restent à fournir.",
      en: "No original is shown. Real photographs remain to be provided.",
    },
    images: [
      {
        id: "preview-img-1",
        caption: { fr: "Emplacement photo", en: "Photo placeholder" },
        alt: { fr: "Zone photo vide", en: "Empty photo area" },
        src: null,
      },
    ],
  },
];

export const previewFaqs: readonly PreviewFaq[] = [
  {
    id: "preview-faq",
    status: "draft",
    question: {
      fr: "Question d'exemple ?",
      en: "Sample question?",
    },
    answer: {
      fr: "Réponse d'exemple. Elle n'apparaît pas sur le site public.",
      en: "Sample answer. It does not appear on the public site.",
    },
  },
];

export const previewMedia: readonly PreviewMediaItem[] = [
  {
    id: "preview-media-1",
    kind: "document",
    title: "Exemple de ressource (aperçu)",
    category: "programme",
  },
];

export const previewHistory: readonly PreviewHistoryItem[] = [
  {
    id: "h-preview",
    at: "2026-11-05T10:00:00Z",
    action: {
      fr: "Ouverture de l'interface d'administration (aperçu)",
      en: "Opening of the administration interface (preview)",
    },
    subject: { fr: "Administration", en: "Administration" },
  },
];
