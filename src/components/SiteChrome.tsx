"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { ContactChannels } from "@/components/ContactChannels";
import { NewsletterForm } from "@/components/NewsletterForm";
import type { Locale } from "@/lib/locales";

export type ChromeLink = {
  href: string;
  label: string;
};

type ChromeProps = {
  locale: Locale;
  homeHref: string;
  wordmark: string;
  place: string;
  menuLabel: string;
  closeLabel: string;
  languageLabel: string;
  navigationLabel: string;
  nav: readonly ChromeLink[];
  programMenu: readonly ChromeLink[];
  activitiesMenu: readonly ChromeLink[];
  informationMenu: readonly ChromeLink[];
  register: ChromeLink;
  footerProgram: string;
  footerRights: string;
  footerCredit: string;
  footerInformation: string;
  footerParticipate: string;
  footerContact: string;
  followX: string;
  joinWhatsApp: string;
  newsletter: {
    title: string;
    lede: string;
    email: string;
    name: string;
    consent: string;
    submit: string;
    saved: string;
    already: string;
    invalid: string;
    missing: string;
    error: string;
  };
  organizerEmail: string;
  organizerXUrl: string;
  whatsappInvitationUrl: string | null;
  opensNewTab: string;
  localeNames: Record<Locale, string>;
};

function isAdminPath(pathname: string): boolean {
  return /^\/(fr|en)\/admin(\/|$)/.test(pathname);
}

function withLocale(pathname: string, next: Locale): string {
  const stripped = pathname.replace(/^\/(fr|en)(?=\/|$)/, "");
  return stripped.length === 0 ? `/${next}` : `/${next}${stripped}`;
}

function linkPath(href: string): string {
  return href.split("#")[0];
}

