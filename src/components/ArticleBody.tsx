import { justifiedText } from "@/components/classes";
import { isRichText, sanitizeRichText } from "@/lib/rich-text";

export function ArticleBody({ text }: { text: string }) {
  if (!isRichText(text)) {
    return <div className={`whitespace-pre-wrap ${justifiedText}`}>{text}</div>;
  }

  return (
    <div
      className={`article-body ${justifiedText}`}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(text) }}
    />
  );
}
