import { justifiedText, pageTitle } from "@/components/classes";

export function PageHeader({
  title,
  lede,
  id,
  level = 1,
}: {
  title: string;
  lede?: string;
  id?: string;
  level?: 1 | 2;
}) {
  const Tag = level === 1 ? "h1" : "h2";

  return (
    <header className="max-w-[72rem]">
      <Tag id={id} className={`${pageTitle} scroll-mt-28`}>
        {title}
      </Tag>
      {lede ? <p className={`mt-3 ${justifiedText}`}>{lede}</p> : null}
    </header>
  );
}

export function PageFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[72rem] px-5 py-12 md:px-8 md:py-16 xl:py-20 ${className}`}>
      {children}
    </div>
  );
}
