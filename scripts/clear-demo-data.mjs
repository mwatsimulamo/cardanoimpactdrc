/**
 * Supprime les données de démo (équipes, résultats, newsletters, annonces, galerie, activités).
 * Ne touche pas aux phases du programme ni au compte admin.
 *
 * Usage: node --env-file=.env.local scripts/clear-demo-data.mjs
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()?.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (.env.local).");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation,count=exact",
};

async function wipe(table) {
  const response = await fetch(`${url}/rest/v1/${table}?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: "DELETE",
    headers,
  });

  if (response.status === 404) {
    console.log(`— ${table}: absente`);
    return;
  }

  const text = await response.text();
  if (!response.ok) {
    // Colonne id absente ou autre schéma : essayer truncate via filtre toujours vrai.
    if (/column .* does not exist/i.test(text)) {
      console.log(`— ${table}: schéma différent (${text.slice(0, 120)})`);
      return;
    }
    throw new Error(`${table}: ${response.status} ${text}`);
  }

  const count = response.headers.get("content-range")?.split("/")[1] ?? JSON.parse(text || "[]").length;
  console.log(`✓ ${table}: ${count} ligne(s) supprimée(s)`);
}

async function main() {
  console.log("Nettoyage des données de démo…");

  const tables = [
    "email_deliveries",
    "email_campaigns",
    "newsletter_subscribers",
    "competition_results",
    "article_verification_history",
    "team_articles",
    "team_member_forum_profiles",
    "leader_access_challenges",
    "team_activity_logs",
    "team_rankings",
    "attendance_records",
    "team_members",
    "teams",
    "announcements",
    "gallery_items",
    "activity_media",
    "activity_resources",
    "activity_speakers",
    "documented_activities",
    "speakers",
  ];

  for (const table of tables) {
    await wipe(table);
  }

  console.log("Terminé.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
