import "server-only";

import { canonicalOrigin } from "@/lib/metadata";
import type { Locale } from "@/lib/locales";
import type { MailRecipient } from "@/lib/email/rules";
import { renderMail, type MailBody } from "@/lib/email/template";

const origin = canonicalOrigin;

export function leaderRegistrationMail(input: {
  locale: Locale;
  teamName: string;
  accessCode: string;
}): MailBody {
  const space = `${origin}/${input.locale}/equipe`;
  if (input.locale === "en") {
    return renderMail({
      locale: "en",
      preheader: `Your team ${input.teamName} is registered. Keep the access code.`,
      heading: "Your team is officially registered",
      paragraphs: [
        `Your team ${input.teamName} is officially registered for Cardano Learning & Research for Real Use Cases in Goma, DR Congo.`,
        "Welcome. We look forward to the ideas, research and perspectives your team will bring.",
      ],
      details: [{ label: "Team leader access code", value: input.accessCode }],
      notes: ["Keep this code. It opens the team leader space and is not shown again on a public page."],
      action: { label: "Access your team space", href: space },
    });
  }

  return renderMail({
    locale: "fr",
    preheader: `L'équipe ${input.teamName} est enregistrée. Conservez le code d'accès.`,
    heading: "Votre équipe est officiellement enregistrée",
    paragraphs: [
      `L'équipe ${input.teamName} est officiellement enregistrée pour Cardano Learning & Research for Real Use Cases in Goma, DR Congo.`,
      "Bienvenue. Nous serons attentifs aux idées, aux recherches et aux regards que votre équipe apportera.",
    ],
    details: [{ label: "Code d'accès du responsable", value: input.accessCode }],
    notes: ["Conservez ce code. Il ouvre l'espace du responsable et n'est pas réaffiché sur une page publique."],
    action: { label: "Accéder à mon espace équipe", href: space },
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
      heading: "You are part of the journey",
      paragraphs: [
        `We are pleased to confirm that you are registered as a member of the team ${input.teamName}.`,
        `Team leader: ${input.leaderName}. The access code stays with the team leader.`,
      ],
      action: { label: "Explore the program", href: program },
    });
  }

  return renderMail({
    locale: "fr",
      preheader: `Votre place dans l'équipe ${input.teamName} est confirmée.`,
    heading: "Vous faites partie du parcours",
    paragraphs: [
      `Nous avons le plaisir de confirmer votre inscription comme membre de l'équipe ${input.teamName}.`,
      `Responsable : ${input.leaderName}. Le code d'accès reste auprès du responsable.`,
    ],
    action: { label: "Découvrir le programme", href: program },
  });
}

export function newsletterConfirmMail(input: { locale: Locale; unsubscribeUrl: string }): MailBody {
  const home = `${origin}/${input.locale}`;
  const letter = {
    serif: true,
    headerLogo: false,
    signatureBeside: true,
    organization: input.locale === "en" ? "Cardano Impact Pot – DR Congo" : "Cardano Impact Pot – RD Congo",
    unsubscribeUrl: input.unsubscribeUrl,
  };
  if (input.locale === "en") {
    return renderMail({
      ...letter,
      locale: "en",
      preheader: "Your subscription to the CIPot-DR Congo community is recorded.",
      heading: "Hello,",
      paragraphs: [
        "We are glad to welcome you to the CIPot-DR Congo community.",
        "Your subscription is recorded. You will now receive news about the program, including its progress, activities, research and the results that come from participants' contributions.",
        "CIPot-DR Congo encourages learning, collaborative research and practical responses to challenges in our environment. We hope that each idea, each exchange and each contribution can take part in this effort.",
        "We invite you to explore the program and follow it on our website:",
      ],
      action: { label: "Explore CIPot-DR Congo", href: home },
      closing: "Thank you for your interest and your trust.",
    });
  }

  return renderMail({
    ...letter,
    locale: "fr",
    preheader: "Votre inscription à la communauté CIPot-DR Congo est enregistrée.",
    heading: "Bonjour,",
    paragraphs: [
      "Nous sommes heureux de vous accueillir dans la communauté CIPot-DR Congo.",
      "Votre inscription est bien enregistrée. Vous recevrez désormais des nouvelles de notre programme, notamment les avancées, les activités, les travaux de recherche et les résultats issus des contributions des participants.",
      "CIPot-DR Congo est une initiative qui encourage l'apprentissage, la recherche collaborative et le développement de solutions concrètes aux défis de notre environnement. Nous souhaitons que chaque idée, chaque échange et chaque contribution puisse participer à cette dynamique.",
      "Nous vous invitons à découvrir le programme et à suivre son évolution sur notre site :",
    ],
    action: { label: "Découvrir CIPot-DR Congo", href: home },
    closing: "Merci de votre intérêt et de votre confiance.",
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
  const paragraphs = parsed.message.split(/\n{2,}/).map((part) => part.trim()).filter((part) => part.length > 0);
  const lead = input.kind === "publication" ? publicationLead(input.locale, input.publicPath) : null;
  if (lead) {
    paragraphs.unshift(lead);
  }

  return renderMail({
    locale: input.locale,
    preheader: input.subject,
    heading: input.subject,
    paragraphs,
    action,
    extraLinks: sibling ? [sibling] : [],
    unsubscribeUrl: undefined,
  });
}

export function registrationSubject(locale: Locale, teamName: string): string {
  return locale === "en" ? `Your team ${teamName} is registered` : `Votre équipe ${teamName} est enregistrée`;
}

export function newsletterSubject(locale: Locale): string {
  return locale === "en" ? "Welcome to the CIPot-DR Congo community" : "Bienvenue dans la communauté CIPot-DR Congo";
}

export function audienceOf(person: MailRecipient): MailRecipient["audience"] {
  return person.audience;
}

function publicationLead(locale: Locale, publicPath: string | null): string {
  const english = locale === "en";
  if (publicPath?.includes("/activites")) {
    return english
      ? "A new activity is now available on the CIPot-DR Congo website. You are invited to explore it and follow the program."
      : "Une nouvelle activité est disponible sur le site de CIPot-DR Congo. Nous vous invitons à la découvrir et à suivre le programme.";
  }
  if (publicPath?.includes("/resultats")) {
    return english
      ? "The competition result is now available on the CIPot-DR Congo website. You are invited to view it."
      : "Le résultat du concours est disponible sur le site de CIPot-DR Congo. Nous vous invitons à le consulter.";
  }
  if (publicPath?.includes("/annonces")) {
    return english
      ? "A new announcement is now available on the CIPot-DR Congo website. You are invited to read it and follow the program."
      : "Une nouvelle annonce est disponible sur le site de CIPot-DR Congo. Nous vous invitons à la lire et à suivre le programme.";
  }

  return english
    ? "A new publication is available on the CIPot-DR Congo website. You are invited to read it and follow the program."
    : "Une publication est disponible sur le site de CIPot-DR Congo. Nous vous invitons à la lire et à suivre le programme.";
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
    return { label: locale === "en" ? "Explore the activity" : "Découvrir l'activité", href };
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
