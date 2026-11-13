"use client";

import { useLayoutEffect, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { justifiedText, pageTitle } from "@/components/classes";

export type BookItem = {
  id: string;
  href: string;
  label: string;
  scrollId?: string;
  nested?: boolean;
};

export function SectionHeading({
  id,
  href,
  title,
  lede,
}: {
  id: string;
  href: string;
  title: string;
  lede?: string;
}) {
  const pathname = usePathname();
  const Tag = pathname === href ? "h1" : "h2";

  return (
    <header>
      <Tag id={id} className={`${pageTitle} scroll-mt-28`}>
        {title}
      </Tag>
      {lede ? <p className={`mt-3 ${justifiedText}`}>{lede}</p> : null}
    </header>
  );
}

export function MenuBook({
  label,
  items,
  children,
}: {
  label: string;
  items: readonly BookItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const matched = items.find((item) => item.href.split("#")[0] === pathname);
  const pathId = matched?.scrollId ?? matched?.id ?? items[0]?.scrollId ?? items[0]?.id ?? "";
  const [spy, setSpy] = useState<{ path: string; id: string } | null>(null);
  const current = spy?.path === pathname ? spy.id : pathId;
  const signature = items
    .filter((item) => item.nested || !item.scrollId)
    .map((item) => item.scrollId ?? item.id)
    .join("|");

  useLayoutEffect(() => {
    const hash = window.location.hash.slice(1);
    const known = signature.split("|");
    const id = known.includes(hash) ? hash : pathId;
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, [pathname, pathId, signature]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const known = signature.split("|");
    const id = known.includes(hash) ? hash : pathId;
    const node = document.getElementById(id);
    if (!node) {
      return;
    }
    const run = () => node.scrollIntoView({ block: "start" });
    run();
    const frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [pathname, pathId, signature]);

  useEffect(() => {
    const nodes = signature.split("|").flatMap((id) => {
      const node = document.getElementById(id);
      return node ? [node] : [];
    });
    if (nodes.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          setSpy({ path: pathname, id: visible.target.id });
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 1] },
    );

    for (const node of nodes) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [pathname, signature]);

  return (
    <div className="reading min-h-[calc(100svh-5rem)] bg-white text-[#1b2430]">
      <div className="mx-auto grid w-full gap-10 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-12 xl:py-20">
        <nav
          aria-label={label}
          className="max-h-72 overflow-y-auto overscroll-contain lg:sticky lg:top-28 lg:max-h-[calc(100svh-8rem)]"
        >
          <ol className="space-y-1">
            {items.map((item) => {
              const targetId = item.scrollId ?? item.id;
              const childActive = items.some((entry) => entry.nested && entry.id === current);
              const active = item.nested || !item.scrollId ? item.id === current : childActive;
              return (
                <li key={item.id} className={item.nested ? "" : "pt-3 first:pt-0"}>
                  <a
                    href={item.href}
                    aria-current={item.id === current ? "location" : undefined}
                    className={`block border-l py-1.5 leading-[1.45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0033ad] ${
                      item.nested ? "pl-6 text-[0.9375rem]" : "pl-3 text-base font-semibold"
                    } ${
                      active || item.id === current
                        ? "border-[#0033ad] text-[#1b2430]"
                        : "border-transparent text-[#3e4c63] hover:text-[#1b2430]"
                    } ${item.id === current ? "font-semibold" : ""}`}
                    onClick={(event) => {
                      event.preventDefault();
                      const path = item.href.split("#")[0];
                      if (path === pathname) {
                        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
                        window.history.replaceState(null, "", item.href);
                        setSpy({ path, id: targetId });
                        return;
                      }
                      router.push(item.href, { scroll: false });
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
