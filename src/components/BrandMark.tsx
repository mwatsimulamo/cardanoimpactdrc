import Image from "next/image";

export function BrandMark({
  alt = "",
  className = "h-12 w-auto self-start",
}: {
  alt?: string;
  className?: string;
}) {
  return (
    <Image
      src="/brand/logo.png"
      alt={alt}
      width={752}
      height={920}
      className={className}
    />
  );
}
