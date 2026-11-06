import Link from "next/link";
import { measure, pageTitle, textLink } from "@/components/classes";
import { PageFrame } from "@/components/PageHeader";
import { en } from "@/content/en";
import { fr } from "@/content/fr";

export default function NotFound() {
  return (
    <PageFrame>
      <h1 className={pageTitle}>{fr.notFound.title}</h1>
      <p className={`mt-3 ${measure}`}>{fr.notFound.lede}</p>
      <p className={`mt-3 ${measure}`}>{en.notFound.title}</p>
      <p className={measure}>{en.notFound.lede}</p>
      <p className="mt-8 flex flex-col gap-3 md:flex-row">
        <Link className={textLink} href="/fr">
          {fr.actions.home}
        </Link>
        <Link className={textLink} href="/en">
          {en.actions.home}
        </Link>
      </p>
    </PageFrame>
  );
}
