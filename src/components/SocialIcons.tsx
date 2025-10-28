import Image from "next/image";

type Social = {
  name: string;
  href: string;
  src: string;
  alt: string;
};

type Props = {
  items: Social[];
  size?: number;
  className?: string;
};

export default function SocialIcons({ items, size = 28, className = "flex gap-3 items-center" }: Props) {
  if (!items || items.length === 0) return null;
  return (
    <div className={className}>
      {items.map((s) => (
        <a key={s.name} href={s.href} aria-label={s.name} target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 transition-opacity">
          <Image src={s.src} alt={s.alt} width={size} height={size} />
        </a>
      ))}
    </div>
  );
}

