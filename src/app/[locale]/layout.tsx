import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { ConstellationBackground } from "@/components/ConstellationBackground";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getDictionary } from "@/content/get-dictionary";
import { canonicalOrigin } from "@/lib/metadata";
import { isLocale, localePath, type Locale } from "@/lib/locales";
import { getWhatsappInvitationUrl, organizerEmail, organizerXUrl } from "@/lib/public-contact";
import "../globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-source-sans",
});

export function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return {
    metadataBase: new URL(canonicalOrigin),
    title: {
      absolute: `${dictionary.meta.homeTitle} — ${dictionary.meta.siteName}`,
    },
    description: dictionary.meta.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return (
      <html lang="fr">
        <body className="bg-[#050b1f] p-8 font-sans text-ink">
          <h1 className="text-[2.25rem] font-semibold leading-[1.15]">
            Page introuvable.
          </h1>
          <p className="mt-4">
            <Link href="/fr">Accueil</Link>
          </p>
        </body>
      </html>
    );
  }

  const dictionary = getDictionary(locale);
  const chrome = {
    locale,
    homeHref: localePath(locale),
    wordmark: dictionary.chrome.wordmark,
    place: dictionary.chrome.place,
    menuLabel: dictionary.chrome.menu,
    closeLabel: dictionary.chrome.close,
    languageLabel: dictionary.chrome.language,
    navigationLabel: dictionary.chrome.navigation,
    nav: navigation(locale, dictionary),
    programMenu: programMenu(locale, dictionary),
    register: {
      href: localePath(locale, "inscription"),
      label: dictionary.nav.register,
    },
    footerProgram: dictionary.chrome.footerProgram,
    footerRights: dictionary.chrome.footerRights,
    footerCredit: dictionary.chrome.footerCredit,
    footerInformation: dictionary.chrome.footerInformation,
    footerParticipate: dictionary.chrome.footerParticipate,
    footerContact: dictionary.chrome.footerContact,
    followX: dictionary.chrome.followX,
    joinWhatsApp: dictionary.chrome.joinWhatsApp,
    organizerEmail,
    organizerXUrl,
    whatsappInvitationUrl: getWhatsappInvitationUrl(),
    opensNewTab: dictionary.links.opensNewTab,
    localeNames: dictionary.localeNames,
  };

  return (
    <html lang={locale} className={`${sourceSans.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans text-ink antialiased">
        <ConstellationBackground />
        <a className="skip-link" href="#content">
          {dictionary.chrome.skip}
        </a>
        <Suspense fallback={<HeaderFallback wordmark={chrome.wordmark} place={chrome.place} />}>
          <SiteHeader {...chrome} />
        </Suspense>
        <main id="content" className="flex-1 pt-20">
          {children}
        </main>
        <Suspense
          fallback={
            <footer className="mt-auto bg-action px-5 py-8 text-[0.9375rem] text-white md:px-8">
              cardanoimpactdrc © 2026. {chrome.footerRights}
            </footer>
          }
        >
          <SiteFooter {...chrome} />
        </Suspense>
      </body>
    </html>
  );
}

function HeaderFallback({ wordmark, place }: { wordmark: string; place: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 bg-action">
      <div className="flex h-20 w-full items-center px-5 md:px-8">
        <span className="text-base font-semibold text-white md:text-lg">
          {wordmark}
          <span className="mt-1 block text-[0.8125rem] font-normal leading-[1.4] text-white/80">
            {place}
          </span>
        </span>
      </div>
    </header>
  );
}

function navigation(locale: Locale, dictionary: ReturnType<typeof getDictionary>) {
  return [
    { href: localePath(locale), label: dictionary.nav.home },
    { href: localePath(locale, "programme"), label: dictionary.nav.program },
    { href: localePath(locale, "calendrier"), label: dictionary.nav.schedule },
    { href: localePath(locale, "feuille-de-route"), label: dictionary.nav.roadmap },
    { href: localePath(locale, "activites"), label: dictionary.nav.activities },
    { href: localePath(locale, "galerie"), label: dictionary.nav.gallery },
    { href: localePath(locale, "concours"), label: dictionary.nav.competition },
    { href: localePath(locale, "evaluations"), label: dictionary.nav.evaluation },
    { href: localePath(locale, "equipes"), label: dictionary.nav.participatingTeams },
    { href: localePath(locale, "resultats"), label: dictionary.nav.results },
    { href: localePath(locale, "annonces"), label: dictionary.nav.announcements },
    { href: localePath(locale, "faq"), label: dictionary.nav.faq },
    { href: localePath(locale, "contact"), label: dictionary.nav.contact },
  ];
}

function programMenu(locale: Locale, dictionary: ReturnType<typeof getDictionary>) {
  const page = localePath(locale, "programme");

  return [
    { href: `${page}#program-what`, label: dictionary.nav.programWhat },
    { href: `${page}#program-how`, label: dictionary.nav.programHow },
    { href: `${page}#program-next`, label: dictionary.nav.schedule },
    { href: localePath(locale, "feuille-de-route"), label: dictionary.nav.roadmap },
    { href: `${page}#organizer-contact`, label: dictionary.reach.title },
  ];
}