function isCurrent(pathname: string, href: string, homeHref: string): boolean {
  const path = linkPath(href);
  if (path === homeHref) {
    return pathname === homeHref;
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}

function itemIsCurrent(pathname: string, href: string, homeHref: string, hash: string): boolean {
  const fragment = href.split("#")[1];
  if (!fragment) {
    return isCurrent(pathname, href, homeHref);
  }

  if (fragment === "section-galerie" && /(^|\/)galerie(\/|$)/.test(pathname)) {
    return hash === "" || hash === `#${fragment}`;
  }
  if (fragment === "section-contact" && /(^|\/)contact(\/|$)/.test(pathname)) {
    return hash === "" || hash === `#${fragment}`;
  }
  if (fragment === "section-annonces" && /(^|\/)annonces(\/|$)/.test(pathname) && (hash === "" || hash === `#${fragment}`)) {
    return true;
  }
  if (fragment === "section-activites" && /(^|\/)activites(\/|$)/.test(pathname) && (hash === "" || hash === `#${fragment}`)) {
    return true;
  }

  return isCurrent(pathname, linkPath(href), homeHref) && hash === `#${fragment}`;
}

function groupIsCurrent(
  pathname: string,
  homeHref: string,
  items: readonly ChromeLink[],
  aliases: readonly string[],
): boolean {
  if (items.some((item) => isCurrent(pathname, linkPath(item.href), homeHref))) {
    return true;
  }

  return aliases.some((alias) => {
    const full = homeHref.endsWith("/") ? `${homeHref}${alias}` : `${homeHref}/${alias}`;
    return pathname === full || pathname.startsWith(`${full}/`);
  });
}

const barLink =
  "inline-flex min-h-12 items-center gap-2 text-base text-white transition-colors duration-150 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const actionButton =
  "inline-flex min-h-12 items-center justify-center bg-white px-5 text-base font-semibold text-action transition-colors duration-150 hover:bg-[#e7eef8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function SiteHeader(props: ChromeProps) {
  const pathname = usePathname();
  const menuId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [groupState, setGroupState] = useState<{ path: string; id: string } | null>(null);
  const [hash, setHash] = useState("");
  const open = openPath === pathname;
  const groupId = groupState?.path === pathname ? groupState.id : null;
  const registerCurrent = isCurrent(pathname, props.register.href, props.homeHref);
  const home = pickLinks(props.nav, props.homeHref, [""])[0];
  const faq = pickLinks(props.nav, props.homeHref, ["faq"])[0];
  const activities = pickLinks(props.nav, props.homeHref, ["activites"])[0];
  const groups = [
    {
      id: "program",
      title: props.footerProgram,
      items: props.programMenu,
      aliases: [] as readonly string[],
      direct: false,
    },
    {
      id: "competition",
      title: pickLinks(props.nav, props.homeHref, ["concours"])[0]?.label ?? "",
      items: pickLinks(props.nav, props.homeHref, ["concours", "evaluations", "equipes", "resultats"]),
      aliases: [] as readonly string[],
      direct: false,
    },
    {
      id: "activities",
      title: activities?.label ?? "",
      items: props.activitiesMenu,
      aliases: ["activites", "galerie"],
      direct: false,
    },
    {
      id: "information",
      title: props.footerInformation,
      items: props.informationMenu,
      aliases: ["annonces", "contact"],
      direct: false,
    },
  ];

  useEffect(() => {
    function readHash() {
      setHash(window.location.hash);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenPath(null);
        setGroupState(null);
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setGroupState(null);
      }
    }

    readHash();
    window.addEventListener("hashchange", readHash);
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("hashchange", readHash);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [pathname]);

  function closeMenus() {
    setOpenPath(null);
    setGroupState(null);
    window.setTimeout(() => setHash(window.location.hash), 0);
  }

  if (isAdminPath(pathname)) {
    return null;
  }

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-20">
      <div className="bg-action text-white">
        <div className="flex h-20 w-full items-center justify-between px-5 md:px-8">
          <Link href={props.homeHref} className="inline-flex min-w-0 shrink items-center gap-3 leading-none">
            <BrandMark />
            <span className="min-w-0">
              <span className="block truncate text-lg font-semibold">{props.wordmark}</span>
              <span className="mt-0.5 block text-[0.8125rem] leading-[1.3] text-white/80">{props.place}</span>
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 self-stretch items-center justify-center min-[1120px]:flex" aria-label={props.navigationLabel}>
            <ul className="flex h-full items-stretch">
              {home ? (
                <li className="relative flex items-center self-stretch">
                  <BarLink item={home} pathname={pathname} homeHref={props.homeHref} hash={hash} onNavigate={closeMenus} />
                  {isCurrent(pathname, home.href, props.homeHref) ? <MenuMark /> : null}
                </li>
              ) : null}
              {groups.map((group) => {
                if (group.direct) {
                  const item = group.items[0];
                  if (!item) {
                    return null;
                  }
                  return (
                    <li key={group.id} className="relative flex items-center self-stretch">
                      <BarLink item={item} pathname={pathname} homeHref={props.homeHref} hash={hash} onNavigate={closeMenus} />
                      {isCurrent(pathname, item.href, props.homeHref) ? <MenuMark /> : null}
                    </li>
                  );
                }

                const groupCurrent = groupIsCurrent(pathname, props.homeHref, group.items, group.aliases);
                return (
                <li key={group.id} className="relative flex items-center self-stretch">
                  <button
                    type="button"
                    className={`${barLink} px-4`}
                    aria-expanded={groupId === group.id}
                    aria-controls={`${menuId}-${group.id}`}
                    onClick={() =>
                      setGroupState(groupId === group.id ? null : { path: pathname, id: group.id })
                    }
                  >
                    {group.title}
                    <Chevron open={groupId === group.id} />
                  </button>
                  {groupCurrent ? <MenuMark /> : null}
                  {groupId === group.id ? (
                    <ul
                      id={`${menuId}-${group.id}`}
                      className="absolute left-0 top-full z-30 max-h-[calc(100svh-5rem)] min-w-80 overflow-y-auto overscroll-contain border border-white/30 bg-action py-2"
                    >
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <BarLink
                            item={item}
                            pathname={pathname}
                            homeHref={props.homeHref}
                            hash={hash}
                            onNavigate={closeMenus}
                            wide
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-3 self-stretch">
            {faq ? (
              <div className="relative hidden items-center self-stretch min-[1120px]:flex">
                <BarLink item={faq} pathname={pathname} homeHref={props.homeHref} hash={hash} onNavigate={closeMenus} />
                {isCurrent(pathname, faq.href, props.homeHref) ? <MenuMark /> : null}
              </div>
            ) : null}
            <LanguageSwitch
              pathname={pathname}
              locale={props.locale}
              localeNames={props.localeNames}
              label={props.languageLabel}
              className="hidden min-[1120px]:inline-flex"
            />
            <div className="relative flex items-center self-stretch">
              <Link
                href={props.register.href}
                aria-current={registerCurrent ? "page" : undefined}
                className={actionButton}
              >
                {props.register.label}
              </Link>
              {registerCurrent ? <MenuMark /> : null}
            </div>
            <button
              type="button"
              className={`${barLink} font-semibold min-[1120px]:hidden`}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpenPath(open ? null : pathname)}
            >
              {open ? props.closeLabel : props.menuLabel}
            </button>
          </div>
        </div>

        {open ? (
          <nav
            id={menuId}
            className="max-h-[calc(100svh-5rem)] overflow-y-auto overscroll-contain border-t border-white/20 bg-action px-5 pb-4 text-white min-[1120px]:hidden md:px-8"
            aria-label={props.menuLabel}
          >
            <ul className="pt-2">
              {home ? (
                <li className="relative">
                  <BarLink item={home} pathname={pathname} homeHref={props.homeHref} hash={hash} onNavigate={closeMenus} wide flush />
                  {isCurrent(pathname, home.href, props.homeHref) ? <MenuMark inline /> : null}
                </li>
              ) : null}
              {groups.map((group) => {
                if (group.direct) {
                  const item = group.items[0];
                  if (!item) {
                    return null;
                  }
                  return (
                    <li key={group.id} className="relative">
                      <BarLink item={item} pathname={pathname} homeHref={props.homeHref} hash={hash} onNavigate={closeMenus} wide flush />
                      {isCurrent(pathname, item.href, props.homeHref) ? <MenuMark inline /> : null}
                    </li>
                  );
                }

                return (
                <li key={group.id} className="mt-2">
                  <p className="pt-2 text-[0.8125rem] font-semibold text-white/80">{group.title}</p>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <BarLink
                          item={item}
                          pathname={pathname}
                          homeHref={props.homeHref}
                          hash={hash}
                          onNavigate={closeMenus}
                          wide
                          flush
                        />
                        {itemIsCurrent(pathname, item.href, props.homeHref, hash) ? <MenuMark inline /> : null}
                      </li>
                    ))}
                  </ul>
                </li>
                );
              })}
              {faq ? (
                <li className="relative mt-3">
                  <BarLink item={faq} pathname={pathname} homeHref={props.homeHref} hash={hash} onNavigate={closeMenus} wide flush />
                  {isCurrent(pathname, faq.href, props.homeHref) ? <MenuMark inline /> : null}
                </li>
              ) : null}
              <li className="mt-3">
                <LanguageSwitch
                  pathname={pathname}
                  locale={props.locale}
                  localeNames={props.localeNames}
                  label={props.languageLabel}
                  className="inline-flex"
                  flow
                />
              </li>
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}

export function SiteFooter(props: ChromeProps) {
  const pathname = usePathname();
  if (isAdminPath(pathname)) {
    return null;
  }

  const participatePaths = ["concours", "resultats"];
  const footerProgram = props.programMenu.filter(
    (item) =>
      !item.href.includes("feuille-de-route") &&
      !item.href.includes("#organizer-contact") &&
      !item.href.includes("#program-contact"),
  );

  return (
    <footer className="mt-auto text-white">
      <div className="relative">
        <div className="absolute inset-x-0 top-1/2 bottom-0 bg-action" aria-hidden="true" />
        <div className="relative mx-auto max-w-[46rem] px-5 py-5">
          <NewsletterForm locale={props.locale} copy={props.newsletter} />
        </div>
      </div>
      <div className="bg-action">
      <div className="mx-auto max-w-[72rem] px-5 pb-12 pt-4 md:px-8 md:pb-16">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <BrandMark className="h-14 w-auto self-start" />
            <p className="mt-3 text-lg font-semibold leading-none">{props.wordmark}</p>
            <p className="mt-3 text-[0.9375rem] leading-[1.5] text-white/80">{props.place}</p>
          </div>
          <FooterMenu
            title={props.footerProgram}
            pathname={pathname}
            homeHref={props.homeHref}
            items={footerProgram}
          />
          <div>
            <p className="text-[0.9375rem] font-semibold">{props.footerParticipate}</p>
            <Link
              href={props.register.href}
              aria-current={isCurrent(pathname, props.register.href, props.homeHref) ? "page" : undefined}
              className={`${actionButton} mt-4`}
            >
              {props.register.label}
            </Link>
            <ul className="mt-2">
              {pickLinks(props.nav, props.homeHref, participatePaths).map((item) => {
                const current = isCurrent(pathname, item.href, props.homeHref);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center text-[0.9375rem] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                        current ? "font-semibold underline decoration-white underline-offset-[3px]" : "hover:underline"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h2 className="text-[0.9375rem] font-semibold">{props.footerContact}</h2>
            <ContactChannels
              tone="footer"
              email={props.organizerEmail}
              emailHref={`mailto:${props.organizerEmail}`}
              xLabel={props.followX}
              xHref={props.organizerXUrl}
              whatsappLabel={props.joinWhatsApp}
              whatsappHref={props.whatsappInvitationUrl}
              newTabLabel={props.opensNewTab}
            />
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/25 pt-6 text-[0.9375rem] leading-[1.5] sm:flex-row sm:items-center sm:justify-between">
          <p>cardanoimpactdrc © 2026. {props.footerRights}</p>
          <p>
            {props.footerCredit}{" "}
            <a
              className="underline decoration-white/70 underline-offset-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              href="https://github.com/mwatsimulamo"
              target="_blank"
              rel="noopener noreferrer"
            >
              Olivier Mwatsimulamo
              <span className="sr-only"> ({props.opensNewTab})</span>
            </a>
          </p>
        </div>
      </div>
      </div>
    </footer>
  );
}

function pickLinks(nav: readonly ChromeLink[], homeHref: string, paths: readonly string[]) {
  return paths.flatMap((path) => {
    const href = path.length === 0 ? homeHref : `${homeHref}/${path}`;
    const item = nav.find((link) => link.href === href);
    return item ? [item] : [];
  });
}

function FooterMenu({
  title,
  items,
  pathname,
  homeHref,
}: {
  title: string;
  items: readonly ChromeLink[];
  pathname: string;
  homeHref: string;
}) {
  return (
    <nav aria-label={title}>
      <p className="text-[0.9375rem] font-semibold">{title}</p>
      <ul className="mt-3">
        {items.map((item) => {
          const current = !item.href.includes("#") && isCurrent(pathname, item.href, homeHref);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center text-[0.9375rem] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  current ? "font-semibold underline decoration-white underline-offset-[3px]" : "hover:underline"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function BarLink({
  item,
  pathname,
  homeHref,
  hash,
  onNavigate,
  wide = false,
  flush = false,
}: {
  item: ChromeLink;
  pathname: string;
  homeHref: string;
  hash: string;
  onNavigate: () => void;
  wide?: boolean;
  flush?: boolean;
}) {
  const current = itemIsCurrent(pathname, item.href, homeHref, hash);
  return (
    <Link
      href={item.href}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
      className={`${barLink} ${wide ? "w-full" : ""} ${flush ? "" : "px-4"} ${
        current ? "font-semibold underline decoration-white underline-offset-[3px]" : ""
      }`}
    >
      {item.label}
    </Link>
  );
}

function MenuMark({ inline = false }: { inline?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={
        inline
          ? "block h-1.5 w-7 bg-white"
          : "absolute bottom-0 left-1/2 h-1.5 w-7 -translate-x-1/2 bg-white"
      }
    />
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={`size-3 ${open ? "rotate-180" : ""}`}>
      <path d="M2.25 4.25 6 8l3.75-3.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function LanguageSwitch({
  pathname,
  locale,
  localeNames,
  label,
  className = "",
  flow = false,
}: {
  pathname: string;
  locale: Locale;
  localeNames: Record<Locale, string>;
  label: string;
  className?: string;
  flow?: boolean;
}) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [routeKey, setRouteKey] = useState(`${pathname}:${locale}`);
  const codes: Locale[] = ["fr", "en"];
  const nextRouteKey = `${pathname}:${locale}`;
  if (nextRouteKey !== routeKey) {
    setRouteKey(nextRouteKey);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        className="inline-flex h-11 items-center gap-2 rounded-[2px] bg-white px-4 text-base font-semibold text-action transition-colors duration-150 hover:bg-[#e7eef8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
      >
        <Globe />
        {locale.toUpperCase()}
        <Chevron open={open} />
      </button>
      {open ? (
        <ul
          id={menuId}
          className={
            flow
              ? "mt-2 min-w-48 overflow-hidden border border-[#d5dce6] bg-white py-1"
              : "absolute right-0 top-[calc(100%+0.4rem)] z-30 min-w-48 overflow-hidden border border-[#d5dce6] bg-white py-1"
          }
        >
          {codes.map((code) => {
            const current = code === locale;
            return (
              <li key={code} className="border-b border-[#d5dce6] last:border-b-0">
                <Link
                  href={withLocale(pathname, code)}
                  hrefLang={code}
                  lang={code}
                  aria-current={current ? "true" : undefined}
                  className={`flex min-h-12 items-center gap-3 px-4 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
                    current ? "font-semibold text-action" : "text-[#1b2430] hover:bg-[#e7eef8]"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <span className="w-8 text-[0.8125rem] font-semibold tracking-[0.04em] text-[#5c6b82]">
                    {code.toUpperCase()}
                  </span>
                  {localeNames[code]}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function Globe() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0">
      <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="3.4" ry="8.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 12h16M5.4 8.4h13.2M5.4 15.6h13.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
