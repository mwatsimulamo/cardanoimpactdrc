"use server";

import { revalidatePath } from "next/cache";
import { readAdminSession } from "@/lib/admin-session";
import { sendAdminCampaign } from "@/lib/email/service";
import { cleanText, isPublicMailPath, parseAudiences } from "@/lib/email/rules";
import {
  isEditorialId,
  removeGalleryItem,
  writeGalleryItem,
  type EditorialImage,
} from "@/lib/editorial-store";
import {
  deleteActivity,
  deleteAnnouncement,
  saveAnnouncement,
  saveDocumentedActivity,
  savePhaseStatus,
  saveResult,
  type AdminWriteStatus,
} from "@/lib/published-records";

export type AdminActionState = {
  status: AdminWriteStatus | "forbidden";
  detail?: string;
} | null;

const IMAGE_LIMIT = Math.floor(3.5 * 1024 * 1024);
const WORKBOOK_LIMIT = IMAGE_LIMIT;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_DETAIL = "L'image doit être un JPEG, PNG ou WebP de 3,5 Mo au plus.";

export async function savePhaseAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await readAdminSession())) {
    return { status: "forbidden" };
  }

  const status = await savePhaseStatus(String(formData.get("phase") ?? ""), String(formData.get("status") ?? ""));
  if (status === "ok") {
    refreshPublic();
  }

  return { status };
}

export async function saveAnnouncementAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await readAdminSession())) {
    return { status: "forbidden" };
  }

  const announcementId = String(formData.get("id") ?? "");
  const saved = await saveAnnouncement({
    id: announcementId,
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    publish: formData.get("intent") === "publish",
  });
  if (saved.status === "ok") {
    refreshPublic();
    return finishPublication(saved.publicPath, formData, cleanText(String(formData.get("title") ?? ""), 180));
  }

  return { status: saved.status, detail: saved.detail };
}

export async function removeAnnouncementAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await readAdminSession())) {
    return { status: "forbidden" };
  }

  const status = await deleteAnnouncement(String(formData.get("id") ?? ""));
  if (status === "ok") {
    refreshPublic();
  }

  return { status };
}

export async function saveResultAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await readAdminSession())) {
    return { status: "forbidden" };
  }

  const workbook = await readUploadedWorkbook(formData.get("workbook"));
  if (workbook === "invalid") {
    return { status: "invalid", detail: "Le classeur doit être un fichier .xls ou .xlsx de 3,5 Mo au plus." };
  }
  const workbookUrl = parseWorkbookUrl(String(formData.get("workbookUrl") ?? ""));
  if (workbookUrl === "invalid") {
    return {
      status: "invalid",
      detail: "Le lien doit être une adresse https Google Sheets (docs.google.com/spreadsheets).",
    };
  }

  const place1 = String(formData.get("place1") ?? "");
  const place2 = String(formData.get("place2") ?? "");
  const place3 = String(formData.get("place3") ?? "");
  const parsedPlaces = readExtraPlaces(formData);
  if (parsedPlaces === "invalid") {
    return { status: "invalid", detail: "Chaque place suivante est un nombre entier de 4 à 99, sans doublon." };
  }
  const official = new Set([place1, place2, place3]);
  const teamPlaces = parsedPlaces.filter((item) => !official.has(item.teamId));

  const saved = await saveResult({
    statement: String(formData.get("statement") ?? ""),
    place1,
    place2,
    place3,
    publish: formData.get("intent") === "publish",
    workbook,
    workbookUrl,
    teamPlaces,
  });
  if (saved.status === "ok") {
    refreshPublic();
    return finishPublication(saved.publicPath, formData, "Résultat publié");
  }

  return { status: saved.status };
}

export async function saveActivityAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await readAdminSession())) {
    return { status: "forbidden" };
  }

  const image = await readUploadedImage(formData.get("image"));
  if (image === "invalid") {
    return { status: "invalid", detail: IMAGE_DETAIL };
  }

  const occurredOn = String(formData.get("occurredOn") ?? "");
  const publish = formData.get("intent") === "publish";
  const saved = await saveDocumentedActivity({
    id: String(formData.get("id") ?? ""),
    category: String(formData.get("category") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    occurredOn,
    publish,
    image,
  });
  if (saved.status === "ok") {
    refreshPublic();
    return finishPublication(saved.publicPath, formData, cleanText(String(formData.get("title") ?? ""), 180));
  }

  return { status: saved.status, detail: saved.detail };
}

export async function removeActivityAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await readAdminSession())) {
    return { status: "forbidden" };
  }

  const status = await deleteActivity(String(formData.get("id") ?? ""));
  if (status === "ok") {
    refreshPublic();
  }

  return { status };
}

export async function saveGalleryAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await readAdminSession())) {
    return { status: "forbidden" };
  }

  const description = String(formData.get("description") ?? "").trim();
  const image = await readUploadedImage(formData.get("image"));
  if (image === "invalid") {
    return { status: "invalid", detail: IMAGE_DETAIL };
  }

  const publish = formData.get("intent") === "publish";
  if (description.length === 0 || description.length > 500) {
    return { status: "invalid", detail: "Indiquez une description." };
  }
  if (publish && image === null) {
    return { status: "invalid", detail: "Ajoutez une image pour publier." };
  }

  const now = new Date().toISOString();
  const saved = await writeGalleryItem(
    {
      id: crypto.randomUUID(),
      description,
      status: publish ? "published" : "draft",
      publishedAt: publish ? now : null,
      createdAt: now,
      updatedAt: now,
      hasImage: image !== null,
      imageType: image?.type ?? "",
    },
    image,
  );
  if (saved !== "ok") {
    return { status: saved };
  }

  refreshPublic();
  return { status: "ok" };
}

