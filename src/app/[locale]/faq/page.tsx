import type { Metadata } from "next";
import { justifiedText, sectionTitle } from "@/components/classes";
import { PageFrame, PageHeader } from "@/components/PageHeader";
import { getDictionary } from "@/content/get-dictionary";
import { isLocale } from "@/lib/locales";
import { pageMetadata } from "@/lib/metadata";
import { listFaqItems } from "@/lib/public-data";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/faq">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return pageMetadata(dictionary.faq.title, dictionary.meta.siteName);
}

export default async function FaqPage({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  const dictionary = getDictionary(locale);
  const questions = listFaqItems().filter(
    (item) => item.question[locale].trim().length > 0 && item.answer[locale].trim().length > 0,
  );

  return (
    <PageFrame>
      <PageHeader title={dictionary.faq.title} lede={dictionary.faq.lede} />
      {questions.length === 0 ? (
        <p className={`mt-8 ${justifiedText}`}>{dictionary.faq.empty}</p>
      ) : (
        <div className="mt-8 space-y-10">
          {questions.map((item) => (
            <section key={item.question[locale]}>
              <h2 className={sectionTitle}>{item.question[locale]}</h2>
              <p className={`mt-4 whitespace-pre-wrap ${justifiedText}`}>{item.answer[locale]}</p>
            </section>
          ))}
        </div>
      )}
    </PageFrame>
  );
}
