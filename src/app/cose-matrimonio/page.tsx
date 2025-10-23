"use client";

import ImageCarousel from "@/components/ImageCarousel";
import { PAGE_IMAGES } from "@/lib/pageImages";

export default function CoseMatrimonioPage() {
  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-6">Cose da Matrimonio</h2>

      {/* Carosello immagini */}
      <ImageCarousel images={PAGE_IMAGES["cose-matrimonio"]} height="280px" />

      <div className="p-20 text-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/50">
        <div className="text-6xl mb-4">🎊</div>
        <h3 className="text-2xl font-semibold text-gray-700 mb-3">
          Sezione in arrivo!
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Questa sezione conterrà strumenti utili per organizzare il tuo matrimonio.
          Rimani sintonizzato per gli aggiornamenti!
        </p>
      </div>
    </section>
  );
}
