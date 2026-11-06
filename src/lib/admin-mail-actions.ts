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

export async function sendCampaignAction(
  _previous: MailActionState,
  formData: FormData,
): Promise<MailActionState> {
  if (!(await readAdminSession())) {
    return { status: "forbidden" };
  }

  const subject = cleanText(String(formData.get("subject") ?? ""), 180);
  const body = cleanText(String(formData.get("body") ?? ""), 7800);
  const path = cleanText(String(formData.get("publicPath") ?? ""), 180);
  const ctaLabel = cleanText(String(formData.get("ctaLabel") ?? ""), 80);
  const locale = formData.get("locale") === "en" ? "en" : "fr";
  const audiences = parseAudiences(formData.getAll("audience").map(String));
  if (
    formData.get("confirm") !== "yes" ||
    subject.length === 0 ||
    body.length === 0 ||
    audiences.length === 0 ||
    (path.length > 0 && !isPublicMailPath(path)) ||
    (ctaLabel.length > 0 && path.length === 0)
  ) {
    return { status: "invalid" };
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
      return { status: "error", detail: batch.availability };
    }

    return {
      status: "sent",
      detail: `${batch.sent} envoyé(s), ${batch.failed} échec(s), ${batch.remaining} restant(s).`,
    };
  } catch {
    return { status: "error" };
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
