"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Table = {
  totalSeats: number;
  assignedGuests: { id: string }[];
};

export default function TavoliRiepilogoPage() {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/my/tables");
        const json = await res.json();
        setTables((json.tables || []).map((t: any) => ({
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

  const totalTables = tables.length;
  const totalSeats = tables.reduce((sum, t) => sum + (t.totalSeats || 0), 0);
  const assignedSeats = tables.reduce((sum, t) => sum + (t.assignedGuests?.length || 0), 0);
  const availableSeats = totalSeats - assignedSeats;

  if (loading) {
    return (
      <section>
        <h2 className="font-serif text-2xl sm:text-3xl mb-4 sm:mb-6 font-bold">🪑 Tavoli - Riepilogo</h2>
        <p className="text-gray-600 font-semibold">Caricamento...</p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-800">🪑 Tavoli - Riepilogo</h2>
        <Link 
          href="/invitati"
          className="text-sm font-bold text-blue-600 hover:text-blue-800 underline"
        >
          ← Torna a Invitati
        </Link>
      </div>

      <div className="mb-6 p-5 sm:p-6 rounded-2xl border-3 border-gray-600 bg-gradient-to-br from-gray-200 to-gray-300 shadow-xl">
        <h3 className="font-bold text-lg mb-4 text-gray-900">📊 Riepilogo Tavoli</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm sm:text-base">
          <div className="p-4 bg-white rounded-xl border-2 border-blue-500 shadow-md">
            <div className="text-gray-800 font-bold">Tavoli Totali</div>
            <div className="text-3xl font-bold text-blue-700">{totalTables}</div>
          </div>
          <div className="p-4 bg-white rounded-xl border-2 border-green-500 shadow-md">
            <div className="text-gray-800 font-bold">Posti Totali</div>
            <div className="text-3xl font-bold text-green-700">{totalSeats}</div>
          </div>
          <div className="p-4 bg-white rounded-xl border-2 border-purple-500 shadow-md">
            <div className="text-gray-800 font-bold">Posti Assegnati</div>
            <div className="text-3xl font-bold text-purple-700">{assignedSeats}</div>
          </div>
          <div className="p-4 bg-white rounded-xl border-2 border-orange-500 shadow-md">
            <div className="text-gray-800 font-bold">Posti Liberi</div>
            <div className="text-3xl font-bold text-orange-700">{availableSeats}</div>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600">La gestione della disposizione è stata disabilitata: qui trovi solo il riepilogo dei tavoli.</p>
    </section>
  );
}

