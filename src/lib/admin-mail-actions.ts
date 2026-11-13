"use server";

import { readAdminSession } from "@/lib/admin-session";
import { countAudience, retryFailedDeliveries, sendAdminCampaign } from "@/lib/email/service";
import { cleanText, isPublicMailPath, parseAudiences } from "@/lib/email/rules";

export type MailActionState = {
  status: "forbidden" | "invalid" | "preview" | "sent" | "error";
  count?: number;
  detail?: string;
} | null;

export async function previewCampaignAction(
  _previous: MailActionState,
  formData: FormData,
): Promise<MailActionState> {
  if (!(await readAdminSession())) {
    return { status: "forbidden" };
  }

  const audiences = parseAudiences(formData.getAll("audience").map(String));
  if (audiences.length === 0 || cleanText(String(formData.get("subject") ?? ""), 180).length === 0) {
    return { status: "invalid" };
  }

  const count = await countAudience(audiences);
  if (count === "missing" || count === "error") {
    return { status: "error", detail: count };
  }

  return { status: "preview", count };
}

const CAMPAIGN_SUBJECT_MAX = 180;
const CAMPAIGN_BODY_MAX = 7800;

export async function sendCampaignAction(
  _previous: MailActionState,
  formData: FormData,
): Promise<MailActionState> {
  if (!(await readAdminSession())) {
    return { status: "forbidden" };
  }

  const rawSubject = String(formData.get("subject") ?? "");
  const rawBody = String(formData.get("body") ?? "");
  const rawPath = String(formData.get("publicPath") ?? "");
  const rawCta = String(formData.get("ctaLabel") ?? "");
  const subject = cleanText(rawSubject, CAMPAIGN_SUBJECT_MAX);
  const body = cleanText(rawBody, CAMPAIGN_BODY_MAX);
  const path = cleanText(rawPath, 180);
  const ctaLabel = cleanText(rawCta, 80);
  const locale = formData.get("locale") === "en" ? "en" : "fr";
  const audiences = parseAudiences(formData.getAll("audience").map(String));

  if (rawSubject.trim().length > CAMPAIGN_SUBJECT_MAX) {
    return {
      status: "invalid",
      detail: `Le sujet dépasse ${CAMPAIGN_SUBJECT_MAX} caractères. Votre message n'a pas été effacé.`,
    };
  }
  if (rawBody.trim().length > CAMPAIGN_BODY_MAX) {
    return {
      status: "invalid",
      detail: `Le message dépasse ${CAMPAIGN_BODY_MAX.toLocaleString("fr-FR")} caractères. Raccourcissez-le. Votre saisie est conservée.`,
    };
  }
  if (formData.get("confirm") !== "yes") {
    return { status: "invalid", detail: "Cochez la confirmation avant d'envoyer. Votre message est conservé." };
  }
  if (subject.length === 0) {
    return { status: "invalid", detail: "Indiquez un sujet. Votre message est conservé." };
  }
  if (body.length === 0) {
    return { status: "invalid", detail: "Indiquez un message." };
  }
  if (audiences.length === 0) {
    return { status: "invalid", detail: "Choisissez au moins un groupe de destinataires. Votre message est conservé." };
  }
  if (path.length > 0 && !isPublicMailPath(path)) {
    return {
      status: "invalid",
      detail: "Le lien du bouton doit être un chemin public /fr/… ou /en/…. Votre message est conservé.",
    };
  }
  if (ctaLabel.length > 0 && path.length === 0) {
    return {
      status: "invalid",
      detail: "Un libellé de bouton exige aussi un lien public. Votre message est conservé.",
    };
  }

  const note = ctaLabel.length > 0 ? `${body}\n[[cta:${ctaLabel}]]` : body;

  try {
    const batch = await sendAdminCampaign({
      subject,
      body: note,
      publicPath: path.length > 0 ? path : null,
      audiences,
      locale,
      kind: "campaign",
    });
    if (batch.availability !== "ok") {
      return { status: "error", detail: `${batch.availability}. Votre message est conservé.` };
    }

    return {
      status: "sent",
      detail: `${batch.sent} envoyé(s), ${batch.failed} échec(s), ${batch.remaining} restant(s).`,
    };
  } catch {
    return { status: "error", detail: "L'envoi a échoué. Votre message est conservé." };
  }
}

export async function retryMailAction(_previous: MailActionState, formData: FormData): Promise<MailActionState> {
  void formData;
  if (!(await readAdminSession())) {
    return { status: "forbidden" };
  }

  try {
    const batch = await retryFailedDeliveries();
    if (batch.availability !== "ok") {
      return { status: "error", detail: batch.availability };
    }

    return {
      status: "sent",
      detail: `${batch.sent} repris, ${batch.failed} encore en échec, ${batch.remaining} restant(s). Quinze courriels au plus par reprise.`,
    };
  } catch {
    return { status: "error" };
  }
}
