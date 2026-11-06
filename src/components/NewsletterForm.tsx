"use client";

import { useActionState } from "react";
import { primaryLink, supportText } from "@/components/classes";
import { subscribeNewsletterAction, type NewsletterState } from "@/lib/newsletter-actions";
import type { Locale } from "@/lib/locales";

export function NewsletterForm({
  locale,
  copy,
}: {
  locale: Locale;
  copy: {
    title: string;
    lede: string;
    email: string;
    consent: string;
    submit: string;
    saved: string;
    already: string;
    invalid: string;
    missing: string;
    error: string;
  };
}) {
  const [state, action, pending] = useActionState(subscribeNewsletterAction, null);

  return (
    <form action={action} className="border border-white/30 bg-[#071433]/92 px-4 py-4">
      <input name="locale" type="hidden" value={locale} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="lg:w-[14rem] lg:shrink-0">
          <h2 className="text-[1rem] font-semibold leading-snug text-white">{copy.title}</h2>
          <p className="mt-1 text-[0.875rem] leading-[1.45] text-white/80 hyphens-auto text-pretty md:text-justify">{copy.lede}</p>
        </div>
        <label className="min-w-0 flex-1 text-[0.875rem] font-semibold text-white">
          {copy.email}
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={copy.email}
            className="mt-1 min-h-10 w-full rounded-[2px] border border-white/40 bg-white px-3 text-base text-[#111827] placeholder:text-[#4b5563] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          />
        </label>
        <button type="submit" className={primaryLink} disabled={pending}>
          {copy.submit}
        </button>
      </div>
      <label className="mt-3 flex items-start gap-2 text-[0.8125rem] leading-[1.45] text-white/90 hyphens-auto text-pretty md:text-justify">
        <input name="consent" type="checkbox" value="yes" required className="mt-0.5" />
        <span>{copy.consent}</span>
      </label>
      <Notice state={state} copy={copy} />
    </form>
  );
}

function Notice({ state, copy }: { state: NewsletterState; copy: { saved: string; already: string; invalid: string; missing: string; error: string } }) {
  if (!state) {
    return null;
  }

  const message =
    state === "saved"
      ? copy.saved
      : state === "already"
        ? copy.already
        : state === "invalid"
          ? copy.invalid
          : state === "missing"
            ? copy.missing
            : copy.error;

  return <p className={`mt-4 ${supportText} text-white`}>{message}</p>;
}
