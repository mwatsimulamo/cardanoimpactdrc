import "server-only";

import { canonicalOrigin } from "@/lib/metadata";
import type { Locale } from "@/lib/locales";

export const mailLogoUrl = `${canonicalOrigin}/brand/logo.png`;

export type MailBody = {
  text: string;
  html: string;
  unsubscribeUrl?: string;
};

export type MailContent = {
  locale: Locale;
  preheader: string;
  heading: string;
  paragraphs: readonly string[];
  notes?: readonly string[];
  details?: readonly { label: string; value: string }[];
  action?: { label: string; href: string } | null;
  extraLinks?: readonly { label: string; href: string }[];
  unsubscribeUrl?: string;
  closing?: string;
  serif?: boolean;
  headerLogo?: boolean;
  signatureBeside?: boolean;
  organization?: string;
  unsubscribeLead?: string;
};

const LOGO_WIDTH = 80;
const LOGO_HEIGHT = 98;
const SIGNATURE_WIDTH = 48;
const SIGNATURE_HEIGHT = 59;
const BESIDE_WIDTH = 72;
const BESIDE_HEIGHT = 88;
const SANS = "Arial,Helvetica,sans-serif";
const SERIF = "Times New Roman,Times,serif";

export function renderMail(content: MailContent): MailBody {
  const voice = content.locale === "en" ? englishVoice : frenchVoice;
  const action = content.action && safeHref(content.action.href) ? content.action : null;
  const extraLinks = (content.extraLinks ?? []).filter((link) => safeHref(link.href));
  const unsubscribeUrl = content.unsubscribeUrl && safeHref(content.unsubscribeUrl) ? content.unsubscribeUrl : undefined;
  const text = plainText(content, voice, action, extraLinks, unsubscribeUrl);
  const html = htmlDocument(content, voice, action, extraLinks, unsubscribeUrl);
  return { text, html, unsubscribeUrl };
}

const frenchVoice = {
  team: "L'équipe Cardano Impact DRC",
  fallback: "Si le bouton ne s'affiche pas, ouvrez cette adresse :",
  unsubscribeLead: "Vous pouvez vous désinscrire à tout moment à partir de ce lien :",
  unsubscribeLabel: "Se désinscrire",
};

const englishVoice = {
  team: "Cardano Impact DRC Team",
  fallback: "If the button does not appear, open this address:",
  unsubscribeLead: "You can unsubscribe at any time from this link:",
  unsubscribeLabel: "Unsubscribe",
};

