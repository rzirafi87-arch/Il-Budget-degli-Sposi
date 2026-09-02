"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

type ImageCarouselProps = { images: string[]; height?: string; mobileHeight?: string; autoPlayInterval?: number };

const COPY = {
  it: { previous: "Immagine precedente", next: "Immagine successiva", goTo: "Vai all'immagine", fallback: "Immagine temporaneamente non disponibile", descriptions: { invitati: ["Ricevimento di matrimonio con gli invitati", "Organizzazione dei tavoli e della lista invitati", "Festeggiamenti degli sposi con gli invitati"], budget: ["Panoramica del budget del matrimonio", "Pianificazione delle spese del matrimonio", "Riepilogo delle categorie di budget"], default: ["Dettaglio della pianificazione del matrimonio", "Ispirazione per l'organizzazione del matrimonio", "Preparativi per il giorno del matrimonio"] } },
  en: { previous: "Previous image", next: "Next image", goTo: "Go to image", fallback: "Image temporarily unavailable", descriptions: { invitati: ["Wedding reception with guests", "Table plan and guest list organization", "Newlyweds celebrating with their guests"], budget: ["Wedding budget overview", "Wedding expense planning", "Budget category summary"], default: ["Wedding planning detail", "Wedding organization inspiration", "Preparations for the wedding day"] } },
  es: { previous: "Imagen anterior", next: "Imagen siguiente", goTo: "Ir a la imagen", fallback: "Imagen temporalmente no disponible", descriptions: { invitati: ["Recepción de boda con los invitados", "Organización de mesas y lista de invitados", "Los novios celebrando con sus invitados"], budget: ["Resumen del presupuesto de la boda", "Planificación de los gastos de la boda", "Resumen de las categorías del presupuesto"], default: ["Detalle de la planificación de la boda", "Inspiración para organizar la boda", "Preparativos para el día de la boda"] } },
} as const;

function imageSection(src: string) { return src.split("/").filter(Boolean).at(-2) || "default"; }

export function resolveCarouselLanguage(locale: string): keyof typeof COPY {
  if (locale === "en") return "en";
  if (locale === "es" || locale === "mx") return "es";
  return "it";
}

export default function ImageCarousel({ images, height = "300px", mobileHeight = "200px", autoPlayInterval = 5000 }: ImageCarouselProps) {
  const locale = useLocale();
  const copy = COPY[resolveCarouselLanguage(locale)];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const descriptions = useMemo(() => {
    const section = images[0] ? imageSection(images[0]) : "default";
    return section === "invitati" ? copy.descriptions.invitati : section === "budget" ? copy.descriptions.budget : copy.descriptions.default;
  }, [copy, images]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (images.length <= 1 || isPaused || reduceMotion) return;
    const interval = window.setInterval(() => setCurrentIndex((previous) => (previous + 1) % images.length), autoPlayInterval);
    return () => window.clearInterval(interval);
  }, [images.length, autoPlayInterval, isPaused, reduceMotion]);

  if (images.length === 0) return null;
  const goToPrevious = () => setCurrentIndex((previous) => (previous - 1 + images.length) % images.length);
  const goToNext = () => setCurrentIndex((previous) => (previous + 1) % images.length);

  return (
    <section
      className="image-carousel group relative mb-6 w-full overflow-hidden rounded-xl border border-border bg-muted shadow-soft sm:mb-8 sm:rounded-2xl"
      style={{ "--carousel-height": height, "--carousel-mobile-height": mobileHeight } as React.CSSProperties}
      aria-roledescription="carousel" aria-label={`${currentIndex + 1} / ${images.length}`}
      onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)} onBlurCapture={() => setIsPaused(false)}
      onKeyDown={(event) => { if (event.key === "ArrowLeft") goToPrevious(); if (event.key === "ArrowRight") goToNext(); }}
      onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; setIsPaused(true); }}
      onTouchEnd={(event) => { const start = touchStartX.current; const end = event.changedTouches[0]?.clientX; touchStartX.current = null; setIsPaused(false); if (start == null || end == null || Math.abs(start - end) < 45) return; if (start > end) goToNext(); else goToPrevious(); }}
    >
      {images.map((src, index) => {
        const alt = descriptions[index] ?? `${descriptions[0]} ${index + 1}`;
        return (
          <div key={src} className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={index !== currentIndex}>
            {failedImages.has(src) ? (
              <div className="grid h-full place-items-center bg-linear-to-br from-secondary to-muted px-6 text-center text-muted-fg" role="img" aria-label={alt}><span className="rounded-xl border border-border bg-bg/80 px-4 py-3 font-medium">{copy.fallback}</span></div>
            ) : (
              <Image src={src} alt={alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 1216px" className="object-cover" onError={() => setFailedImages((previous) => new Set(previous).add(src))} />
            )}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/15" aria-hidden />
          </div>
        );
      })}
      {images.length > 1 ? <>
        <button type="button" onClick={goToPrevious} className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/90 text-gray-800 shadow-soft transition-colors hover:bg-white sm:left-4 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100" aria-label={copy.previous}><span aria-hidden className="text-2xl leading-none">‹</span></button>
        <button type="button" onClick={goToNext} className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/90 text-gray-800 shadow-soft transition-colors hover:bg-white sm:right-4 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100" aria-label={copy.next}><span aria-hidden className="text-2xl leading-none">›</span></button>
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1 sm:bottom-4" role="group" aria-label={`${currentIndex + 1} / ${images.length}`}>
          {images.map((src, index) => <button key={src} type="button" onClick={() => setCurrentIndex(index)} className="grid h-11 w-11 place-items-center rounded-full" aria-label={`${copy.goTo} ${index + 1}`} aria-current={index === currentIndex ? "true" : undefined}><span className={`block h-2.5 rounded-full bg-white shadow-sm transition-[width,opacity] ${index === currentIndex ? "w-7 opacity-100" : "w-2.5 opacity-65"}`} aria-hidden /></button>)}
        </div>
      </> : null}
      <div className="absolute right-3 top-3 z-10 rounded-lg bg-black/65 px-3 py-1.5 text-sm font-semibold text-white shadow-soft sm:right-4 sm:top-4" aria-live="polite">{currentIndex + 1} / {images.length}</div>
    </section>
  );
}
