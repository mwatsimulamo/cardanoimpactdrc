export const FORUM_USERNAME_MAX = 60;
export const FORUM_URL_MAX = 500;
export const ARTICLE_TITLE_MAX = 200;
export const ARTICLE_SUMMARY_MAX = 300;

export function isForumUsername(value: string): boolean {
  const username = value.trim();
  return username.length >= 1 && username.length <= FORUM_USERNAME_MAX && !/[\s@/]/.test(username);
}

export function isForumUrl(value: string): boolean {
  if (value.trim().length > FORUM_URL_MAX) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "forum.cardano.org" && url.pathname.length > 1;
  } catch {
    return false;
  }
}
