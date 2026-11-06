import type { Locale } from "@/lib/locales";

export type PublishedAnnouncement = {
  slug: string;
  publishedAt: string;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
};

export type PublishedResult = {
  places: readonly [string, string, string];
  articleUrls: readonly string[];
  statement: Record<Locale, string>;
};

export type FaqItem = {
  question: Record<Locale, string>;
  answer: Record<Locale, string>;
};

export type PublicContact = {
  email?: string;
  phone?: string;
  address?: string;
};

const announcements: readonly PublishedAnnouncement[] = [];
const faqItems: readonly FaqItem[] = [
  {
    question: {
      fr: "Qu'est-ce que Cardano Learning & Research for Real Use Cases in Goma, DR Congo ?",
      en: "What is Cardano Learning & Research for Real Use Cases in Goma, DR Congo?",
    },
    answer: {
      fr: "C'est le programme présenté sur CIPot-DR Congo. Il est mené à Goma, en République démocratique du Congo. Le site sert à le comprendre, à s'inscrire, à recevoir les informations et à suivre l'avancement. Les activités réellement tenues y apparaissent lorsque les organisateurs les publient.",
      en: "It is the program presented on CIPot-DR Congo. It is based in Goma, in the Democratic Republic of the Congo. The site is for understanding it, registering, receiving information, and following its progress. Activities that have actually been held appear when the organizers publish them.",
    },
  },
  {
    question: {
      fr: "Qui peut y prendre part ?",
      en: "Who can take part?",
    },
    answer: {
      fr: "Cardano Learning & Research for Real Use Cases in Goma, DR Congo est ouvert aux personnes qui résident en République démocratique du Congo. Aucune expérience préalable n'est exigée. Une personne ne rejoint qu'une équipe. Les membres du jury et de l'équipe organisatrice ne participent pas au concours.",
      en: "Cardano Learning & Research for Real Use Cases in Goma, DR Congo is open to people who live in the Democratic Republic of the Congo. No prior experience is required. A person joins only one team. Jury members and members of the organizing team do not take part in the competition.",
    },
  },
  {
    question: {
      fr: "Est-ce un hackathon ?",
      en: "Is this a hackathon?",
    },
    answer: {
      fr: "Non. Le concours n'est pas un hackathon. Il ne demande ni application, ni prototype, ni smart contract. Une conclusion négative argumentée est valable.",
      en: "No. The competition is not a hackathon. It does not ask for an application, a prototype, or a smart contract. A reasoned negative conclusion is valid.",
    },
  },
  {
    question: {
      fr: "De quelles façons peut-on participer ?",
      en: "In what ways can someone take part?",
    },
    answer: {
      fr: "Trois parcours peuvent se combiner : les deux sessions de formation en ligne, le concours de recherche, et l'atelier de clôture en présentiel. Les sessions et l'atelier s'inscrivent sur Luma. Le concours s'enregistre sur ce site, par équipe. Une inscription Luma n'inscrit pas au concours, et une demande sur ce site ne réserve pas une place Luma.",
      en: "Three paths can be combined: the two online training sessions, the research competition, and the in-person closing workshop. The sessions and the workshop are registered on Luma. The competition is registered on this site, by team. A Luma registration does not register a team for the competition, and a request on this site does not reserve a Luma place.",
    },
  },
  {
    question: {
      fr: "Quelles sont les dates ?",
      en: "What are the dates?",
    },
    answer: {
      fr: "Lancement et inscriptions : du 9 au 21 novembre 2026. Sessions de formation en ligne : du 23 au 24 novembre 2026. Constitution des équipes : du 25 au 29 novembre 2026. Concours et soumission des articles sur https://forum.cardano.org/ : du 30 novembre au 13 décembre 2026. Évaluation par le jury : du 14 au 17 décembre 2026. Atelier de clôture en présentiel à Goma : le vendredi 18 décembre 2026. Aucune heure n'est publiée.",
      en: "Launch and registration: November 9–21, 2026. Online training sessions: November 23–24, 2026. Team formation: November 25–29, 2026. Competition and article submission on https://forum.cardano.org/: November 30–December 13, 2026. Jury evaluation: December 14–17, 2026. In-person closing workshop in Goma: Friday, December 18, 2026. No time of day is published.",
    },
  },
  {
    question: {
      fr: "Comment une équipe s'inscrit-elle au concours ?",
      en: "How does a team register for the competition?",
    },
    answer: {
      fr: "Le responsable enregistre l'équipe sur ce site : le nom de l'équipe, la ville, puis le prénom, le nom, le courriel et le rôle de chaque membre. L'équipe compte de 3 à 5 membres, avec exactement un responsable principal. Un adjoint est facultatif. Le pays enregistré est la République démocratique du Congo. Le concours est maintenu à partir de cinq équipes. La conséquence d'un nombre inférieur n'est pas publiée. La demande ne crée ni compte sur ce site, ni compte Cardano Forum. Après l'enregistrement, le code d'accès du responsable s'affiche sur la page. C'est le seul moyen d'ouvrir l'espace de l'équipe.",
      en: "The team leader registers the team on this site: the team name, the city, then each member's given name, family name, email, and role. A team has 3 to 5 members, with exactly one principal leader. A deputy is optional. The recorded country is the Democratic Republic of the Congo. The competition is held from five teams. The consequence of a lower number is not published. The request creates neither an account on this site nor a Cardano Forum account. After registration, the leader's access code is shown on the page. It is the only way to open the team space.",
    },
  },
  {
    question: {
      fr: "Faut-il un compte Cardano Forum ?",
      en: "Is a Cardano Forum account required?",
    },
    answer: {
      fr: "Le compte est obligatoire pour que l'équipe soit prête pour le concours. Il ne l'est pas pour les sessions en ligne ni pour l'atelier. Chacun crée son propre compte sur https://forum.cardano.org/. Ce site ne demande jamais le mot de passe du forum. La présentation personnelle est encouragée, elle n'est pas exigée. Le nom d'utilisateur et le lien du profil se complètent ensuite dans l'espace du responsable.",
      en: "The account is required for the team to be ready for the competition. It is not required for the online sessions or the workshop. Each person creates their own account on https://forum.cardano.org/. This site never asks for the forum password. A personal introduction is encouraged, and it is not required. The username and the profile link are completed later in the team leader space.",
    },
  },
  {
    question: {
      fr: "Où et quand a lieu l'atelier ?",
      en: "Where and when is the workshop?",
    },
    answer: {
      fr: "L'atelier a lieu à Bakanja, à Goma, le vendredi 18 décembre 2026. L'heure et l'adresse précise ne sont pas publiées. Le site ne connecte pas de portefeuille.",
      en: "The workshop is at Bakanja, in Goma, on Friday, December 18, 2026. The time and the precise address are not published. The site does not connect a wallet.",
    },
  },
  {
    question: {
      fr: "Sur quels sujets les équipes peuvent-elles travailler ?",
      en: "What subjects can teams work on?",
    },
    answer: {
      fr: "Cardano Learning & Research for Real Use Cases in Goma, DR Congo explore l'apport possible de la blockchain à des défis concrets en République démocratique du Congo, notamment l'éducation, l'agriculture, les chaînes d'approvisionnement et la traçabilité, l'entrepreneuriat, l'inclusion financière, la certification et l'identité numérique, les services publics et l'assistance humanitaire. La liste n'est pas fermée.",
      en: "Cardano Learning & Research for Real Use Cases in Goma, DR Congo explores what blockchain might contribute to concrete challenges in the Democratic Republic of the Congo, including education, agriculture, supply chains and traceability, entrepreneurship, financial inclusion, certification and digital identity, public services, and humanitarian assistance. The list is not closed.",
    },
  },
  {
    question: {
      fr: "Quand les résultats apparaissent-ils ?",
      en: "When do the results appear?",
    },
    answer: {
      fr: "Les équipes sélectionnées, au plus cinq, sont annoncées le 17 décembre 2026. La page Résultats ne montre que les trois premières places, et seulement après la saisie du jury. Le jury compte cinq membres. Leurs noms et les notes ne sont pas publiés.",
      en: "The selected teams, at most five, are announced on December 17, 2026. The Results page shows only the first three places, and only after the jury's entry. The jury has five members. Their names and the scores are not published.",
    },
  },
  {
    question: {
      fr: "Comment contacter l'équipe ?",
      en: "How can the team be contacted?",
    },
    answer: {
      fr: "Par le courriel mwatsimulamoolivier@gmail.com, le profil https://x.com/OlivierMWATSIM1 et le groupe WhatsApp indiqué sur le site. Il n'y a pas de formulaire de contact.",
      en: "By email at mwatsimulamoolivier@gmail.com, the profile https://x.com/OlivierMWATSIM1, and the WhatsApp group shown on the site. There is no contact form.",
    },
  },
];

export function listPublishedAnnouncements(): readonly PublishedAnnouncement[] {
  return announcements;
}

export function getPublishedAnnouncement(
  slug: string,
): PublishedAnnouncement | undefined {
  return announcements.find((item) => item.slug === slug);
}

export function getPublishedResult(): PublishedResult | null {
  return null;
}

export function listFaqItems(): readonly FaqItem[] {
  return faqItems;
}

export function getPublicContact(): PublicContact | null {
  return null;
}
