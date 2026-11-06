const ALLOWED = new Set(["p", "br", "strong", "em", "h2", "h3", "ul", "ol", "li", "blockquote", "a"]);
const RENAME: Record<string, string> = { b: "strong", i: "em", div: "p" };
const ALIGNABLE = new Set(["p", "h2", "h3", "blockquote", "li"]);

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

    const align = ALIGNABLE.has(name) ? readAlign(rawAttrs) : "";
    return align ? `<${name} style="text-align: ${align}">` : `<${name}>`;
  });
}

export function isRichText(value: string): boolean {
  return /<\/?(p|br|strong|em|h2|h3|ul|ol|li|blockquote|a|b|i|div)\b/i.test(value);
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
