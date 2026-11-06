"use server";

import { revalidatePath } from "next/cache";
import type { LeaderTeam } from "@/lib/leader-types";
import {
  saveLeaderForumProfiles,
  signOutLeader,
  submitLeaderArticle,
  verifyLeaderAccess,
  type LeaderAccessResult,
  type LeaderSaveResult,
  type LeaderVerifyResult,
} from "@/lib/leader-workspace";

export type { LeaderAccessResult, LeaderSaveResult, LeaderTeam, LeaderVerifyResult };

export async function verifyLeaderAccessAction(code: string): Promise<LeaderVerifyResult> {
  return verifyLeaderAccess(code);
}

export async function signOutLeaderAction() {
  await signOutLeader();
}

export async function saveLeaderForumAction(
  members: readonly { memberId: string; forumUsername: string; forumProfileUrl: string }[],
): Promise<LeaderSaveResult> {
  const result = await saveLeaderForumProfiles(members);
  if (result.status === "ok") {
    revalidatePublicTeams();
  }

  return result;
}

export async function submitLeaderArticleAction(
  title: string,
  summary: string,
  url: string,
): Promise<LeaderSaveResult> {
  const result = await submitLeaderArticle(title, summary, url);
  if (result.status === "ok") {
    revalidatePublicTeams();
  }

  return result;
}

function revalidatePublicTeams() {
  revalidatePath("/fr/equipes");
  revalidatePath("/en/equipes");
  revalidatePath("/fr/concours");
  revalidatePath("/en/concours");
  revalidatePath("/fr");
  revalidatePath("/en");
}
