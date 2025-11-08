import React from "react";
import CresimaNav from "@/components/cresima/CresimaNav";

export const metadata = { title: "Cresima - Timeline" };

export default function CresimaTimelinePage() {
  const tasks = [
    { when: "2-3 mesi prima", items: [
      "Conferma data con la parrocchia",
      "Scegli location ricevimento",
      "Definisci budget iniziale",
    ]},
    { when: "1-2 mesi prima", items: [
      "Invia inviti",
      "Prenota fotografo",
      "Scegli bomboniere e decorazioni",
    ]},
    { when: "2-3 settimane prima", items: [
      "Conferma numero invitati e menu",
      "Definisci disposizione tavoli",
      "Ritira abito/accessori",
    ]},
    { when: "Settimana dell'evento", items: [
      "Ultime conferme fornitore",
      "Prepara buste/bomboniere",
      "Brief fotografo e tempi della giornata",
    ]},
  ];

  return (
    <main>
      <CresimaNav />
      <section className="rounded-xl border border-neutral-200 bg-white/70 p-5">
        <h2 className="text-xl font-semibold">Timeline Cresima</h2>
        <p className="text-neutral-600 mt-2">Una traccia orientativa delle attività principali.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {tasks.map((block) => (
            <div key={block.when} className="rounded-lg border border-gray-200 bg-white/80 p-4">
              <h3 className="font-semibold text-gray-800">{block.when}</h3>
              <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
                {block.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

