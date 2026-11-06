export function OriginalImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  return (
    // L'original est servi tel quel. Aucune recompression ni transformation n'est appliquée.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  );
}
