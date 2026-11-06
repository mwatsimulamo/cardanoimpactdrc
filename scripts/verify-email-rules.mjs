import assert from "node:assert/strict";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash, timingSafeEqual } from "node:crypto";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/email/rules.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const compiledUrl = new URL("./.email-rules.generated.mjs", import.meta.url);
writeFileSync(compiledUrl, compiled);
let rules;
try {
  rules = await import("./.email-rules.generated.mjs");
} finally {
  rmSync(compiledUrl, { force: true });
}
const {
  cleanText,
  dedupeRecipients,
  isPublicMailPath,
  normalizeEmail,
  parseAudiences,
  registrationKey,
  scopedMailKey,
  subscriptionDecision,
} = rules;

assert.equal(normalizeEmail("  Ada@Example.COM "), "ada@example.com");
assert.equal(normalizeEmail("not-an-email"), null);
assert.equal(normalizeEmail(`${"a".repeat(250)}@x.co`), null);

const people = [
  { email: "Leader@Example.com", audience: "leader", teamId: "team-1" },
  { email: "leader@example.com", audience: "member", teamId: "team-1" },
  { email: "member@example.com", audience: "member", teamId: "team-1" },
  { email: "reader@example.com", audience: "subscriber", teamId: null },
  { email: "bad", audience: "subscriber", teamId: null },
];
const unique = dedupeRecipients(people);
assert.deepEqual(
  unique.map((person) => person.email),
  ["leader@example.com", "member@example.com", "reader@example.com"],
);
assert.equal(unique[0].audience, "leader");

assert.deepEqual(parseAudiences(["subscribers", "nope", "leaders", "leaders"]), ["leaders", "subscribers"]);
assert.equal(isPublicMailPath("/fr/annonces/atelier-annule"), true);
assert.equal(isPublicMailPath("/fr/equipes"), true);
assert.equal(isPublicMailPath("/fr/resultats"), true);
assert.equal(isPublicMailPath("/fr/activites/atelier"), true);
assert.equal(isPublicMailPath("/fr/equipe"), false);
assert.equal(isPublicMailPath("/fr/desinscription"), false);
assert.equal(isPublicMailPath("https://example.com"), false);
assert.equal(isPublicMailPath("/fr/admin/communications"), false);
assert.equal(cleanText("  bonjour\u0000 ", 4), "bonj");

const teamId = "11111111-1111-4111-8111-111111111111";
const key = registrationKey(teamId, "Leader@Example.com");
assert.equal(key, registrationKey(teamId, "leader@example.com"));
assert.ok(key.length <= 200);
assert.equal(key.includes("@"), false);
assert.equal(key, scopedMailKey(`registration:${teamId}`, "leader@example.com"));

assert.equal(subscriptionDecision(null), "insert");
assert.equal(subscriptionDecision({ unsubscribedAt: null }), "already");
assert.equal(subscriptionDecision({ unsubscribedAt: "2026-11-06T00:00:00.000Z" }), "reactivate");

const token = "unsubscribe-token-value-32b";
const digest = createHash("sha256").update(token).digest("hex");
const other = createHash("sha256").update("other-token-value-32bytes").digest("hex");
assert.equal(digest.length, 64);
assert.equal(timingSafeEqual(Buffer.from(digest), Buffer.from(digest)), true);
assert.equal(timingSafeEqual(Buffer.from(digest), Buffer.from(other)), false);

const actions = readFileSync(new URL("../src/lib/admin-mail-actions.ts", import.meta.url), "utf8");
assert.ok(actions.indexOf("readAdminSession") < actions.indexOf("countAudience"));
assert.ok(actions.indexOf("readAdminSession") < actions.indexOf("sendAdminCampaign"));
assert.ok(actions.indexOf("readAdminSession") < actions.indexOf("retryFailedDeliveries"));

const page = readFileSync(new URL("../src/app/[locale]/admin/communications/page.tsx", import.meta.url), "utf8");
assert.ok(page.indexOf("readAdminSession") < page.indexOf("listSubscribers"));
assert.ok(page.indexOf("readAdminSession") < page.indexOf("listTeamRecipients"));

const service = readFileSync(new URL("../src/lib/email/service.ts", import.meta.url), "utf8");
assert.ok(service.includes('in("status", ["pending", "failed"])'));
assert.equal(service.includes("console."), false);
assert.ok(service.includes('bodyNote: team.data.name'));
assert.ok(service.includes("accessCode"));
assert.equal(service.includes("RESEND_API_KEY"), false);

const mailer = readFileSync(new URL("../src/lib/email/mailer.ts", import.meta.url), "utf8");
assert.ok(mailer.includes("annonces@cardanoimpactdrc.org"));
assert.ok(mailer.includes("process.env.RESEND_API_KEY"));
assert.equal(mailer.includes("return apiKey"), false);
assert.equal(mailer.includes("return { status: \"failed\", error: \"not_configured\" }") || mailer.includes('error: "not_configured"'), true);

const register = readFileSync(new URL("../src/lib/register-submitted-team.ts", import.meta.url), "utf8");
const saveAt = register.indexOf("if (response.ok)");
const mailAt = register.indexOf("await notifyRegisteredTeam");
assert.ok(saveAt >= 0 && mailAt > saveAt);

const publication = readFileSync(new URL("../src/lib/admin-record-actions.ts", import.meta.url), "utf8");
assert.ok(publication.includes("La publication est enregistrée."));
assert.ok(publication.includes('audiences.length === 0'));

const migration = readFileSync(new URL("../supabase/migrations/20261106221000_email_communications.sql", import.meta.url), "utf8");
assert.ok(migration.includes("revoke all on table public.newsletter_subscribers"));
assert.ok(migration.includes("enable row level security"));
assert.equal(migration.includes("access_code"), false);

console.log("email rules: ok");
