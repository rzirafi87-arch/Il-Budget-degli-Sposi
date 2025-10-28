"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SuggerimentiPage() {
  // Stato per suggerimenti personalizzati
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Esempio: logica per suggerimenti in base alle scelte (mock)
  useEffect(() => {
    // Qui si può integrare la logica che analizza le scelte e il budget
    setSuggestions([
      "Hai scelto la location: ti consigliamo una mise en place floreale coordinata.",
      "Budget residuo: suggeriamo fornitori con offerte speciali per la tua fascia di spesa.",
      "Carica le foto del vestito per ricevere consigli su accessori abbinati.",
      "Scopri le palette colori più adatte alle tue scelte!",
    ]);
  }, []);

  return (
    <section className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="font-serif text-3xl mb-6 text-[#A3B59D] font-bold flex items-center gap-2">
        <span>💡</span> Suggerimenti & Consigli
      </h1>
      <p className="mb-6 text-gray-700 text-base">
        Qui troverai consigli personalizzati in base alle scelte che stai facendo, al budget e ai documenti/foto caricati. Più aggiorni la tua dashboard, più i suggerimenti saranno precisi!
      </p>
      <ul className="space-y-4">
        {suggestions.map((s, i) => (
          <li key={i} className="bg-white border-l-4 border-[#A3B59D] shadow rounded-xl p-4 text-gray-800 font-medium">
            {s}
          </li>
        ))}
      </ul>
      {/* Esempio: sezione per caricare foto */}
      <div className="mt-8">
        <h2 className="font-semibold text-lg mb-2">Carica una foto per consigli ancora più mirati</h2>
        <input type="file" accept="image/*" className="block mb-4" />
        {/* Qui si può integrare la logica di analisi immagine */}
      </div>
    </section>
  );
}
