import { connection } from "next/server";
import { readAdminSession } from "@/lib/admin-session";
import { readResultWorkbook } from "@/lib/editorial-store";

export async function GET(): Promise<Response> {
  await connection();
  const file = await readResultWorkbook();
  if (!file) {
    return new Response(null, { status: 404 });
  }

  if (file.status !== "published" && !(await readAdminSession())) {
    return new Response(null, { status: 404 });
  }

  const body = new ArrayBuffer(file.bytes.byteLength);
  new Uint8Array(body).set(file.bytes);
  const ascii = file.name.replace(/[^\w.\- ]/g, "") || "resultats-equipes.xlsx";
  return new Response(body, {
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
