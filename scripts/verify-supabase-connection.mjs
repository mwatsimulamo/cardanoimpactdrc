import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { createBrowserClient, createServerClient } from "@supabase/ssr";

function parseEnvFile(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 1) continue;
    const name = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[name] = value;
  }
  return env;
}

function keyKind(value) {
  if (!value) return "missing";
  if (value.startsWith("sb_publishable_")) return "sb_publishable";
  if (value.startsWith("sb_secret_")) return "sb_secret";
  if (value.startsWith("eyJ")) return "jwt";
  return "other";
}

function jwtRole(value) {
  if (keyKind(value) !== "jwt") return null;
  try {
    const payload = JSON.parse(Buffer.from(value.split(".")[1], "base64url").toString("utf8"));
    return typeof payload.role === "string" ? payload.role : "unknown";
  } catch {
    return "undecodable";
  }
}

function urlShape(value) {
  try {
    const parsed = new URL(value);
    return {
      https: parsed.protocol === "https:",
      supabaseHost: parsed.hostname.endsWith(".supabase.co") || parsed.hostname.endsWith(".supabase.net"),
      pathname: parsed.pathname || "/",
    };
  } catch {
    return { https: false, supabaseHost: false, pathname: "invalid" };
  }
}

function summarizeError(error) {
  if (!error) return null;
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/https?:\/\/[^\s)]+/g, "[url]").slice(0, 180);
}

const env = parseEnvFile(join(process.cwd(), ".env.local"));
const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const publishable = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
const service = env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
const publicKey = publishable || anon;

const report = {
  node: process.version,
  url: { present: Boolean(url), ...urlShape(url) },
  publishableKey: { present: Boolean(publishable), length: publishable.length, kind: keyKind(publishable), jwtRole: jwtRole(publishable) },
  anonKey: { present: Boolean(anon), length: anon.length, kind: keyKind(anon), jwtRole: jwtRole(anon) },
  serviceRoleKey: { present: Boolean(service), length: service.length, kind: keyKind(service), jwtRole: jwtRole(service) },
  publicKeySource: publishable ? "publishable" : anon ? "anon" : "missing",
  serviceDistinctFromPublic: Boolean(service) && service !== publicKey,
};

const clients = {};
const connectivity = {};

if (!url || !publicKey) {
  report.blocked = "public url or key missing";
} else {
  try {
    const supabase = createClient(url, publicKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    clients.publicCreateClient = "ok";
    const session = await supabase.auth.getSession();
    clients.getSession = session.error ? summarizeError(session.error) : { ok: true, hasSession: Boolean(session.data.session) };
    const claims = await supabase.auth.getClaims();
    clients.getClaims = claims.error ? summarizeError(claims.error) : { ok: true, hasClaims: Boolean(claims.data) };
  } catch (error) {
    clients.publicCreateClient = summarizeError(error);
  }

  try {
    const browser = createBrowserClient(url, publicKey);
    clients.browserClient = typeof browser?.auth?.getSession === "function" ? "ok" : "missing-auth";
  } catch (error) {
    clients.browserClient = summarizeError(error);
  }

  try {
    const server = createServerClient(url, publicKey, {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    });
    const claims = await server.auth.getClaims();
    clients.serverSsrClient = claims.error ? summarizeError(claims.error) : { ok: true };
  } catch (error) {
    clients.serverSsrClient = summarizeError(error);
  }

  if (service && service !== publicKey) {
    try {
      const admin = createClient(url, service, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const session = await admin.auth.getSession();
      clients.serviceRoleClient = session.error ? summarizeError(session.error) : { ok: true };
    } catch (error) {
      clients.serviceRoleClient = summarizeError(error);
    }
  } else {
    clients.serviceRoleClient = "skipped";
  }

  const origin = new URL(url).origin;

  async function ping(base, pathname, key) {
    const response = await fetch(`${base}${pathname}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
    });
    const text = await response.text();
    return {
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get("content-type"),
      bytes: text.length,
      snippet: text
        .replace(/https?:\/\/[^\s"']+/g, "[url]")
        .replace(/"host"\s*:\s*"[^"]+"/g, '"host":"[redacted]"')
        .slice(0, 120),
    };
  }

  const key = publicKey;
  try {
    connectivity.authSettings = await ping(origin, "/auth/v1/settings", key);
  } catch (error) {
    connectivity.authSettings = summarizeError(error);
  }
  try {
    connectivity.restRootPublic = await ping(origin, "/rest/v1/", key);
  } catch (error) {
    connectivity.restRootPublic = summarizeError(error);
  }
  if (service && service !== publicKey) {
    try {
      connectivity.restRootService = await ping(origin, "/rest/v1/", service);
    } catch (error) {
      connectivity.restRootService = summarizeError(error);
    }
  }
}

report.clients = clients;
report.connectivity = connectivity;
console.log(JSON.stringify(report, null, 2));
