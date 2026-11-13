import "server-only";

import { canonicalOrigin } from "@/lib/metadata";
import type { Locale } from "@/lib/locales";
import type { MailRecipient } from "@/lib/email/rules";
import { renderMail, type MailBody } from "@/lib/email/template";

const origin = canonicalOrigin;

function greeting(locale: Locale): string {
  return locale === "en" ? "Hello," : "Salut,";
}

export function leaderRegistrationMail(input: {
  locale: Locale;
  teamName: string;
  accessCode: string;
}): MailBody {
  const space = `${origin}/${input.locale}/equipe`;
  if (input.locale === "en") {
    return renderMail({
      locale: "en",
      preheader: `Your team ${input.teamName} is registered. Keep your access code.`,
      heading: greeting("en"),
      paragraphs: [
        `Your team ${input.teamName} is now registered for the research competition.`,
        "Welcome — we look forward to the ideas and research your team will bring.",
        "Below is the team leader access code. Keep it carefully: it opens your team space and will not be shown again on a public page.",
      ],
      details: [{ label: "Team leader access code", value: input.accessCode }],
      action: { label: "Open your team space", href: space },
      closing: "See you soon,",
    });
  }

  return renderMail({
    locale: "fr",
    preheader: `L'équipe ${input.teamName} est enregistrée. Conservez le code d'accès.`,
    heading: greeting("fr"),
    paragraphs: [
      `L'équipe ${input.teamName} est maintenant enregistrée pour le concours de recherche.`,
      "Bienvenue — nous avons hâte de découvrir les idées et les travaux que votre équipe apportera.",
      "Voici le code d'accès du responsable. Conservez-le précieusement : il ouvre l'espace de votre équipe et n'est pas réaffiché sur une page publique.",
    ],
    details: [{ label: "Code d'accès du responsable", value: input.accessCode }],
    action: { label: "Ouvrir mon espace équipe", href: space },
    closing: "À bientôt,",
  });
}

export function memberRegistrationMail(input: {
  locale: Locale;
  teamName: string;
  leaderName: string;
}): MailBody {
  const program = `${origin}/${input.locale}/programme`;
  if (input.locale === "en") {
    return renderMail({
      locale: "en",
      preheader: `You are registered with the team ${input.teamName}.`,
      heading: greeting("en"),
      paragraphs: [
        `You are confirmed as a member of the team ${input.teamName}.`,
        `Your team leader is ${input.leaderName}. The access code stays with the team leader.`,
        "You can follow the program and the next steps on the website.",
      ],
      action: { label: "Explore the program", href: program },
      closing: "See you soon,",
    });
  }

  return renderMail({
    locale: "fr",
    preheader: `Votre place dans l'équipe ${input.teamName} est confirmée.`,
    heading: greeting("fr"),
    paragraphs: [
      `Votre inscription comme membre de l'équipe ${input.teamName} est confirmée.`,
      `Le responsable de l'équipe est ${input.leaderName}. Le code d'accès reste auprès du responsable.`,
      "Vous pouvez suivre le programme et les prochaines étapes sur le site.",
    ],
    action: { label: "Découvrir le programme", href: program },
    closing: "À bientôt,",
  });
}

export function newsletterConfirmMail(input: { locale: Locale; unsubscribeUrl: string }): MailBody {
  const home = `${origin}/${input.locale}`;
  if (input.locale === "en") {
    return renderMail({
      locale: "en",
      serif: true,
      unsubscribeUrl: input.unsubscribeUrl,
      preheader: "Your subscription is confirmed. You will receive news about the program.",
      heading: greeting("en"),
      paragraphs: [
        "Thank you for subscribing. You will now receive updates on the program: progress, activities, research and published results.",
        "We look forward to keeping you informed along the way.",
      ],
      action: { label: "Visit the website", href: home },
      closing: "Thank you for your interest,",
    });
  }

  return renderMail({
    locale: "fr",
    serif: true,
    unsubscribeUrl: input.unsubscribeUrl,
    preheader: "Votre inscription est confirmée. Vous recevrez les nouvelles du programme.",
    heading: greeting("fr"),
    paragraphs: [
      "Merci pour votre inscription. Vous recevrez désormais des nouvelles du programme : avancées, activités, recherches et résultats publiés.",
      "Nous serons heureux de vous tenir informé au fil du parcours.",
    ],
    action: { label: "Visiter le site", href: home },
    closing: "Merci de votre intérêt,",
  });
}

