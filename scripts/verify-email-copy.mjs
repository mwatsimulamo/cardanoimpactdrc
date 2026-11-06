import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = new URL("..", import.meta.url);
const dir = mkdtempSync(join(tmpdir(), "cipot-mail-"));

function compile(relativePath, rewrite) {
  const source = rewrite(readFileSync(new URL(relativePath, root), "utf8").replace(/\r\n/g, "\n"));
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const file = join(dir, relativePath.split("/").pop().replace(/\.ts$/, ".mjs"));
  writeFileSync(file, compiled);
  return file;
}

compile("src/lib/email/template.ts", (source) =>
  source
    .replace('import "server-only";\n', "")
    .replace('import { canonicalOrigin } from "@/lib/metadata";\n', 'const canonicalOrigin = "https://www.cardanoimpactdrc.org";\n')
    .replace('import type { Locale } from "@/lib/locales";\n', ""),
);

const copyFile = compile("src/lib/email/copy.ts", (source) =>
  source
    .replace('import "server-only";\n', "")
    .replace('import { canonicalOrigin } from "@/lib/metadata";\n', 'const canonicalOrigin = "https://www.cardanoimpactdrc.org";\n')
    .replace('import type { Locale } from "@/lib/locales";\n', "")
    .replace('import type { MailRecipient } from "@/lib/email/rules";\n', "")
    .replace('import { renderMail, type MailBody } from "@/lib/email/template";\n', 'import { renderMail } from "./template.mjs";\n'),
);

const copy = await import(pathToFileURL(copyFile).href);

const leader = copy.leaderRegistrationMail({ locale: "fr", teamName: "Umoja", accessCode: "UM123456" });
const leaderEn = copy.leaderRegistrationMail({ locale: "en", teamName: "Umoja", accessCode: "UM123456" });
const member = copy.memberRegistrationMail({ locale: "fr", teamName: "Umoja", leaderName: "Amina K." });
const memberEn = copy.memberRegistrationMail({ locale: "en", teamName: "Umoja", leaderName: "Amina K." });
const news = copy.newsletterConfirmMail({
  locale: "fr",
  unsubscribeUrl: "http://localhost:3000/fr/desinscription?token=abc",
});
const newsEn = copy.newsletterConfirmMail({
  locale: "en",
  unsubscribeUrl: "https://www.cardanoimpactdrc.org/en/desinscription?token=abc",
});
const announcement = copy.campaignMail({
  locale: "fr",
  subject: "Ouverture",
  body: "Le texte de l'annonce.\n\nDeuxième paragraphe.",
  publicPath: "/fr/annonces/ouverture",
});
const activity = copy.campaignMail({
  locale: "en",
  subject: "Workshop",
  body: "The activity text.",
  publicPath: "/fr/activites/atelier",
});
const results = copy.campaignMail({
  locale: "fr",
  subject: "Résultats",
  body: "Le résultat publié.",
  publicPath: "/fr/resultats",
});
const plainCampaign = copy.campaignMail({
  locale: "fr",
  subject: "Note",
  body: "Message sans page.",
  publicPath: null,
});

for (const mail of [leader, leaderEn, member, memberEn, news, newsEn, announcement, activity, results, plainCampaign]) {
  assert.match(mail.html, /<!DOCTYPE html>/);
  assert.match(mail.html, /#0033AD/);
  assert.match(mail.html, /https:\/\/www\.cardanoimpactdrc\.org\/brand\/logo\.png/);
  assert.match(mail.html, /CIPot-DR Congo/);
  assert.match(mail.html, /cardanoimpactdrc\.org/);
  assert.ok(mail.text.length > 40);
  assert.equal(mail.html.includes("<script"), false);
}

assert.match(leader.html, /Accéder à mon espace équipe/);
assert.match(leader.html, /https:\/\/www\.cardanoimpactdrc\.org\/fr\/equipe/);
assert.match(leader.text, /UM123456/);
assert.match(leader.html, /UM123456/);
assert.match(leaderEn.html, /Access your team space/);
assert.match(leaderEn.html, /https:\/\/www\.cardanoimpactdrc\.org\/en\/equipe/);
assert.match(member.html, /Découvrir le programme/);
assert.match(member.html, /\/fr\/programme/);
assert.match(memberEn.html, /Explore the program/);
assert.equal(member.html.includes("UM123456"), false);
assert.equal(member.text.includes("UM123456"), false);
assert.match(news.html, /Découvrir CIPot-DR Congo/);
assert.match(news.html, /Times New Roman/);
assert.match(news.text, /Nous sommes heureux de vous accueillir/);
assert.match(news.text, /Cardano Impact Pot – RD Congo/);
assert.match(news.html, /Se désinscrire/);
assert.ok(news.html.indexOf("Bonjour") < news.html.indexOf("/brand/logo.png"));
assert.match(news.html, /http:\/\/localhost:3000\/fr\/desinscription\?token=abc/);
assert.match(news.text, /token=abc/);
assert.equal(news.unsubscribeUrl, "http://localhost:3000/fr/desinscription?token=abc");
assert.match(newsEn.html, /Explore CIPot-DR Congo/);
assert.match(announcement.html, /Lire l'annonce/);
assert.match(announcement.html, /\/fr\/annonces\/ouverture/);
assert.match(announcement.html, /Lire cette page en anglais/);
assert.match(announcement.html, /\/en\/annonces\/ouverture/);
assert.match(activity.html, /Explore the activity/);
assert.match(activity.html, /\/fr\/activites\/atelier/);
assert.match(results.html, /Consulter les résultats/);
assert.match(results.html, /\/fr\/resultats/);
assert.equal(plainCampaign.html.includes("bgcolor=\"#0033AD\" style=\"background:#0033AD;border-radius:4px;\""), false);
assert.match(announcement.html, /Si le bouton ne s&#39;affiche pas|Si le bouton ne s'affiche pas/);
assert.match(leader.html, /L&#39;équipe Cardano Impact DRC|L'équipe Cardano Impact DRC/);
assert.match(leaderEn.text, /Cardano Impact DRC Team/);
const marked = copy.campaignMail({
  locale: "fr",
  subject: "Rappel",
  body: "Le message.\n[[cta:Ouvrir le calendrier]]",
  publicPath: "/fr/calendrier",
  kind: "campaign",
});
assert.match(marked.html, /Ouvrir le calendrier/);
assert.match(marked.html, /\/fr\/calendrier/);
assert.equal(marked.text.includes("[[cta:"), false);
const publication = copy.campaignMail({
  locale: "fr",
  subject: "Atelier",
  body: "Le détail.",
  publicPath: "/fr/activites/atelier",
  kind: "publication",
});
assert.match(publication.text, /Une nouvelle activité est disponible/);
assert.match(publication.html, /Découvrir l'activité/);
assert.equal(copy.newsletterSubject("en"), "Welcome to the CIPot-DR Congo community");

const hostile = copy.campaignMail({
  locale: "fr",
  subject: "<script>",
  body: "<b>bonjour</b>",
  publicPath: "/fr/annonces/test",
});
assert.equal(hostile.html.includes("<script>"), false);
assert.match(hostile.html, /&lt;b&gt;bonjour&lt;\/b&gt;/);
assert.match(hostile.html, /&lt;script&gt;/);

rmSync(dir, { recursive: true, force: true });
console.log("email copy: ok");
