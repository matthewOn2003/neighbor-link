import Image from "next/image";

export function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`.trim()} aria-hidden="true">
      {name}
    </span>
  );
}

/** Design icons exported from Figma, stored in public/design. */
export function SvgIcon({ src, size = 18, className = "" }: { src: string; size?: number; className?: string }) {
  return <Image src={src} alt="" width={size} height={size} unoptimized className={className} />;
}
