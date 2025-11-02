"use client";
import React from "react";

export default function ViaggioNozzePage() {
  return (
    <section className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-4 flex justify-end">\n        <a href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">Torna in Dashboard</a>\n      </div>\n      <h1 className="font-serif text-3xl mb-4 text-[#A3B59D] font-bold">Viaggio di Nozze</h1>
      <p className="text-gray-700 mb-6">Suggerimenti per pianificare al meglio la luna di miele: destinazioni, budget, periodo migliore e checklist documenti.</p>
      <ul className="list-disc ml-6 space-y-2 text-gray-800">
        <li>Definisci il budget e la durata del viaggio</li>
        <li>Scegli 2-3 destinazioni e confronta il meteo del periodo</li>
        <li>Controlla i documenti (passaporti, visti, assicurazione)</li>
        <li>Pianifica 1-2 attività speciali e una giornata di relax</li>
      </ul>
    </section>
  );
}




