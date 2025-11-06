"use client";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback } from "react";

export type CarouselImage = { src: string; alt: string; title?: string };

type Props = {
  images: CarouselImage[];
  height?: number;
  rounded?: string;
  className?: string;
};

export default function Carousel({ images, height = 320, rounded = "rounded-2xl", className = "" }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!images || images.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <div className={`overflow-hidden ${rounded}`} ref={emblaRef}>
        <div className="flex">
          {images.map((img, i) => (
            <div className="min-w-0 flex-[0_0_100%] px-2" key={i}>
              <figure className="w-full">
                <div className={`relative w-full ${rounded} overflow-hidden border border-gray-200`} style={{ height }}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 1024px"
                    className="object-cover"
                  />
                </div>
                {img.title && (
                  <figcaption className="mt-2 text-sm text-gray-600 text-center">{img.title}</figcaption>
                )}
              </figure>
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Precedente"
            onClick={scrollPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center border border-gray-200 transition-colors z-10 text-xl font-bold"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Successivo"
            onClick={scrollNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center border border-gray-200 transition-colors z-10 text-xl font-bold"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}


