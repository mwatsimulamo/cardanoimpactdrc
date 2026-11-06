import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminFrame";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { privateMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/login">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary("fr");
  return privateMetadata(dictionary.adminUi.loginTitle, dictionary.meta.siteName);
}

export default async function AdminLoginPage({ params }: PageProps<"/[locale]/admin/login">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return <AdminLoginForm dictionary={getDictionary("fr")} />;
}
