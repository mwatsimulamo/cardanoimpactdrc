/**
 * Lien vers le tableau Web Analytics du projet Vercel.
 * Les chiffres restent chez Vercel ; l'admin n'importe pas les lignes.
 */
export function readVercelAnalyticsUrl(): string | null {
  const value = process.env.VERCEL_ANALYTICS_URL?.trim() ?? "";
  if (value.length === 0) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      return null;
    }
    const host = url.hostname.toLowerCase();
    if (host !== "vercel.com" && !host.endsWith(".vercel.com")) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
