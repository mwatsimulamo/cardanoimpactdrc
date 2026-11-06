import type { Metadata } from "next";
import { PageFrame, PageHeader } from "@/components/PageHeader";
import { UnsubscribeForm } from "@/components/UnsubscribeForm";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { privateMetadata } from "@/lib/metadata";

export const instant = false;

type UnsubscribePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: UnsubscribePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return privateMetadata(dictionary.newsletter.unsubscribeTitle, dictionary.meta.siteName);
}

export default async function Page({
  params,
  searchParams,
}: UnsubscribePageProps) {
  const { locale } = await params;
  const query = await searchParams;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);
  const token = typeof query.token === "string" ? query.token : "";

  return (
    <PageFrame>
      <PageHeader title={dictionary.newsletter.unsubscribeTitle} lede={dictionary.newsletter.unsubscribeLede} />
      <UnsubscribeForm token={token} label={dictionary.newsletter.unsubscribeSubmit} done={dictionary.newsletter.unsubscribeDone} invalid={dictionary.newsletter.unsubscribeInvalid} missing={dictionary.newsletter.missing} error={dictionary.newsletter.error} />
    </PageFrame>
  );
}
