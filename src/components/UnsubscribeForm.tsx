"use client";

import { useActionState } from "react";
import { primaryLink, supportText } from "@/components/classes";
import { unsubscribeNewsletterAction } from "@/lib/newsletter-actions";

export function UnsubscribeForm({
  token,
  label,
  done,
  invalid,
  missing,
  error,
}: {
  token: string;
  label: string;
  done: string;
  invalid: string;
  missing: string;
  error: string;
}) {
  const [state, action, pending] = useActionState(unsubscribeNewsletterAction, null);
  const message = state === "done" ? done : state === "invalid" ? invalid : state === "missing" ? missing : state === "error" ? error : "";

  return (
    <form action={action} className="mt-8 max-w-xl">
      <input name="token" type="hidden" value={token} />
      <button type="submit" className={primaryLink} disabled={pending || token.length === 0}>
        {label}
      </button>
      {token.length === 0 ? <p className={`mt-4 ${supportText}`}>{invalid}</p> : null}
      {message ? <p className={`mt-4 ${supportText}`}>{message}</p> : null}
    </form>
  );
}
