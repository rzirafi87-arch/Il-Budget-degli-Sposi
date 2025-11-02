import React from "react";
import CresimaNav from "@/components/cresima/CresimaNav";

export const metadata = { title: "Cresima - Invitati" };

export default function CresimaInvitatiPage() {
  return (
    <main>
      <CresimaNav />
      <section className="rounded-xl border border-neutral-200 bg-white/70 p-5">
        <h2 className="text-xl font-semibold">Invitati</h2>
        <p className="text-neutral-600 mt-2">
          Prepara la lista invitati e tieni traccia di conferme, tavoli e preferenze.
        </p>
        <ul className="list-disc ml-5 mt-3 text-neutral-700">
          <li>Padrino/Madrina, famiglia e amici</li>
          <li>Conferme di partecipazione (RSVP)</li>
          <li>Allergie o esigenze particolari</li>
        </ul>
        <div className="mt-4 text-sm text-neutral-600">
          A breve potrai aggiungere e gestire gli invitati con lo stesso flusso semplice della sezione matrimonio.
        </div>
      </section>
    </main>
  );
}

