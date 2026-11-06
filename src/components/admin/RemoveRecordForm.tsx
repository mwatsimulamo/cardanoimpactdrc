"use client";

import { useActionState } from "react";
import { secondaryLink } from "@/components/classes";
import { StatusMessage } from "@/components/StatusMessage";
import {
  removeActivityAction,
  removeAnnouncementAction,
  removeGalleryAction,
  type AdminActionState,
} from "@/lib/admin-record-actions";

const actions = {
  announcement: removeAnnouncementAction,
  activity: removeActivityAction,
  gallery: removeGalleryAction,
} as const;

export function RemoveRecordForm({
  id,
  kind,
}: {
  id: string;
  kind: keyof typeof actions;
}) {
  const [state, action, pending] = useActionState(actions[kind], null);

  return (
    <form action={action}>
      <input name="id" type="hidden" value={id} />
      <button type="submit" className={secondaryLink} disabled={pending}>
        Retirer
      </button>
      <RemoveNotice state={state} />
    </form>
  );
}

function RemoveNotice({ state }: { state: AdminActionState }) {
  if (state === null || state.status === "ok") {
    return null;
  }

  return (
    <div className="mt-3">
      <StatusMessage tone="warning">{state.detail ?? "Le retrait n'a pas abouti."}</StatusMessage>
    </div>
  );
}
