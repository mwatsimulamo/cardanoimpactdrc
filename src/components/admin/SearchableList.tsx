"use client";

import { Children, isValidElement, useMemo, useState, type ReactNode } from "react";
import { fieldControl, fieldLabel, secondaryLink, supportText } from "@/components/classes";

export function SearchableList({
  label,
  children,
  empty,
  pageSize = 8,
  columns = "xl:grid-cols-2",
}: {
  label: string;
  children: ReactNode;
  empty: string;
  pageSize?: number;
  columns?: string;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const items = useMemo(() => Children.toArray(children), [children]);
  const needle = query.trim().toLowerCase();
  const visible = items.filter((child) => {
    if (!isValidElement<SearchItemProps>(child) || needle.length === 0) {
      return true;
    }

    return String(child.props["data-search"] ?? "").toLowerCase().includes(needle);
  });
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const slice = visible.slice(current * pageSize, current * pageSize + pageSize);

  return (
    <div className="admin-in-up" style={{ ["--admin-delay" as string]: "120ms" }}>
      <label className={fieldLabel}>
        {label}
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          className={fieldControl}
        />
      </label>
      {slice.length === 0 ? <p className={`mt-4 ${supportText}`}>{empty}</p> : null}
      <ul className={`admin-stagger mt-4 grid gap-4 ${columns}`}>{slice}</ul>
      {visible.length > pageSize ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className={secondaryLink} disabled={current === 0} onClick={() => setPage(current - 1)}>
            Précédent
          </button>
          <p className={supportText}>
            {current + 1} / {pageCount}
          </p>
          <button type="button" className={secondaryLink} disabled={current + 1 >= pageCount} onClick={() => setPage(current + 1)}>
            Suivant
          </button>
        </div>
      ) : null}
    </div>
  );
}

type SearchItemProps = {
  "data-search"?: string;
};
