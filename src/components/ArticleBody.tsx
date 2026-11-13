import { justifiedText } from "@/components/classes";
import { isRichText, sanitizeRichText } from "@/lib/rich-text";

export function ArticleBody({ text }: { text: string }) {
  const value = text.trim();
  if (!value) {
    return null;
  }

  if (!isRichText(value)) {
    return <div className={`w-full whitespace-pre-wrap ${justifiedText}`}>{value}</div>;
  }

  return (
    <div
      className={`article-body w-full ${justifiedText}`}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}
    />
  );
}
