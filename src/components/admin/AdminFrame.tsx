"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useState } from "react";
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
            <div className="space-y-4">
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
      <aside className="border-b border-line bg-canvas md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="px-5 py-6">
          <p className="text-[0.9375rem] font-semibold text-ink">{copy.loginTitle}</p>
          <p className={`mt-2 ${supportText}`}>{dictionary.chrome.wordmark}</p>
        </div>
        <nav className="flex flex-col px-3 pb-4" aria-label={copy.loginTitle}>
          {modules.map((item) => {
            const href = localePath(locale, `admin${item.href}`);
            const current = item.href.length === 0 ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={item.href}
                href={href}
                className={`min-h-11 px-3 py-2 text-[0.9375rem] ${
                  current ? "bg-surface font-semibold text-ink" : "text-muted hover:text-ink"
                }`}
                aria-current={current ? "page" : undefined}
              >
                {copy[item.key]}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col gap-3 px-5 py-4">
          <form action={signOutAdminAction}>
            <button type="submit" className={ghostButton}>
              {copy.logout}
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1 px-5 py-8 md:px-8">
        <p className={supportText}>{copy.previewBanner}</p>
        <div className="mt-8">{children}</div>
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
      <h1 className="text-[2.25rem] font-semibold text-ink">{copy.loginTitle}</h1>
      <p className={`mt-4 ${bodyText}`}>{copy.loginLede}</p>
      <form className="mt-8 space-y-4" action={formAction} noValidate>
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
      {notice ? <div className="mt-4"><StatusMessage tone="warning">{notice}</StatusMessage></div> : null}
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


