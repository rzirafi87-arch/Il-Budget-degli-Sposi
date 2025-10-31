"use client";

import React, { useEffect, useState } from "react";

type Table = {
  id?: string;
  name?: string;
  totalSeats: number;
  assignedGuests: { id: string }[];
};

export default function TavoliPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/my/tables");
        const json = await res.json();
        setTables((json.tables || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          totalSeats: Number(t.totalSeats || 0),
          assignedGuests: t.assignedGuests || [],
        })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="pt-6">Caricamento tavoli...</div>;
  }

  const totalTables = tables.length;
  const totalSeats = tables.reduce((s, t) => s + (t.totalSeats || 0), 0);
  const assignedSeats = tables.reduce((s, t) => s + (t.assignedGuests?.length || 0), 0);
  const availableSeats = totalSeats - assignedSeats;

  return (
    <section className="pt-6">
      <div className="flex items-start justify-between mb-4">
        <h1 className="font-serif text-3xl">Disposizione Tavoli</h1>
        <div className="flex gap-2">
          <a href="/invitati" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"><span aria-hidden>â†</span> Torna a Invitati</a>
          <a href="/formazione-tavoli" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm" style={{ background: 'var(--color-sage)' }}><span aria-hidden>ðŸª‘</span> Crea Tavoli</a>
        </div>
      </div>

      <div className="mb-6 p-5 sm:p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm sm:text-base">
          <div className="p-4 bg-gray-50 rounded-lg border">Tavoli Totali: <strong>{totalTables}</strong></div>
          <div className="p-4 bg-gray-50 rounded-lg border">Posti Totali: <strong>{totalSeats}</strong></div>
          <div className="p-4 bg-gray-50 rounded-lg border">Posti Assegnati: <strong>{assignedSeats}</strong></div>
          <div className="p-4 bg-gray-50 rounded-lg border">Posti Liberi: <strong>{availableSeats}</strong></div>
        </div>
      </div>

      <div className="p-6 rounded-lg border border-gray-200 bg-white/70">
        <p className="text-sm text-gray-600">
          La gestione dettagliata della disposizione Ã¨ disponibile tramite l'API <code className="bg-gray-100 px-2 py-1 rounded">/api/my/tables</code>.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Per una gestione avanzata con drag-and-drop, aggiungeremo una canvas interattiva per posizionare tavoli e posti e assegnare gli invitati.
        </p>
      </div>
    </section>
  );
}

