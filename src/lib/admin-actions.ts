"use server";

import { redirect } from "next/navigation";
import { checkAdminCredentials, type AdminCredentialStatus } from "@/lib/admin-auth";
import { clearAdminSession, writeAdminSession } from "@/lib/admin-session";

export type AdminSignInFailure = {
  status: Exclude<AdminCredentialStatus, "ok">;
};

export async function signInAdminAction(
  _previous: AdminSignInFailure | null,
  formData: FormData,
): Promise<AdminSignInFailure | null> {
  const status = checkAdminCredentials(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
  if (status !== "ok") {
    return { status };
  }

  const stored = await writeAdminSession();
  if (!stored) {
    return { status: "unconfigured" };
  }

  redirect("/fr/admin");
}

export async function signOutAdminAction() {
  await clearAdminSession();
  redirect("/fr/admin/login");
}
