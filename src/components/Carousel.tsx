"use client";
import Image from "next/image";
import { useRef } from "react";

export type CarouselImage = { src: string; alt: string; title?: string };

type Props = {
  images: CarouselImage[];
  height?: number;
  rounded?: string;
  className?: string;
};

export default function Carousel({ images, height = 320, rounded = "rounded-2xl", className = "" }: Props) {
  const scroller = useRef<HTMLDivElement | null>(null);

  function scrollBy(delta: number) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  if (!images || images.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scroller}
        className={`flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory`}
        style={{ scrollPadding: 24 }}
        aria-roledescription="carousel"
      >
        {images.map((img, i) => (
          <figure key={i} className={`shrink-0 w-[85%] sm:w-[420px] snap-center`}>
            <div className={`relative w-full ${rounded} overflow-hidden border border-gray-200`} style={{ height }}>
              <Image src={img.src} alt={img.alt} fill priority sizes="(max-width: 640px) 85vw, 420px" className="object-cover" />
            </div>
            {img.title && (
              <figcaption className="mt-2 text-sm text-gray-600">{img.title}</figcaption>
            )}
          </figure>
        ))}
      </div>
      <button
        type="button"
        aria-label="Precedente"
        onClick={() => scrollBy(-380)}
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow rounded-full w-9 h-9 items-center justify-center border border-gray-200"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Successivo"
        onClick={() => scrollBy(380)}
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow rounded-full w-9 h-9 items-center justify-center border border-gray-200"
      >
        ›
      </button>
    </div>
  );
}