export function campaignMail(input: {
  locale: Locale;
  subject: string;
  body: string;
  publicPath: string | null;
  kind?: "campaign" | "publication";
}): MailBody {
  const parsed = splitCta(input.body);
  const action = actionFor(input.locale, input.publicPath, parsed.label);
  const sibling = siblingLink(input.locale, input.publicPath);
  const paragraphs = parsed.message
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (input.kind === "publication") {
    const lead = publicationLead(input.locale, input.publicPath);
    if (lead) {
      paragraphs.unshift(lead);
    }
  }

  return renderMail({
    locale: input.locale,
    preheader: input.subject,
    heading: greeting(input.locale),
    paragraphs,
    action,
    extraLinks: sibling ? [sibling] : [],
    closing: input.locale === "en" ? "Best regards," : "Cordialement,",
  });
}

export function registrationSubject(locale: Locale, teamName: string): string {
  return locale === "en" ? `Your team ${teamName} is registered` : `Votre équipe ${teamName} est enregistrée`;
}

export function newsletterSubject(locale: Locale): string {
  return locale === "en" ? "Your subscription is confirmed" : "Votre inscription est confirmée";
}

export function audienceOf(person: MailRecipient): MailRecipient["audience"] {
  return person.audience;
}

function publicationLead(locale: Locale, publicPath: string | null): string {
  const english = locale === "en";
  if (publicPath?.includes("/activites")) {
    return english
      ? "A new activity has just been published. You are invited to discover it and follow the next steps of the program."
      : "Une nouvelle activité vient d'être publiée. Nous vous invitons à la découvrir et à suivre la suite du programme.";
  }
  if (publicPath?.includes("/resultats")) {
    return english
      ? "The competition results are now available. You can view the published ranking and the full details on the website."
      : "Les résultats du concours sont maintenant disponibles. Vous pouvez consulter le classement publié et le détail sur le site.";
  }
  if (publicPath?.includes("/annonces")) {
    return english
      ? "A new announcement has just been published. Here is what you need to know."
      : "Une nouvelle annonce vient d'être publiée. Voici ce qu'il faut retenir.";
  }

  return english
    ? "A new update is available on the website. You are invited to read it."
    : "Une nouvelle information est disponible sur le site. Nous vous invitons à en prendre connaissance.";
}

function actionFor(
  locale: Locale,
  publicPath: string | null,
  customLabel: string | null,
): { label: string; href: string } | null {
  if (!publicPath) {
    return null;
  }

  const href = `${origin}${publicPath}`;
  if (customLabel) {
    return { label: customLabel, href };
  }
  if (publicPath.includes("/annonces")) {
    return { label: locale === "en" ? "Read the announcement" : "Lire l'annonce", href };
  }
  if (publicPath.includes("/activites")) {
    return { label: locale === "en" ? "Discover the activity" : "Découvrir l'activité", href };
  }
  if (publicPath.includes("/resultats")) {
    return { label: locale === "en" ? "View the results" : "Consulter les résultats", href };
  }

  return { label: locale === "en" ? "Open this page" : "Ouvrir cette page", href };
}

function splitCta(body: string): { message: string; label: string | null } {
  const match = /\n\[\[cta:([^\]\n]{1,80})\]\]\s*$/.exec(body);
  if (!match) {
    return { message: body, label: null };
  }

  return { message: body.slice(0, match.index).trimEnd(), label: match[1].trim() };
}

function siblingLink(locale: Locale, publicPath: string | null): { label: string; href: string } | null {
  if (!publicPath) {
    return null;
  }

  const sibling = publicPath.startsWith("/fr")
    ? publicPath.replace(/^\/fr(?=\/|$)/, "/en")
    : publicPath.startsWith("/en")
      ? publicPath.replace(/^\/en(?=\/|$)/, "/fr")
      : null;
  if (!sibling || sibling === publicPath) {
    return null;
  }

  const siblingIsEnglish = sibling.startsWith("/en");
  const label =
    locale === "en"
      ? siblingIsEnglish
        ? "Read this page in English"
        : "Read this page in French"
      : siblingIsEnglish
        ? "Lire cette page en anglais"
        : "Lire cette page en français";
  return { label, href: `${origin}${sibling}` };
}
