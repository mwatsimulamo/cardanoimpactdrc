import { connection } from "next/server";
import {
  adminArticlesCsv,
  adminMembersCsv,
  adminTeamsCsv,
  exportFileName,
} from "@/lib/admin-team-export";
import { readAdminSession } from "@/lib/admin-session";
import { isLocale } from "@/lib/locales";
import { readAdminTeams } from "@/lib/published-records";

type Kind = "equipes" | "membres" | "articles";

export async function GET(
  request: Request,
  context: { params: Promise<{ locale: string; kind: string }> },
): Promise<Response> {
  await connection();
  const { locale, kind } = await context.params;
  if (!isLocale(locale) || locale !== "fr") {
    return Response.redirect(new URL("/fr/admin/login", request.url));
  }
  if (!(await readAdminSession())) {
    return Response.redirect(new URL("/fr/admin/login", request.url));
  }
  if (!isExportKind(kind)) {
    return new Response("Export inconnu.", { status: 404 });
  }

  const records = await readAdminTeams();
  if (records.availability !== "ready") {
    return new Response("Les équipes ne sont pas disponibles.", { status: 503 });
  }

  const body =
    kind === "equipes"
      ? adminTeamsCsv(records.teams)
      : kind === "articles"
        ? adminArticlesCsv(records.teams)
        : adminMembersCsv(records.teams);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportFileName(kind)}"`,
      "Cache-Control": "no-store",
    },
  });
}

function isExportKind(value: string): value is Kind {
  return value === "equipes" || value === "membres" || value === "articles";
}
