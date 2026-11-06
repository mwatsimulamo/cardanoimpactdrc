import "server-only";

import { unstable_rethrow } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type StoreWrite = "ok" | "missing" | "error";

export type EditorialImage = {
  bytes: Uint8Array;
  type: string;
};

export type StoredAnnouncement = {
  id: string;
  slug: string;
  title: string;
  body: string;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StoredActivity = {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  occurredOn: string;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  hasImage: boolean;
  imageType: string;
};

export type StoredOrganizer = {
  id: string;
  name: string;
  role: string;
  xUrl: string;
  linkedInUrl: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  hasImage: boolean;
  imageType: string;
};

export type StoredGalleryItem = {
  id: string;
  description: string;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  hasImage: boolean;
  imageType: string;
};

export type StoredResult = {
  statement: string;
  place1: string;
  place2: string;
  place3: string;
  status: "draft" | "published";
  publishedAt: string | null;
  updatedAt: string;
};

type RowError = { code?: string; message?: string };

export function isEditorialId(value: string): boolean {
  return ID.test(value);
}

export async function readPhaseFile(): Promise<Record<string, string> | "missing" | "error"> {
  const result = await selectRows<{ phase_key: string; status: string }>("program_phases", "phase_key,status");
  if (result === "missing" || result === "error") {
    return result;
  }

  return Object.fromEntries(result.map((row) => [row.phase_key, row.status]));
}

export async function writePhaseFile(values: Record<string, string>): Promise<StoreWrite> {
  const rows = Object.entries(values).map(([phaseKey, status]) => ({
    phase_key: phaseKey,
    status,
    updated_at: new Date().toISOString(),
  }));
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("program_phases").upsert(rows, { onConflict: "phase_key" });
  return error ? classify(error) : "ok";
}

export async function listAnnouncements(): Promise<readonly StoredAnnouncement[] | "missing" | "error"> {
  const result = await selectRows<{
    id: string;
    slug: string;
    title_fr: string;
    body_fr: string;
    status: string;
    published_at: string | null;
    created_at: string;
    updated_at: string;
  }>("announcements", "id,slug,title_fr,body_fr,status,published_at,created_at,updated_at");
  if (result === "missing" || result === "error") {
    return result;
  }

  return result.flatMap((row) => {
    const status = asStatus(row.status);
    if (!status) {
      return [];
    }

    return [{
      id: row.id,
      slug: row.slug,
      title: row.title_fr,
      body: row.body_fr,
      status,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }];
  });
}

export async function writeAnnouncement(record: StoredAnnouncement): Promise<StoreWrite> {
  if (!isEditorialId(record.id)) {
    return "error";
  }

  return insertRow("announcements", {
    id: record.id,
    slug: record.slug,
    title_fr: record.title,
    body_fr: record.body,
    status: record.status,
    published_at: record.publishedAt,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  });
}

export async function removeAnnouncement(id: string): Promise<StoreWrite> {
  return removeRow("announcements", id);
}

export async function listActivities(): Promise<readonly StoredActivity[] | "missing" | "error"> {
  const result = await selectRows<{
    id: string;
    slug: string;
    category: string;
    title_fr: string;
    description_fr: string;
    occurred_on: string | null;
    status: string;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    has_image: boolean;
    image_type: string;
  }>("documented_activities", "id,slug,category,title_fr,description_fr,occurred_on,status,published_at,created_at,updated_at,has_image,image_type");
  if (result === "missing" || result === "error") {
    return result;
  }

  return result.flatMap((row) => {
    const status = asStatus(row.status);
    if (!status) {
      return [];
    }

    return [{
      id: row.id,
      slug: row.slug,
      category: row.category,
      title: row.title_fr,
      description: row.description_fr,
      occurredOn: row.occurred_on ?? "",
      status,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      hasImage: row.has_image,
      imageType: row.image_type,
    }];
  });
}

export async function writeActivity(record: StoredActivity, image?: EditorialImage | null): Promise<StoreWrite> {
  if (!isEditorialId(record.id) || (image && !IMAGE_TYPES.has(image.type))) {
    return "error";
  }

  return insertRow("documented_activities", {
    id: record.id,
    slug: record.slug,
    category: record.category,
    title_fr: record.title,
    description_fr: record.description,
    occurred_on: record.occurredOn || null,
    status: record.status,
    published_at: record.publishedAt,
    has_image: image !== null && image !== undefined,
    image_type: image?.type ?? "",
    image_data: image ? encodeImage(image) : "",
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  });
}

export async function removeActivity(id: string): Promise<StoreWrite> {
  return removeRow("documented_activities", id);
}

export async function listOrganizers(): Promise<readonly StoredOrganizer[] | "missing" | "error"> {
  const result = await selectRows<{
    id: string;
    name: string;
    role: string;
    x_url: string;
    linkedin_url: string;
    status: string;
    created_at: string;
    updated_at: string;
    has_image: boolean;
    image_type: string;
  }>("program_organizers", "id,name,role,x_url,linkedin_url,status,created_at,updated_at,has_image,image_type");
  if (result === "missing" || result === "error") {
    return result;
  }

  return result.flatMap((row) => {
    const status = asStatus(row.status);
    if (!status) {
      return [];
    }

    return [{
      id: row.id,
      name: row.name,
      role: row.role,
      xUrl: row.x_url,
      linkedInUrl: row.linkedin_url,
      status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      hasImage: row.has_image,
      imageType: row.image_type,
    }];
  });
}

export async function writeOrganizer(record: StoredOrganizer, image?: EditorialImage | null): Promise<StoreWrite> {
  if (!isEditorialId(record.id) || (image && !IMAGE_TYPES.has(image.type))) {
    return "error";
  }

  return insertRow("program_organizers", {
    id: record.id,
    name: record.name,
    role: record.role,
    x_url: record.xUrl,
    linkedin_url: record.linkedInUrl,
    status: record.status,
    has_image: image !== null && image !== undefined,
    image_type: image?.type ?? "",
    image_data: image ? encodeImage(image) : "",
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  });
}

export async function removeOrganizer(id: string): Promise<StoreWrite> {
  return removeRow("program_organizers", id);
}

export async function listGalleryItems(): Promise<readonly StoredGalleryItem[] | "missing" | "error"> {
  const result = await selectRows<{
    id: string;
    description: string;
    status: string;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    has_image: boolean;
    image_type: string;
  }>("gallery_items", "id,description,status,published_at,created_at,updated_at,has_image,image_type");
  if (result === "missing" || result === "error") {
    return result;
  }

  return result.flatMap((row) => {
    const status = asStatus(row.status);
    if (!status) {
      return [];
    }

    return [{
      id: row.id,
      description: row.description,
      status,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      hasImage: row.has_image,
      imageType: row.image_type,
    }];
  });
}

export async function writeGalleryItem(record: StoredGalleryItem, image?: EditorialImage | null): Promise<StoreWrite> {
  if (!isEditorialId(record.id) || (image && !IMAGE_TYPES.has(image.type))) {
    return "error";
  }

  return insertRow("gallery_items", {
    id: record.id,
    description: record.description,
    status: record.status,
    published_at: record.publishedAt,
    has_image: image !== null && image !== undefined,
    image_type: image?.type ?? "",
    image_data: image ? encodeImage(image) : "",
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  });
}

export async function removeGalleryItem(id: string): Promise<StoreWrite> {
  return removeRow("gallery_items", id);
}

export async function readResultFile(): Promise<StoredResult | null | "missing" | "error"> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase
      .from("competition_results")
      .select("status,statement_fr,place_1_team_id,place_2_team_id,place_3_team_id,published_at,updated_at")
      .limit(1)
      .maybeSingle();
    if (error) {
      return classify(error);
    }

    if (!data) {
      return null;
    }

    const status = asStatus(data.status);
    if (!status) {
      return null;
    }

    return {
      statement: data.statement_fr,
      place1: data.place_1_team_id ?? "",
      place2: data.place_2_team_id ?? "",
      place3: data.place_3_team_id ?? "",
      status,
      publishedAt: data.published_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    unstable_rethrow(error);
    return "error";
  }
}