function plainText(
  content: MailContent,
  voice: typeof frenchVoice,
  action: { label: string; href: string } | null,
  extraLinks: readonly { label: string; href: string }[],
  unsubscribeUrl: string | undefined,
): string {
  const lines = [content.heading, ""];
  for (const paragraph of content.paragraphs) {
    lines.push(paragraph, "");
  }
  for (const detail of content.details ?? []) {
    lines.push(`${detail.label} : ${detail.value}`);
  }
  if ((content.details ?? []).length > 0) {
    lines.push("");
  }
  for (const note of content.notes ?? []) {
    lines.push(note, "");
  }
  if (action) {
    lines.push(`${action.label} : ${action.href}`, "");
  }
  if (content.closing) {
    lines.push(content.closing, "");
  }
  for (const link of extraLinks) {
    lines.push(`${link.label} : ${link.href}`);
  }
  if (extraLinks.length > 0) {
    lines.push("");
  }
  lines.push(voice.team);
  if (content.organization) {
    lines.push(content.organization);
  }
  lines.push(canonicalOrigin, "");
  if (unsubscribeUrl) {
    lines.push(`${content.unsubscribeLead ?? voice.unsubscribeLead} ${voice.unsubscribeLabel}`, unsubscribeUrl, "");
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

function htmlDocument(
  content: MailContent,
  voice: typeof frenchVoice,
  action: { label: string; href: string } | null,
  extraLinks: readonly { label: string; href: string }[],
  unsubscribeUrl: string | undefined,
): string {
  const font = content.serif ? SERIF : SANS;
  const paragraphs = content.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-family:${font};font-size:16px;line-height:1.6;color:#1b2430;">${richText(paragraph)}</p>`,
    )
    .join("");
  const notes = (content.notes ?? [])
    .map(
      (note) =>
        `<p style="margin:0 0 12px;font-family:${font};font-size:15px;line-height:1.55;color:#3d4a5c;">${richText(note)}</p>`,
    )
    .join("");
  const details = (content.details ?? [])
    .map(
      (detail) =>
        `<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#5c6b82;">${escapeHtml(detail.label)}</p><p style="margin:0;font-family:Consolas,Courier New,monospace;font-size:20px;line-height:1.4;font-weight:bold;letter-spacing:0.08em;color:#0b1b3a;">${escapeHtml(detail.value)}</p>`,
    )
    .join("");
  const detailBlock =
    details.length > 0
      ? `<tr><td style="padding:0 24px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6f8;"><tr><td style="padding:16px 18px;">${details}</td></tr></table></td></tr>`
      : "";
  const noteBlock = notes.length > 0 ? `<tr><td style="padding:8px 24px 0;">${notes}</td></tr>` : "";
  const actionBlock = action
    ? `<tr><td style="padding:8px 24px 0;">${button(action.label, action.href, font)}${fallbackLine(voice.fallback, action.href, font)}</td></tr>`
    : "";
  const closingBlock = content.closing
    ? `<tr><td style="padding:16px 24px 0;"><p style="margin:0;font-family:${font};font-size:16px;line-height:1.6;color:#1b2430;">${richText(content.closing)}</p></td></tr>`
    : "";
  const extraBlock =
    extraLinks.length > 0
      ? `<tr><td style="padding:12px 24px 0;">${extraLinks
          .map(
            (link) =>
              `<p style="margin:0 0 8px;font-family:${font};font-size:14px;line-height:1.5;"><a href="${escapeHtml(link.href)}" style="color:#0033AD;">${escapeHtml(link.label)}</a></p>`,
          )
          .join("")}</td></tr>`
      : "";
  const unsubscribeLead = content.unsubscribeLead ?? voice.unsubscribeLead;
  const unsubscribeBlock = unsubscribeUrl
    ? `<tr><td style="padding:20px 24px 0;"><p style="margin:0;font-family:${font};font-size:14px;line-height:1.5;color:#3d4a5c;">${escapeHtml(unsubscribeLead)} <a href="${escapeHtml(unsubscribeUrl)}" style="color:#0033AD;font-weight:bold;">${escapeHtml(voice.unsubscribeLabel)}</a></p></td></tr>`
    : "";
  const headerLogo = content.headerLogo === false
    ? ""
    : `<tr><td style="padding:28px 24px 8px;">
<img src="${mailLogoUrl}" width="${LOGO_WIDTH}" height="${LOGO_HEIGHT}" alt="CIPot-DR Congo" style="display:block;border:0;outline:none;text-decoration:none;width:${LOGO_WIDTH}px;height:${LOGO_HEIGHT}px;">
<p style="margin:12px 0 0;font-family:${font};font-size:14px;line-height:1.4;font-weight:bold;color:#0033AD;">CIPot-DR Congo</p>
</td></tr>`;
  const signature = content.signatureBeside
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding:0 16px 0 0;"><img src="${mailLogoUrl}" width="${BESIDE_WIDTH}" height="${BESIDE_HEIGHT}" alt="" style="display:block;border:0;outline:none;text-decoration:none;width:${BESIDE_WIDTH}px;height:${BESIDE_HEIGHT}px;"></td>
<td valign="middle">
<p style="margin:0;font-family:${font};font-size:16px;line-height:1.4;font-weight:bold;color:#0b1b3a;">${escapeHtml(voice.team)}</p>
${content.organization ? `<p style="margin:4px 0 0;font-family:${font};font-size:15px;line-height:1.4;color:#1b2430;">${escapeHtml(content.organization)}</p>` : ""}
<p style="margin:4px 0 0;font-family:${font};font-size:15px;line-height:1.5;"><a href="${canonicalOrigin}" style="color:#0033AD;text-decoration:underline;">${canonicalOrigin}</a></p>
</td></tr></table>`
    : `<img src="${mailLogoUrl}" width="${SIGNATURE_WIDTH}" height="${SIGNATURE_HEIGHT}" alt="" style="display:block;border:0;outline:none;text-decoration:none;width:${SIGNATURE_WIDTH}px;height:${SIGNATURE_HEIGHT}px;">
<p style="margin:12px 0 0;font-family:${font};font-size:15px;line-height:1.4;font-weight:bold;color:#0b1b3a;">${escapeHtml(voice.team)}</p>
<p style="margin:6px 0 0;font-family:${font};font-size:14px;line-height:1.5;"><a href="${canonicalOrigin}" style="color:#0033AD;text-decoration:underline;">${canonicalOrigin.replace("https://", "")}</a></p>`;

  return `<!DOCTYPE html>
<html lang="${content.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(content.heading)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(content.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f4f6f8;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;">
<tr><td style="padding:0;font-size:0;line-height:0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td width="78%" height="4" bgcolor="#0033AD" style="background:#0033AD;font-size:0;line-height:0;">&nbsp;</td>
<td width="14%" height="4" bgcolor="#F7D117" style="background:#F7D117;font-size:0;line-height:0;">&nbsp;</td>
<td width="8%" height="4" bgcolor="#CE1126" style="background:#CE1126;font-size:0;line-height:0;">&nbsp;</td>
</tr>
</table>
</td></tr>
${headerLogo}
<tr><td style="padding:28px 24px 0;">
<h1 style="margin:0 0 16px;font-family:${font};font-size:24px;line-height:1.3;font-weight:bold;color:#0b1b3a;">${escapeHtml(content.heading)}</h1>
${paragraphs}
</td></tr>
${detailBlock}
${noteBlock}
${actionBlock}
${closingBlock}
${extraBlock}
<tr><td style="padding:24px 24px 8px;">
${signature}
</td></tr>
${unsubscribeBlock}
<tr><td style="padding:0 0 28px;"></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function button(label: string, href: string, font: string): string {
  const safe = escapeHtml(href);
  const text = escapeHtml(label);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" bgcolor="#0033AD" style="background:#0033AD;border-radius:4px;">
<a href="${safe}" style="display:inline-block;padding:12px 22px;font-family:${font};font-size:16px;line-height:1.2;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:4px;"><span style="color:#ffffff;">${text}</span></a>
</td></tr>
</table>`;
}

function fallbackLine(label: string, href: string, font: string): string {
  const safe = escapeHtml(href);
  return `<p style="margin:10px 0 0;font-family:${font};font-size:13px;line-height:1.5;color:#5c6b82;">${escapeHtml(label)} <a href="${safe}" style="color:#0033AD;word-break:break-all;">${safe}</a></p>`;
}

function richText(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHref(value: string): boolean {
  return /^https:\/\/www\.cardanoimpactdrc\.org(\/|$)/.test(value) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(value);
}
