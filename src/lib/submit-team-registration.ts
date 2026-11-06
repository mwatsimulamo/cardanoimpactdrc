"use server";

import { revalidatePath } from "next/cache";
import { registrationGate } from "@/lib/registration-gate";
import { registerSubmittedTeam, type SubmitTeamResult } from "@/lib/register-submitted-team";

export type { SubmitTeamResult };

export async function submitTeamRegistration(input: unknown, locale: string): Promise<SubmitTeamResult> {
  if (registrationGate() !== "open") {
    return { status: "error" };
  }

  const result = await registerSubmittedTeam(input, locale === "en" ? "en" : "fr");
  if (result.status === "ok") {
    revalidatePath("/fr");
    revalidatePath("/en");
    revalidatePath("/fr/equipes");
    revalidatePath("/en/equipes");
  }

  return result;
}
