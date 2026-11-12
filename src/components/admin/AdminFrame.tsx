"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { bodyText, ghostButton, primaryLink, supportText, textLink } from "@/components/classes";
import { StatusMessage } from "@/components/StatusMessage";
import type { Dictionary } from "@/content/types";
import { signInAdminAction, signOutAdminAction, type AdminSignInFailure } from "@/lib/admin-actions";
import { localePath, type Locale } from "@/lib/locales";

const modules = [
  { href: "", key: "navDashboard" },
  { href: "/calendrier", key: "navCalendar" },
  { href: "/equipes", key: "navTeams" },
  { href: "/annonces", key: "navAnnouncements" },
  { href: "/activites", key: "navActivities" },
  { href: "/galerie", key: "navGallery" },
  { href: "/resultats", key: "navResults" },
  { href: "/pages", key: "navPages" },
  { href: "/historique", key: "navHistory" },
  { href: "/communications", key: "navCommunications" },
] as const;

export function AdminFrame({
  locale,
  dictionary,
  signedIn,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  signedIn: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === localePath(locale, "admin/login");

  return (
    <div className="-mt-20 min-h-svh">
      {isLogin ? children : (
        <AdminShell locale={locale} dictionary={dictionary}>
          {signedIn ? children : (
            <div className="admin-in-up space-y-4">
              <StatusMessage tone="warning">{dictionary.adminUi.unauthorized}</StatusMessage>
              <p>
                <Link className={textLink} href={localePath(locale, "admin/login")}>
                  {dictionary.adminUi.backToLogin}
                </Link>
              </p>
            </div>
          )}
        </AdminShell>
      )}
    </div>
  );
}

function AdminShell({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const copy = dictionary.adminUi;

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="admin-in-left border-b border-line bg-canvas md:sticky md:top-0 md:flex md:h-svh md:w-64 md:shrink-0 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="border-b border-line px-5 py-6">
          <BrandMark alt={dictionary.chrome.wordmark} className="h-12 w-auto self-start" />
          <p className="mt-3 text-[0.9375rem] font-semibold text-ink">{copy.loginTitle}</p>
          <p className={`mt-1 ${supportText}`}>{dictionary.chrome.wordmark}</p>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 py-4 md:min-h-0 md:flex-1 md:overflow-y-auto" aria-label={copy.loginTitle}>
          {modules.map((item, index) => {
            const href = localePath(locale, `admin${item.href}`);
            const current = item.href.length === 0 ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={item.href}
                href={href}
                className={`admin-in-left min-h-11 border-l-2 px-3 py-2 text-[0.9375rem] transition-colors duration-150 ${
                  current
                    ? "border-brand bg-surface font-semibold text-ink"
                    : "border-transparent text-muted hover:border-line hover:bg-surface/60 hover:text-ink"
                }`}
                style={{ ["--admin-delay" as string]: `${80 + index * 35}ms` }}
                aria-current={current ? "page" : undefined}
              >
                {copy[item.key]}
              </Link>
            );
          })}
        </nav>
        <div className="admin-in-up mt-auto flex flex-col gap-3 border-t border-line px-5 py-4" style={{ ["--admin-delay" as string]: "420ms" }}>
          <form action={signOutAdminAction}>
            <button type="submit" className={ghostButton}>
              {copy.logout}
            </button>
          </form>
          <Link className={textLink} href={localePath(locale)}>
            {copy.backToSite}
          </Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="admin-in-right border-b border-line bg-canvas/80 px-5 py-4 md:px-8" style={{ ["--admin-delay" as string]: "80ms" }}>
          <p className={supportText}>{copy.previewBanner}</p>
        </div>
        <div className="px-5 py-8 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}

export function AdminLoginForm({ dictionary }: { dictionary: Dictionary }) {
  const copy = dictionary.adminUi;
  const [state, formAction, pending] = useActionState(signInAdminAction, null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const notice = noticeFor(state, copy);

  return (
    <div className="mx-auto flex min-h-svh max-w-[32rem] flex-col justify-center px-5 py-16">
      <div className="admin-in-left">
        <BrandMark alt={dictionary.chrome.wordmark} className="h-16 w-auto self-start" />
        <h1 className="mt-6 text-[2.25rem] font-semibold text-ink">{copy.loginTitle}</h1>
        <p className={`mt-4 ${bodyText}`}>{copy.loginLede}</p>
      </div>
      <form className="admin-in-right mt-8 space-y-4" action={formAction} noValidate style={{ ["--admin-delay" as string]: "120ms" }}>
        <label className="block text-[0.9375rem] font-semibold text-ink" htmlFor="admin-email">
          {copy.loginEmail}
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="min-h-12 w-full rounded-[2px] border border-line bg-surface px-3 text-ink"
        />
        <label className="block text-[0.9375rem] font-semibold text-ink" htmlFor="admin-password">
          {copy.loginPassword}
        </label>
        <div className="flex min-h-12 items-stretch rounded-[2px] border border-line bg-surface">
          <input
            id="admin-password"
            name="password"
            type={passwordVisible ? "text" : "password"}
            autoComplete="current-password"
            required
            className="min-h-12 min-w-0 flex-1 bg-transparent px-3 text-ink"
          />
          <button
            type="button"
            className="px-3 text-[0.9375rem] font-semibold text-brand"
            aria-pressed={passwordVisible}
            aria-controls="admin-password"
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            {passwordVisible ? copy.hidePassword : copy.showPassword}
          </button>
        </div>
        <button type="submit" className={primaryLink} disabled={pending} aria-busy={pending}>
          {copy.loginSubmit}
        </button>
      </form>
      {notice ? (
        <div className="admin-in-up mt-4" style={{ ["--admin-delay" as string]: "220ms" }}>
          <StatusMessage tone="warning">{notice}</StatusMessage>
        </div>
      ) : null}
    </div>
  );
}

function noticeFor(
  state: AdminSignInFailure | null,
  copy: Dictionary["adminUi"],
): string | null {
  if (state === null) {
    return null;
  }

  return state.status === "unconfigured" ? copy.loginUnconfigured : copy.loginHint;
}
