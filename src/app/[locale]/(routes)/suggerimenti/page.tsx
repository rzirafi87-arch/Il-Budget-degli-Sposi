"use client";

import { flags } from "@/config/flags";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SuggerimentiPage() {
  const t = useTranslations();
  const suggestionsEnabled = flags.ai_suggestions;
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!suggestionsEnabled) return;
    const country = typeof window !== "undefined" ? localStorage.getItem("country") || "it" : "it";
    // Schedule setState to avoid synchronous setState within effect
    setTimeout(() => {
      if (country === "mx") {
        setSuggestions([
          "Ricorda di prenotare il Mariachi!",
          "Verifica la disponibilità della location almeno 6 mesi prima.",
          "Considera una fotocabina a tema per la festa.",
          "Controlla i documenti legali richiesti in Messico.",
        ]);
      } else {
        setSuggestions([
          "Prenota il fotografo con largo anticipo.",
          "Verifica la lista invitati e aggiorna le preferenze.",
          "Controlla le tradizioni locali per arricchire la cerimonia.",
        ]);
      }
    }, 0);
  }, [suggestionsEnabled]);

  if (!suggestionsEnabled) {
    return (
      <section className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="font-serif text-3xl mb-4 text-[#A3B59D] font-bold">
          {t("suggestions", { fallback: "Suggerimenti & Consigli" })}
        </h1>
        <p className="mb-4 text-gray-700 text-base">
          {t("featureDisabled", {
            fallback: "Questa funzionalità è momentaneamente disabilitata. Torna più tardi per scoprire i consigli smart.",
          })}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"
        >
          {t("backToDashboard", { fallback: "Torna in Dashboard" })}
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="font-serif text-3xl mb-4 text-[#A3B59D] font-bold">
        {t("suggestions", { fallback: "Suggerimenti & Consigli" })}
      </h1>
      <div className="mb-4 flex justify-end">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"
        >
          {t("backToDashboard", { fallback: "Torna in Dashboard" })}
        </Link>
      </div>
      <div className="mb-6">
        <Link
          href="/chat-ia"
          className="inline-block px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"
        >
          Chatta con IA
        </Link>
      </div>
      <p className="mb-4 text-gray-700 text-base">
        Qui troverai consigli personalizzati in base alle scelte che stai facendo, al budget e ai documenti/foto caricati.
      </p>
      <ul className="space-y-4">
        {suggestions.map((s, i) => (
          <li key={i} className="bg-white border-l-4 border-[#A3B59D] shadow rounded-xl p-4 text-gray-800 font-medium">
            {s}
          </li>
        ))}
      </ul>

      <div className="mt-8 p-6 rounded-2xl border-2 border-dashed border-[#A3B59D] bg-[#F7FBF7]">
        <h2 className="font-semibold text-lg mb-2">Carica una foto</h2>
        <p className="text-gray-700 mb-3">
          Qui puoi caricare un&apos;immagine (abito, palette, location) per ricevere consigli mirati.
        </p>
        <label className="inline-block px-4 py-2 rounded-full text-white cursor-pointer" style={{ background: "var(--color-sage)" }}>
          Seleziona file...
          <input type="file" accept="image/*" className="hidden" />
        </label>
      </div>
    </section>
  );
}