export async function writeResultFile(record: StoredResult): Promise<StoreWrite> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const payload = {
      statement_fr: record.statement,
      place_1_team_id: record.place1 || null,
      place_2_team_id: record.place2 || null,
      place_3_team_id: record.place3 || null,
      status: record.status,
      published_at: record.publishedAt,
      updated_at: record.updatedAt,
    };
    const current = await supabase.from("competition_results").select("id").limit(1).maybeSingle();
    if (current.error) {
      return classify(current.error);
    }

    const { error } = current.data
      ? await supabase.from("competition_results").update(payload).eq("id", current.data.id)
      : await supabase.from("competition_results").insert(payload);
    return error ? classify(error) : "ok";
  } catch (error) {
    unstable_rethrow(error);
    return "error";
  }
}

export async function readOriginal(
  kind: "activity" | "organizer" | "gallery",
  id: string,
): Promise<{ bytes: Uint8Array; type: string; status: string } | null> {
  if (!isEditorialId(id)) {
    return null;
  }

  const table = kind === "activity" ? "documented_activities" : kind === "organizer" ? "program_organizers" : "gallery_items";
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase
      .from(table)
      .select("status,has_image,image_type,image_data")
      .eq("id", id)
      .maybeSingle();
    const bytes = data ? decodeImage(data.image_data) : null;
    if (error || !data || data.has_image !== true || !IMAGE_TYPES.has(data.image_type) || !bytes || bytes.byteLength === 0) {
      return null;
    }

    return {
      bytes,
      type: data.image_type,
      status: data.status,
    };
  } catch (error) {
    unstable_rethrow(error);
    return null;
  }
}

async function selectRows<T>(table: string, columns: string): Promise<T[] | "missing" | "error"> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase.from(table).select(columns);
    if (error) {
      return classify(error);
    }

    return (data ?? []) as T[];
  } catch (error) {
    unstable_rethrow(error);
    return "error";
  }
}

async function insertRow(table: string, values: Record<string, unknown>): Promise<StoreWrite> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { error } = await supabase.from(table).insert(values);
    return error ? classify(error) : "ok";
  } catch (error) {
    unstable_rethrow(error);
    return "error";
  }
}

async function removeRow(table: string, id: string): Promise<StoreWrite> {
  if (!isEditorialId(id)) {
    return "error";
  }

  try {
    const supabase = createServiceRoleSupabaseClient();
    const { error } = await supabase.from(table).delete().eq("id", id);
    return error ? classify(error) : "ok";
  } catch (error) {
    unstable_rethrow(error);
    return "error";
  }
}

function classify(error: RowError): "missing" | "error" {
  const message = error.message ?? "";
  if (error.code === "PGRST205" || error.code === "42P01" || /schema cache|does not exist|Could not find the table/i.test(message)) {
    return "missing";
  }

  return "error";
}

function asStatus(value: string): "draft" | "published" | null {
  return value === "draft" || value === "published" ? value : null;
}

function encodeImage(image: EditorialImage): string {
  return Buffer.from(image.bytes).toString("base64");
}

function decodeImage(value: unknown): Uint8Array | null {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  const payload = value.startsWith("data:") ? value.slice(value.indexOf(",") + 1) : value;
  return new Uint8Array(Buffer.from(payload, "base64"));
}
