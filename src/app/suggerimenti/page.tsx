"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function SuggerimentiPage() {
  const t = useTranslations();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const country = typeof window !== 'undefined' ? (localStorage.getItem('country') || 'it') : 'it';
    if (country === 'mx') {
      setSuggestions([
        'Ricorda di prenotare il Mariachi!',
        'Verifica la disponibilitÃ  della location almeno 6 mesi prima.',
        'Considera una fotocabina a tema per la festa.',
        'Controlla i documenti legali richiesti in Messico.',
      ]);
    } else {
      setSuggestions([
        'Prenota il fotografo con largo anticipo.',
        'Verifica la lista invitati e aggiorna le preferenze.',
        'Controlla le tradizioni locali per arricchire la cerimonia.',
      ]);
    }
  }, []);

  return (
    <section className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="font-serif text-3xl mb-4 text-[#A3B59D] font-bold">
        {t('suggestions', { fallback: 'Suggerimenti & Consigli' })}
      </h1>
      <div className="mb-4 flex justify-end">
        <a href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">Torna in Dashboard</a>
      </div>
      <div className="mb-6">
        <a
          href="/chat-ia"
          className="inline-block px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"
        >
          Chatta con IA
        </a>
      </div>
      <p className="mb-4 text-gray-700 text-base">
        Qui troverai consigli personalizzati in base alle scelte che stai facendo, al budget e ai documenti/foto caricati.
      </p>
      <ul className="space-y-4">
        {suggestions.map((s, i) => (
          <li
            key={i}
            className="bg-white border-l-4 border-[#A3B59D] shadow rounded-xl p-4 text-gray-800 font-medium"
          >
            {s}
          </li>
        ))}
      </ul>

      <div className="mt-8 p-6 rounded-2xl border-2 border-dashed border-[#A3B59D] bg-[#F7FBF7]">
        <h2 className="font-semibold text-lg mb-2">Carica una foto</h2>
        <p className="text-gray-700 mb-3">
          Qui puoi caricare un'immagine (abito, palette, location) per ricevere consigli mirati.
        </p>
        <label
          className="inline-block px-4 py-2 rounded-full text-white cursor-pointer"
          style={{ background: "var(--color-sage)" }}
        >
          Seleziona file...
          <input type="file" accept="image/*" className="hidden" />
        </label>
      </div>
    </section>
  );
}





