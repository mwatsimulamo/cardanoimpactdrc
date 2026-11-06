import "server-only";

import { headers } from "next/headers";
import { canonicalOrigin } from "@/lib/metadata";

const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;

export async function mailSiteOrigin(): Promise<string> {
  try {
    const headerList = await headers();
    const host = (headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "").split(",")[0]?.trim() ?? "";
    if (LOCAL_HOST.test(host)) {
      const proto = headerList.get("x-forwarded-proto")?.split(",")[0]?.trim() || "http";
      return `${proto}://${host}`;
    }
  } catch {
    // Hors d'une requête, le lien reste celui du site public.
  }

  return canonicalOrigin;
}
