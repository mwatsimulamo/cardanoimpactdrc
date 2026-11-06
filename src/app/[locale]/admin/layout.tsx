import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const instant = false;
import { AdminFrame } from "@/components/admin/AdminFrame";
import { getDictionary } from "@/content/get-dictionary";
import { readAdminSession } from "@/lib/admin-session";
import { isLocale } from "@/lib/locales";

export default async function AdminLayout({
  children,
  params,
}: LayoutProps<"/[locale]/admin">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return children;
  }

  const pathname = (await headers()).get("x-cip-pathname") ?? "";
  if (locale !== "fr" || pathname.startsWith("/en/admin")) {
    redirect((pathname.startsWith("/en/admin") ? pathname : `/${locale}/admin`).replace(/^\/en(?=\/|$)/, "/fr"));
  }

  const signedIn = await readAdminSession();
  const isLogin = pathname === "/fr/admin/login";
  if (pathname.startsWith("/fr/admin") && !isLogin && !signedIn) {
    redirect("/fr/admin/login");
  }

  return (
    <AdminFrame locale="fr" dictionary={getDictionary("fr")} signedIn={signedIn}>
      {signedIn || isLogin ? children : null}
    </AdminFrame>
  );
}
