"use client";

import React, { useEffect, useState } from "react";

type AssignedGuest = { guestId: string; seatNumber: number; guestName?: string };
type Table = {
  id?: string;
  tableNumber?: number;
  tableName?: string;
  tableType?: string;
  totalSeats: number;
  notes?: string;
  assignedGuests: AssignedGuest[];
};

type AvailableGuest = {
  id: string;
  name: string;
  guestType: "bride" | "groom" | "common";
  familyGroupId?: string | null;
  familyName?: string | null;
  excludeFromFamilyTable?: boolean;
};

export default function TavoliPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [availableGuests, setAvailableGuests] = useState<AvailableGuest[]>([]);
  const [seatsPerTable, setSeatsPerTable] = useState<number>(8);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/my/tables");
        const json = await res.json();
        setTables((json.tables || []).map((t: any) => ({
          id: t.id,
          tableNumber: t.tableNumber,
          tableName: t.tableName,
          tableType: t.tableType,
          totalSeats: Number(t.totalSeats || 0),
          notes: t.notes,
          assignedGuests: (t.assignedGuests || []).map((ag: any) => ({
            guestId: ag.guestId,
            seatNumber: ag.seatNumber,
            guestName: ag.guestName,
          })),
        })));
        setAvailableGuests(json.availableGuests || []);
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

  function autoAssignByFamily() {
    if (!availableGuests || availableGuests.length === 0) {
      setMessage("Nessun invitato disponibile da assegnare.");
      return;
    }

    // Separate included (family table) and excluded (cousins/others)
    const inc = availableGuests.filter(g => !g.excludeFromFamilyTable);
    const exc = availableGuests.filter(g => g.excludeFromFamilyTable);

    // Group included by family
    const byFamily = new Map<string, { name: string; members: AvailableGuest[] }>();
    for (const g of inc) {
      const key = g.familyGroupId || `no-family`;
      const fam = byFamily.get(key) || { name: g.familyName || "Senza famiglia", members: [] };
      fam.members.push(g);
      byFamily.set(key, fam);
    }

    const newTables: Table[] = [];
    let tableCounter = 1;

    // Helper to create chunked tables
    function createTablesForGroup(label: string, members: AvailableGuest[], type: string) {
      for (let i = 0; i < members.length; i += seatsPerTable) {
        const slice = members.slice(i, i + seatsPerTable);
        const tableName = type === "family" && members.length <= seatsPerTable
          ? `Tavolo ${label}`
          : `${type === "family" ? `Tavolo ${label}` : `Tavolo Cugini`} ${Math.floor(i / seatsPerTable) + 1}`;
        const assigned: AssignedGuest[] = slice.map((g, idx) => ({ guestId: g.id, seatNumber: idx + 1, guestName: g.name }));
        newTables.push({
          tableNumber: tableCounter++,
          tableName,
          tableType: type,
          totalSeats: seatsPerTable,
          notes: "",
          assignedGuests: assigned,
        });
      }
    }

    // Families (included)
    for (const [key, fam] of byFamily.entries()) {
      if (key === 'no-family') continue; // handle later
      if (fam.members.length === 0) continue;
      createTablesForGroup(`Famiglia ${fam.name}`, fam.members, "family");
    }

    // Guests without family but included → group into generic tables
    const noFamilyIncluded = byFamily.get('no-family')?.members || [];
    if (noFamilyIncluded.length > 0) {
      createTablesForGroup("Amici", noFamilyIncluded, "friends");
    }

    // Excluded across families → Cugini tables
    if (exc.length > 0) {
      // Keep a stable order by familyName and name
      const sortedExc = [...exc].sort((a, b) => (a.familyName || '').localeCompare(b.familyName || '') || a.name.localeCompare(b.name));
      createTablesForGroup("Cugini", sortedExc, "cousins");
    }

    setTables(newTables);
    setMessage(`Generati ${newTables.length} tavoli da ${availableGuests.length} invitati disponibili.`);
  }

  async function saveTables() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/my/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tables }),
      });
      if (!res.ok) {
        const j = await res.json();
        setMessage(`Errore salvataggio: ${j.error || 'Impossibile salvare'}`);
      } else {
        setMessage('✅ Tavoli salvati!');
      }
    } catch (e: any) {
      setMessage('Errore di rete nel salvataggio');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="pt-6">
      <div className="flex items-start justify-between mb-4">
        <h1 className="font-serif text-3xl">Disposizione Tavoli</h1>
        <div className="flex gap-2">
          <a href="/invitati" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">Torna a Invitati</a>
          <button onClick={autoAssignByFamily} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm" style={{ background: 'var(--color-sage)' }}>Auto-assegna per Famiglia</button>
        </div>
      </div>

      <div className="mb-6 p-5 sm:p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm sm:text-base">
          <div className="p-4 bg-gray-50 rounded-lg border">Tavoli Totali: <strong>{totalTables}</strong></div>
          <div className="p-4 bg-gray-50 rounded-lg border">Posti Totali: <strong>{totalSeats}</strong></div>
          <div className="p-4 bg-gray-50 rounded-lg border">Posti Assegnati: <strong>{assignedSeats}</strong></div>
          <div className="p-4 bg-gray-50 rounded-lg border">Posti Liberi: <strong>{availableSeats}</strong></div>
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm">
          <label className="font-semibold">Posti per tavolo</label>
          <input type="number" min={4} max={14} value={seatsPerTable} onChange={(e) => setSeatsPerTable(Number(e.target.value || 8))} className="border rounded px-2 py-1 w-20" />
          <span className="text-gray-500">(consigliato 8-10)</span>
        </div>
        {message && <div className="mt-3 text-sm p-2 rounded border bg-gray-50">{message}</div>}
      </div>

      {/* Preview simple list */}
      <div className="p-6 rounded-lg border border-gray-200 bg-white/70">
        {tables.length === 0 ? (
          <p className="text-sm text-gray-600">Clicca su "Auto-assegna per Famiglia" per generare una proposta di disposizione.</p>
        ) : (
          <div className="space-y-3">
            {tables.map((t, idx) => (
              <div key={idx} className="border rounded p-3">
                <div className="font-semibold">{t.tableName || `Tavolo ${t.tableNumber}`}</div>
                <div className="text-xs text-gray-500 mb-2">Tipo: {t.tableType || 'n/d'} • Posti: {t.totalSeats} • Assegnati: {t.assignedGuests.length}</div>
                <ul className="text-sm list-disc pl-5">
                  {t.assignedGuests.map((ag) => (
                    <li key={ag.guestId}>{ag.guestName || ag.guestId}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="flex justify-end">
              <button onClick={saveTables} disabled={saving} className="px-4 py-2 rounded text-white" style={{ background: 'var(--color-sage)' }}>{saving ? 'Salvataggio...' : 'Salva disposizione'}</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


