import type { MemberRole } from "@/lib/team-registration";

export type ArticleStatus = "not_submitted" | "submitted" | "verified" | "correction_requested";

export type TeamLifecycleStatus = "submitted" | "suspended" | "rejected";

export type ForumProfileStatus = "not_provided" | "pending_review" | "verified" | "mismatch";

export type PreviewMember = {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  role: MemberRole;
  forumUsername: string;
  forumProfileUrl: string;
  forumStatus: ForumProfileStatus;
};

export type PreviewHistoryEntry = {
  id: string;
  at: string;
  summary: Record<"fr" | "en", string>;
};

export type PreviewTeam = {
  id: string;
  name: string;
  city: string;
  country: string;
  status: TeamLifecycleStatus;
  memberCount: number;
  members: readonly PreviewMember[];
  articleTitle: string;
  articleUrl: string;
  articleStatus: ArticleStatus;
  articleHistory: readonly { at: string; title: string; url: string }[];
  history: readonly PreviewHistoryEntry[];
};

export const PREVIEW_NOTICE = {
  fr: "Prévisualisation. Ces données d'exemple ne sont pas des inscriptions réelles.",
  en: "Preview. This sample data is not a real registration.",
} as const;

export const previewTeams: readonly PreviewTeam[] = [
  {
    id: "preview-goma-research",
    name: "Aperçu Goma Research",
    city: "Goma",
    country: "République démocratique du Congo",
    status: "submitted",
    memberCount: 3,
    members: [
      {
        id: "preview-m1",
        givenName: "Amina",
        familyName: "Exemple",
        email: "leader@example.test",
        role: "leader",
        forumUsername: "",
        forumProfileUrl: "",
        forumStatus: "not_provided",
      },
      {
        id: "preview-m2",
        givenName: "Joseph",
        familyName: "Exemple",
        email: "adjoint@example.test",
        role: "deputy",
        forumUsername: "",
        forumProfileUrl: "",
        forumStatus: "not_provided",
      },
      {
        id: "preview-m3",
        givenName: "Grace",
        familyName: "Exemple",
        email: "membre@example.test",
        role: "member",
        forumUsername: "",
        forumProfileUrl: "",
        forumStatus: "not_provided",
      },
    ],
    articleTitle: "",
    articleUrl: "",
    articleStatus: "not_submitted",
    articleHistory: [],
    history: [
      {
        id: "h1",
        at: "2026-11-09",
        summary: {
          fr: "Équipe enregistrée (aperçu).",
          en: "Team recorded (preview).",
        },
      },
    ],
  },
];

export function getPreviewTeam(id = previewTeams[0].id): PreviewTeam {
  return previewTeams.find((team) => team.id === id) ?? previewTeams[0];
}
