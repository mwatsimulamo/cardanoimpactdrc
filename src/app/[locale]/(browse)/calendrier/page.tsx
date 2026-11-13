import { permanentRedirect } from "next/navigation";
import { isLocale, localePath } from "@/lib/locales";

/** Ancienne page calendrier : le calendrier public reste uniquement sur l'accueil. */
export default async function SchedulePage({ params }: PageProps<"/[locale]/calendrier">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  permanentRedirect(localePath(locale));
}
