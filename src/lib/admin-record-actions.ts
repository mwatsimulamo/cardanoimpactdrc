"use server";

import { revalidatePath } from "next/cache";
import { readAdminSession } from "@/lib/admin-session";
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

  const status = await saveAnnouncement({
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    publish: formData.get("intent") === "publish",
  });
  if (status === "ok") {
    refreshPublic();
  }

  return { status };
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

  const status = await saveResult({
    statement: String(formData.get("statement") ?? ""),
    place1: String(formData.get("place1") ?? ""),
    place2: String(formData.get("place2") ?? ""),
    place3: String(formData.get("place3") ?? ""),
    publish: formData.get("intent") === "publish",
  });
  if (status === "ok") {
    refreshPublic();
  }

  return { status };
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
  const status = await saveDocumentedActivity({
    category: String(formData.get("category") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    occurredOn,
    publish,
    image,
  });
  if (status === "invalid" && publish && /^\d{4}-\d{2}-\d{2}$/.test(occurredOn) && occurredOn > todayInGoma()) {
    return { status, detail: "Pour publier, indiquez une date déjà passée. Une activité prévue n'est pas présentée comme tenue." };
  }
  if (status === "ok") {
    refreshPublic();
  }

  return { status };
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

function todayInGoma(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lubumbashi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function refreshPublic() {
  revalidatePath("/fr", "layout");
  revalidatePath("/en", "layout");
}
