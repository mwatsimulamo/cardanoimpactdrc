import "server-only";

import { cleanText } from "@/lib/email/rules";

const FROM = "Cardano Impact DR Congo <annonces@cardanoimpactdrc.org>";
const ENDPOINT = "https://api.resend.com/emails";

export type MailDispatch =
  | { status: "sent"; id: string }
  | { status: "failed"; error: "not_configured" | "rate_limit" | "rejected" };

export async function deliverWithResend(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  idempotencyKey: string;
  unsubscribeUrl?: string;
}): Promise<MailDispatch> {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  if (apiKey.length === 0) {
    return { status: "failed", error: "not_configured" };
  }

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": input.idempotencyKey.slice(0, 256),
      },
      body: JSON.stringify({
        from: FROM,
        to: [input.to],
        subject: cleanText(input.subject, 180),
        text: cleanText(input.text, 8000),
        html: cleanText(input.html, 60000),
        ...(input.unsubscribeUrl
          ? { headers: { "List-Unsubscribe": `<${input.unsubscribeUrl}>` } }
          : {}),
      }),
      cache: "no-store",
    });
  } catch {
    return { status: "failed", error: "rejected" };
  }

  if (response.status === 429) {
    return { status: "failed", error: "rate_limit" };
  }

  if (!response.ok) {
    return { status: "failed", error: "rejected" };
  }

  const body: unknown = await response.json().catch(() => null);
  const id = typeof body === "object" && body !== null && "id" in body && typeof body.id === "string" ? body.id : "";
  return { status: "sent", id };
}
