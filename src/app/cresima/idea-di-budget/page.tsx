import React from "react";
import CresimaNav from "@/components/cresima/CresimaNav";

export const metadata = { title: "Cresima - Idea di budget" };

export default function CresimaIdeaDiBudgetPage() {
  return (
    <main>
      <CresimaNav />
      <section className="rounded-xl border border-neutral-200 bg-white/70 p-5">
        <h2 className="text-xl font-semibold">Idea di budget</h2>
        <p className="text-neutral-600 mt-2">
          Imposta un budget stimato per la Cresima e assegnalo alle principali categorie.
        </p>
        <ul className="list-disc ml-5 mt-3 text-neutral-700">
          <li>Location e catering</li>
          <li>Abbigliamento</li>
          <li>Fotografo e intrattenimento</li>
          <li>Bomboniere e decorazioni</li>
          <li>Inviti e stampa</li>
        </ul>
        <div className="mt-4 text-sm text-neutral-600">
          Suggerimento: parti da un totale e ripartisci per categoria. Potrai affinare le cifre quando raccoglierai i preventivi.
        </div>
      </section>
    </main>
  );
}

