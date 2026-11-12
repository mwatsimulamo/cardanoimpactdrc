import { bodyText, pageTitle, supportText } from "@/components/classes";

export function AdminPageHeader({
  title,
  lede,
  side = "left",
}: {
  title: string;
  lede?: string;
  side?: "left" | "right";
}) {
  return (
    <header className={side === "left" ? "admin-in-left" : "admin-in-right"}>
      <p className={supportText}>Espace organisateurs</p>
      <h1 className={`mt-2 ${pageTitle}`}>{title}</h1>
      {lede ? <p className={`mt-3 max-w-3xl ${bodyText}`}>{lede}</p> : null}
    </header>
  );
}
