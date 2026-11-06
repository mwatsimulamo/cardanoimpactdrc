import { connection } from "next/server";
import { readAdminSession } from "@/lib/admin-session";
import { isEditorialId, readOriginal } from "@/lib/editorial-store";

const kinds = new Set(["activity", "organizer", "gallery"]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ kind: string; id: string }> },
): Promise<Response> {
  await connection();
  const { kind, id } = await context.params;
  if (!kinds.has(kind) || !isEditorialId(id)) {
    return new Response(null, { status: 404 });
  }

  const image = await readOriginal(kind as "activity" | "organizer" | "gallery", id);
  if (!image) {
    return new Response(null, { status: 404 });
  }

  if (image.status !== "published" && !(await readAdminSession())) {
    return new Response(null, { status: 404 });
  }

  const body = new ArrayBuffer(image.bytes.byteLength);
  new Uint8Array(body).set(image.bytes);
  return new Response(body, {
    headers: {
      "Content-Type": image.type,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": image.status === "published" ? "public, max-age=3600" : "private, no-store",
    },
  });
}
