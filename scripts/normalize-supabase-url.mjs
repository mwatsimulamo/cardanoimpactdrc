import { readFileSync, writeFileSync } from "node:fs";

const path = ".env.local";
const text = readFileSync(path, "utf8");
const match = text.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m);
if (!match) {
  console.log(JSON.stringify({ ok: false, reason: "url-line-missing" }));
  process.exit(1);
}

let value = match[1].trim();
if (
  (value.startsWith('"') && value.endsWith('"')) ||
  (value.startsWith("'") && value.endsWith("'"))
) {
  value = value.slice(1, -1);
}

const parsed = new URL(value);
const origin = parsed.origin;
const previousPath = parsed.pathname;
const next = text.replace(/^NEXT_PUBLIC_SUPABASE_URL=.*$/m, `NEXT_PUBLIC_SUPABASE_URL=${origin}`);
writeFileSync(path, next);

console.log(
  JSON.stringify({
    ok: true,
    previousPath,
    nowPath: new URL(origin).pathname,
    rewritten: previousPath !== "/" && previousPath !== "",
  }),
);
