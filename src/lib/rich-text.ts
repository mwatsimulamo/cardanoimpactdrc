const ALLOWED = new Set([
  "p",
  "br",
  "strong",
  "em",
  "u",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
  "hr",
]);
const RENAME: Record<string, string> = { b: "strong", i: "em", div: "p" };
const ALIGNABLE = new Set(["p", "h1", "h2", "h3", "blockquote", "li"]);
const IMAGE_SRC =
  /^data:image\/(?:jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=\s]+$/i;

/** Limite du HTML riche enregistré (images data URL comprises). */
export const RICH_TEXT_MAX_CHARS = 1_500_000;

/** Taille maximale d'une image inline collée ou insérée. */
export const INLINE_IMAGE_MAX_BYTES = Math.floor(3.5 * 1024 * 1024);

export function sanitizeRichText(value: string): string {
  return value.replace(/<!--[\s\S]*?-->/g, "").replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (/script|style|iframe/i.test(tag)) {
      return "";
    }

    const name = RENAME[tag] ?? tag;
    if (!ALLOWED.has(name)) {
      return "";
    }

    if (name === "br") {
      return "<br>";
    }

    if (name === "hr") {
      return match.startsWith("</") ? "" : "<hr>";
    }

    if (match.startsWith("</")) {
      return `</${name}>`;
    }

    if (name === "a") {
      const href = /\shref\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(rawAttrs);
      const target = href?.[1] ?? href?.[2] ?? "";
      if (!isSafeArticleHref(target)) {
        return "";
      }

      return `<a href="${escapeAttr(target)}">`;
    }

    if (name === "img") {
      const srcMatch = /\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(rawAttrs);
      const altMatch = /\salt\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(rawAttrs);
      const src = (srcMatch?.[1] ?? srcMatch?.[2] ?? "").replace(/\s+/g, "");
      const alt = altMatch?.[1] ?? altMatch?.[2] ?? "";
      if (!IMAGE_SRC.test(src)) {
        return "";
      }

      return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}">`;
    }

    const align = ALIGNABLE.has(name) ? readAlign(rawAttrs) : "";
    return align ? `<${name} style="text-align: ${align}">` : `<${name}>`;
  });
}

export function isRichText(value: string): boolean {
  return /<\/?(p|br|strong|em|u|h1|h2|h3|ul|ol|li|blockquote|a|img|hr|b|i|div)\b/i.test(value);
}

export function plainExcerpt(value: string, max = 220): string {
  const plain = sanitizeRichText(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) {
    return plain;
  }

  return `${plain.slice(0, max - 1).trimEnd()}…`;
}

/** Première image inline du texte riche (data URL), pour les cartes. */
export function firstRichImage(value: string): string | null {
  const match = /<img\b[^>]*\ssrc\s*=\s*(?:"([^"]+)"|'([^']+)')/i.exec(sanitizeRichText(value));
  const src = (match?.[1] ?? match?.[2] ?? "").trim();
  return src.length > 0 ? src : null;
}

function readAlign(attrs: string): "left" | "justify" | "" {
  const style = /text-align\s*:\s*(left|justify)/i.exec(attrs);
  const attr = /\salign\s*=\s*["']?(left|justify)/i.exec(attrs);
  const value = (style?.[1] ?? attr?.[1] ?? "").toLowerCase();
  return value === "left" || value === "justify" ? value : "";
}

function isSafeArticleHref(value: string): boolean {
  return /^https:\/\/[^\s"]+$/i.test(value) || /^\/(fr|en)(\/[a-z0-9-]+)*$/.test(value);
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "");
}