export async function removeGalleryAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await readAdminSession())) {
    return { status: "forbidden" };
  }

  const id = String(formData.get("id") ?? "");
  if (!isEditorialId(id)) {
    return { status: "error" };
  }

  const removed = await removeGalleryItem(id);
  if (removed !== "ok") {
    return { status: removed };
  }

  refreshPublic();
  return { status: "ok" };
}

async function readUploadedImage(value: FormDataEntryValue | null): Promise<EditorialImage | null | "invalid"> {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (value.size > IMAGE_LIMIT) {
    return "invalid";
  }

  const bytes = new Uint8Array(await value.arrayBuffer());
  const type = imageTypeOf(bytes);
  if (!type || (IMAGE_TYPES.has(value.type) && value.type !== type)) {
    return "invalid";
  }

  return { bytes, type };
}

function readExtraPlaces(formData: FormData): { teamId: string; place: number }[] | "invalid" {
  const places: { teamId: string; place: number }[] = [];
  const seen = new Set<number>();
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("extraPlace-") || typeof value !== "string") {
      continue;
    }
    const text = value.trim();
    if (text.length === 0) {
      continue;
    }
    const teamId = key.slice("extraPlace-".length);
    const place = Number(text);
    if (!isEditorialId(teamId) || !Number.isInteger(place) || place < 4 || place > 99 || seen.has(place)) {
      return "invalid";
    }
    seen.add(place);
    places.push({ teamId, place });
  }
  return places;
}

function parseWorkbookUrl(value: string): string | "invalid" {
  const text = value.trim();
  if (text.length === 0) {
    return "";
  }

  try {
    const url = new URL(text);
    if (url.protocol !== "https:") {
      return "invalid";
    }
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();
    if (host === "docs.google.com" && path.includes("/spreadsheets/")) {
      return url.toString();
    }
    if (host === "sheets.google.com") {
      return url.toString();
    }
    return "invalid";
  } catch {
    return "invalid";
  }
}

async function readUploadedWorkbook(
  value: FormDataEntryValue | null,
): Promise<{ name: string; type: string; bytes: Uint8Array } | null | "invalid"> {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (value.size > WORKBOOK_LIMIT || /\.xlsm$/i.test(value.name)) {
    return "invalid";
  }

  const bytes = new Uint8Array(await value.arrayBuffer());
  const type = workbookTypeOf(bytes);
  const name = type ? workbookNameOf(value.name, type) : null;
  if (!type || !name) {
    return "invalid";
  }

  return { name, type, bytes };
}

function workbookTypeOf(bytes: Uint8Array): string | null {
  if (bytes.length >= 8 && bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) {
    return "application/vnd.ms-excel";
  }

  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  return null;
}

function workbookNameOf(value: string, type: string): string | null {
  const extension = type === "application/vnd.ms-excel" ? ".xls" : ".xlsx";
  const base = (value.split(/[/\\]/).pop() ?? "").trim();
  if (/\.xlsm$/i.test(base)) {
    return null;
  }

  const cleaned = base.replace(/[^\w.\- ()]/g, "").slice(0, 80);
  if (cleaned.toLowerCase().endsWith(extension)) {
    return cleaned;
  }

  return `resultats-equipes${extension}`;
}

function imageTypeOf(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

function publicationSubject(publicPath: string, title: string): string {
  const label = publicPath.includes("/activites")
    ? "Une nouvelle activité est publiée"
    : publicPath.includes("/resultats")
      ? "Les résultats sont publiés"
      : "Une nouvelle annonce est publiée";
  const cleanTitle = title.trim();
  if (cleanTitle.length === 0) {
    return label;
  }

  return `${label} — ${cleanTitle}`.slice(0, 180);
}

function refreshPublic() {
  revalidatePath("/fr", "layout");
  revalidatePath("/en", "layout");
  revalidatePath("/fr");
  revalidatePath("/en");
  revalidatePath("/fr/calendrier");
  revalidatePath("/en/calendrier");
  revalidatePath("/fr/feuille-de-route");
  revalidatePath("/en/feuille-de-route");
}

async function finishPublication(publicPath: string | null, formData: FormData, title: string): Promise<AdminActionState> {
  const audiences = parseAudiences(formData.getAll("audience").map(String));
  if (!publicPath || !isPublicMailPath(publicPath) || audiences.length === 0) {
    return { status: "ok" };
  }

  try {
    const batch = await sendAdminCampaign({
      subject: publicationSubject(publicPath, title),
      body: cleanText(String(formData.get("mailNote") ?? ""), 4000) || title || "CIPot-DR Congo",
      publicPath,
      audiences,
      locale: "fr",
      kind: "publication",
    });
    if (batch.availability !== "ok" || batch.failed > 0 || batch.remaining > 0) {
      return {
        status: "ok",
        detail: "La publication est enregistrée. L'envoi des courriels est incomplet : reprenez-le dans Communications.",
      };
    }
  } catch {
    return {
      status: "ok",
      detail: "La publication est enregistrée. L'envoi des courriels a échoué : reprenez-le dans Communications.",
    };
  }

  return { status: "ok" };
}
