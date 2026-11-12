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
  workbookName: string;
  teamPlaces: readonly TeamPlace[];
};

export type TeamPlace = {
  teamId: string;
  place: number;
};

export type ResultWorkbook = {
  name: string;
  type: string;
  bytes: Uint8Array;
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

export async function updateAnnouncement(record: StoredAnnouncement): Promise<StoreWrite> {
  if (!isEditorialId(record.id)) {
    return "error";
  }

  return updateRow("announcements", record.id, {
    title_fr: record.title,
    body_fr: record.body,
    status: record.status,
    published_at: record.publishedAt,
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

export async function updateActivity(record: StoredActivity, image?: EditorialImage | null): Promise<StoreWrite> {
  if (!isEditorialId(record.id) || (image && !IMAGE_TYPES.has(image.type))) {
    return "error";
  }

  const values: Record<string, unknown> = {
    category: record.category,
    title_fr: record.title,
    description_fr: record.description,
    occurred_on: record.occurredOn || null,
    status: record.status,
    published_at: record.publishedAt,
    updated_at: record.updatedAt,
  };
  if (image) {
    values.has_image = true;
    values.image_type = image.type;
    values.image_data = encodeImage(image);
  }

  return updateRow("documented_activities", record.id, values);
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
    const basic = "status,statement_fr,place_1_team_id,place_2_team_id,place_3_team_id,published_at,updated_at";
    let selected = await supabase.from("competition_results").select(`${basic},workbook_name,team_places`).limit(1).maybeSingle();
    if (selected.error && /team_places/i.test(selected.error.message ?? "")) {
      selected = await supabase.from("competition_results").select(`${basic},workbook_name`).limit(1).maybeSingle();
    }
    if (selected.error && /workbook_name/i.test(selected.error.message ?? "")) {
      selected = await supabase.from("competition_results").select(basic).limit(1).maybeSingle();
    }
    const { data, error } = selected;
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
      workbookName: "workbook_name" in data && typeof data.workbook_name === "string" ? data.workbook_name : "",
      teamPlaces: "team_places" in data ? teamPlacesFrom(data.team_places) : [],
    };
  } catch (error) {
    unstable_rethrow(error);
    return "error";
  }
}

export async function writeResultFile(record: StoredResult, workbook?: ResultWorkbook): Promise<StoreWrite> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const payload: Record<string, unknown> = {
      statement_fr: record.statement,
      place_1_team_id: record.place1 || null,
      place_2_team_id: record.place2 || null,
      place_3_team_id: record.place3 || null,
      status: record.status,
      published_at: record.publishedAt,
      updated_at: record.updatedAt,
    };
    if (workbook) {
      payload.workbook_name = workbook.name;
      payload.workbook_type = workbook.type;
      payload.workbook_data = Buffer.from(workbook.bytes).toString("base64");
    }
    payload.team_places = record.teamPlaces;
    const current = await supabase.from("competition_results").select("id").limit(1).maybeSingle();
    if (current.error) {
      return classify(current.error);
    }

    const write = (values: Record<string, unknown>) =>
      current.data
        ? supabase.from("competition_results").update(values).eq("id", current.data.id)
        : supabase.from("competition_results").insert(values);
    let { error } = await write(payload);
    if (error && /team_places/i.test(error.message ?? "")) {
      if (record.teamPlaces.length > 0) {
        return "error";
      }
      const withoutPlaces = { ...payload };
      delete withoutPlaces.team_places;
      error = (await write(withoutPlaces)).error;
    }
    return error ? classify(error) : "ok";
  } catch (error) {
    unstable_rethrow(error);
    return "error";
  }
}

const WORKBOOK_TYPES = new Set([
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export async function readResultWorkbook(): Promise<{ bytes: Uint8Array; type: string; name: string; status: string } | null> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase
      .from("competition_results")
      .select("status,workbook_name,workbook_type,workbook_data")
      .limit(1)
      .maybeSingle();
    const bytes = data ? decodeImage(data.workbook_data) : null;
    if (error || !data || !WORKBOOK_TYPES.has(data.workbook_type) || !bytes || bytes.byteLength === 0) {
      return null;
    }

    const fallback = data.workbook_type === "application/vnd.ms-excel" ? "resultats-equipes.xls" : "resultats-equipes.xlsx";
    const name = typeof data.workbook_name === "string" && data.workbook_name.trim().length > 0 ? data.workbook_name.trim() : fallback;
    return { bytes, type: data.workbook_type, name, status: data.status };
  } catch (error) {
    unstable_rethrow(error);
    return null;
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

async function updateRow(table: string, id: string, values: Record<string, unknown>): Promise<StoreWrite> {
  if (!isEditorialId(id)) {
    return "error";
  }

  try {
    const supabase = createServiceRoleSupabaseClient();
    const { error } = await supabase.from(table).update(values).eq("id", id);
    return error ? classify(error) : "ok";
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

export function teamPlacesFrom(value: unknown): TeamPlace[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const places: TeamPlace[] = [];
  const seenPlaces = new Set<number>();
  const seenTeams = new Set<string>();
  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const record = item as { teamId?: unknown; place?: unknown };
    const teamId = typeof record.teamId === "string" ? record.teamId : "";
    const place = typeof record.place === "number" ? record.place : Number.NaN;
    if (!ID.test(teamId) || !Number.isInteger(place) || place < 4 || place > 99 || seenPlaces.has(place) || seenTeams.has(teamId)) {
      continue;
    }
    seenPlaces.add(place);
    seenTeams.add(teamId);
    places.push({ teamId, place });
  }

  return places.sort((left, right) => left.place - right.place);
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
