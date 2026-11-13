/**
 * Validation partagée des courriels (newsletter + équipes).
 * Sans dépendance Node : utilisable côté client et serveur.
 */

const EMAIL_MAX = 254;
const LOCAL_MAX = 64;

/** Domaines jetables, de test ou non livrables courants. */
const BLOCKED_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.org",
  "sharklasers.com",
  "grr.la",
  "yopmail.com",
  "yopmail.fr",
  "tempmail.com",
  "temp-mail.org",
  "throwaway.email",
  "10minutemail.com",
  "trashmail.com",
  "fakeinbox.com",
  "getnada.com",
  "moakt.com",
  "dispostable.com",
  "mailnesia.com",
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "test.org",
  "localhost",
  "invalid",
]);

/** TLD souvent mal saisis ou non publics. */
const BLOCKED_TLDS = new Set(["con", "cmo", "local", "invalid", "test", "example", "localhost"]);

/** Fautes fréquentes sur des fournisseurs connus. */
const TYPO_DOMAINS = new Set([
  "gmial.com",
  "gmal.com",
  "gamil.com",
  "gnail.com",
  "gmaill.com",
  "hotnail.com",
  "hotmial.com",
  "outlok.com",
  "outllok.com",
  "yahooo.com",
  "yaho.com",
]);

export function normalizeEmailAddress(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (!isValidEmailAddress(email)) {
    return null;
  }

  return email;
}

export function isValidEmailAddress(value: string): boolean {
  const email = value.trim().toLowerCase();
  if (email.length === 0 || email.length > EMAIL_MAX) {
    return false;
  }

  if (email.includes("..") || email.includes(" ") || email.startsWith(".") || email.endsWith(".")) {
    return false;
  }

  const at = email.indexOf("@");
  if (at <= 0 || at !== email.lastIndexOf("@")) {
    return false;
  }

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length === 0 || local.length > LOCAL_MAX || domain.length < 3) {
    return false;
  }

  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) {
    return false;
  }
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return false;
  }

  if (
    !/^[a-z0-9.-]+$/i.test(domain) ||
    domain.startsWith("-") ||
    domain.endsWith("-") ||
    domain.startsWith(".") ||
    domain.endsWith(".")
  ) {
    return false;
  }

  const labels = domain.split(".");
  if (labels.length < 2) {
    return false;
  }

  for (const label of labels) {
    if (label.length === 0 || label.length > 63 || label.startsWith("-") || label.endsWith("-")) {
      return false;
    }
    if (!/^[a-z0-9-]+$/i.test(label)) {
      return false;
    }
  }

  const tld = labels[labels.length - 1] ?? "";
  if (tld.length < 2 || !/^[a-z]{2,24}$/i.test(tld) || BLOCKED_TLDS.has(tld)) {
    return false;
  }

  if (BLOCKED_DOMAINS.has(domain) || TYPO_DOMAINS.has(domain)) {
    return false;
  }

  if (local.length === 1 && labels.every((label) => label.length <= 2)) {
    return false;
  }

  return true;
}
