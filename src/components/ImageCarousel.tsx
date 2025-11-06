"use client";

import { useEffect, useState } from "react";

type ImageCarouselProps = {
  images: string[];
  height?: string;
  mobileHeight?: string;
  autoPlayInterval?: number;
};

export default function ImageCarousel({ 
  images, 
  height = "300px",
  mobileHeight = "200px",
  autoPlayInterval = 5000 
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Gestisci la dimensione mobile dopo il mount (client-side)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [images.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  if (!images || images.length === 0) return null;

  const carouselHeight = isMobile ? mobileHeight : height;

  return (
    <div 
      className="relative w-full mb-6 sm:mb-8 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl group"
      style={{ height: carouselHeight }}
    >
      {/* Immagini */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Overlay scuro per migliorare leggibilitÃ  */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/20" />
          </div>
        ))}
      </div>

      {/* Pulsanti navigazione - GRANDI e sempre visibili su mobile */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 sm:p-3 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 shadow-xl active:scale-90 border-2 border-gray-200"
        aria-label="Immagine precedente"
      >
        <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 sm:p-3 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 shadow-xl active:scale-90 border-2 border-gray-200"
        aria-label="Immagine successiva"
      >
        <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicatori (dots) - PIÃ™ GRANDI su mobile */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? "bg-white w-8 sm:w-8" 
                : "bg-white/60 hover:bg-white/80 w-2.5 sm:w-2.5"
            }`}
            aria-label={`Vai all'immagine ${index + 1}`}
          />
        ))}
      </div>

      {/* Contatore - PIÃ™ GRANDE e leggibile */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/70 text-white text-sm sm:text-sm px-3 sm:px-3 py-1.5 rounded-lg font-semibold shadow-lg">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
