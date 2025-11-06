import React from "react";
import CresimaNav from "@/components/cresima/CresimaNav";
import CresimaTraditions from "@/components/cresima/CresimaTraditions";

export const metadata = {
  title: "Cresima",
};

export default function CresimaPage() {
  return (
    <main>
      <CresimaNav />
      <header className="mb-6">
        <h2 className="text-xl font-medium">Panoramica</h2>
        <p className="text-neutral-600 mt-1">
          Inizia a organizzare la tua Cresima: definisci il budget, la lista degli invitati e le attivitÃ  principali.
        </p>
      </header>
      <CresimaTraditions />

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 p-5">
          <h2 className="text-xl font-medium">Panoramica evento</h2>
          <p className="text-neutral-600 mt-2">
            Raccogli in un unico posto informazioni chiave: data, luogo, stile dellâ€™evento e note.
          </p>
          <ul className="list-disc ml-5 mt-3 text-neutral-700">
            <li>Data e ora della celebrazione</li>
            <li>Chiesa e location del ricevimento</li>
            <li>Stile/tema e palette colori</li>
          </ul>
        </div>

        <div className="rounded-lg border border-neutral-200 p-5">
          <h2 className="text-xl font-medium">Idea di budget</h2>
          <p className="text-neutral-600 mt-2">
            Imposta un budget stimato e suddividilo tra le principali categorie.
          </p>
          <ul className="list-disc ml-5 mt-3 text-neutral-700">
            <li>Location e catering</li>
            <li>Abbigliamento e accessori</li>
            <li>Fotografo e intrattenimento</li>
            <li>Bomboniere e decorazioni</li>
          </ul>
        </div>

        <div className="rounded-lg border border-neutral-200 p-5">
          <h2 className="text-xl font-medium">Invitati</h2>
          <p className="text-neutral-600 mt-2">
            Prepara la lista invitati e tieni traccia di conferme, tavoli e preferenze.
          </p>
          <ul className="list-disc ml-5 mt-3 text-neutral-700">
            <li>Famiglia, padrino/madrina e amici</li>
            <li>Conferme di partecipazione (RSVP)</li>
            <li>Allergie o esigenze particolari</li>
          </ul>
        </div>

        <div className="rounded-lg border border-neutral-200 p-5">
          <h2 className="text-xl font-medium">AttivitÃ  da fare</h2>
          <p className="text-neutral-600 mt-2">
            Un promemoria rapido delle prossime azioni per restare in pista.
          </p>
          <ul className="list-disc ml-5 mt-3 text-neutral-700">
            <li>Prenota chiesa e location</li>
            <li>Definisci menu e torta</li>
            <li>Scegli fotografo e musica</li>
            <li>Prepara inviti e bomboniere</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
