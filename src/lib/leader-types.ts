import type { MemberRole } from "@/lib/team-registration";

export type ForumProfileStatus = "not_provided" | "pending_review" | "verified" | "mismatch";
export type ArticleStatus = "not_submitted" | "submitted" | "verified" | "correction_requested";
export type TeamLifecycleStatus = "submitted" | "suspended" | "rejected";

export type LeaderMember = {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  role: MemberRole;
  forumUsername: string;
  forumProfileUrl: string;
  forumStatus: ForumProfileStatus;
};

export type LeaderTeam = {
  id: string;
  name: string;
  city: string;
  country: string;
  status: TeamLifecycleStatus;
  members: readonly LeaderMember[];
  articleTitle: string;
  articleSummary: string;
  articleUrl: string;
  articleStatus: ArticleStatus;
};
