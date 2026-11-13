"use client";

import { Children, useState, type ReactNode } from "react";
import { secondaryLink } from "@/components/classes";
import { EDITORIAL_PREVIEW_LIMIT } from "@/lib/editorial-preview";

export function ShowMoreGrid({
  children,
  moreLabel,
  className = "admin-stagger mt-8 grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3",
  limit = EDITORIAL_PREVIEW_LIMIT,
}: {
  children: ReactNode;
  moreLabel: string;
  className?: string;
  limit?: number;
}) {
  const items = Children.toArray(children);
  const [expanded, setExpanded] = useState(false);
  const visible = expanded || items.length <= limit ? items : items.slice(0, limit);
  const hasMore = items.length > limit && !expanded;

  return (
    <div>
      <ul className={className}>{visible}</ul>
      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <button type="button" className={secondaryLink} onClick={() => setExpanded(true)}>
            {moreLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
