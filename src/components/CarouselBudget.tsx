"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const IMAGES = [
  "/carousel/budget/1.jpg",
  "/carousel/budget/2.jpg",
  "/carousel/budget/3.jpg",
];

export default function CarouselBudget() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((v) => (v + 1) % IMAGES.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const handlePrev = () => {
    setIdx((idx - 1 + IMAGES.length) % IMAGES.length);
  };

  const handleNext = () => {
    setIdx((idx + 1) % IMAGES.length);
  };

  const handleDotClick = (index: number) => {
    setIdx(index);
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border shadow-lg">
      {IMAGES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt={`Budget slide ${i + 1}`}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      ))}

      {/* Controlli Prev/Next */}
      <button
        aria-label="Previous slide"
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 px-3 py-2 text-white text-2xl font-bold transition-colors z-10"
      >
        {"\u2039"}
      </button>
      <button
        aria-label="Next slide"
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 px-3 py-2 text-white text-2xl font-bold transition-colors z-10"
      >
        {"\u203A"}
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              i === idx ? "bg-white w-6" : "bg-white/60 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

