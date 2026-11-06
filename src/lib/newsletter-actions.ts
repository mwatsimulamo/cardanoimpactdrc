"use server";

import { subscribeNewsletter, unsubscribeNewsletter } from "@/lib/email/service";

export type NewsletterState = "saved" | "already" | "invalid" | "missing" | "error" | null;

export async function subscribeNewsletterAction(
  _previous: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const locale = formData.get("locale") === "en" ? "en" : "fr";
  try {
    return await subscribeNewsletter({
      email: String(formData.get("email") ?? ""),
      name: String(formData.get("name") ?? ""),
      locale,
      consent: formData.get("consent") === "yes",
    });
  } catch {
    return "error";
  }
}

export async function unsubscribeNewsletterAction(
  _previous: "done" | "invalid" | "missing" | "error" | null,
  formData: FormData,
): Promise<"done" | "invalid" | "missing" | "error"> {
  try {
    return await unsubscribeNewsletter(String(formData.get("token") ?? ""));
  } catch {
    return "error";
  }
}
