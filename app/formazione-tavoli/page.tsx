"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";
import Link from "next/link";

const supabase = getBrowserClient();

type TableType = "round" | "square" | "rectangular" | "imperial";

type Table = {
  id?: string;
  tableNumber: number;
  tableName: string;
  tableType: TableType;
  totalSeats: number;
  assignedGuests: AssignedGuest[];
  notes: string;
};

type AssignedGuest = {
  id: string;
  guestId: string;
  guestName: string;
  seatNumber?: number;
};

type AvailableGuest = {
  id: string;
  name: string;
  guestType: "bride" | "groom" | "common";
  familyGroupId?: string;
  familyName?: string;
};

const TABLE_TYPES = [
  { value: "round", label: "Tondo 🔵", icon: "⭕", defaultSeats: 8 },
  { value: "square", label: "Quadrato 🟦", icon: "🟦", defaultSeats: 8 },
  { value: "rectangular", label: "Rettangolare 🟫", icon: "▬", defaultSeats: 10 },
  { value: "imperial", label: "Imperiale 👑", icon: "👑", defaultSeats: 12 },
] as const;

export default function FormazioneTavoliPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [availableGuests, setAvailableGuests] = useState<AvailableGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [draggedGuest, setDraggedGuest] = useState<AvailableGuest | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      const headers: HeadersInit = {};
      if (jwt) headers.Authorization = `Bearer ${jwt}`;

      const res = await fetch("/api/my/tables", { headers });
      const json = await res.json();

      setTables(json.tables || []);
      setAvailableGuests(json.availableGuests || []);
    } catch (err) {
      console.error("Errore caricamento tavoli:", err);
    } finally {
      setLoading(false);
    }
  };

  const addTable = () => {
    const newTableNumber = tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber)) + 1 : 1;
    setTables([
      ...tables,
      {
        id: `temp-${Date.now()}`,
        tableNumber: newTableNumber,
        tableName: `Tavolo ${newTableNumber}`,
        tableType: "round",
        totalSeats: 8,
        assignedGuests: [],
        notes: "",
      },
    ]);
  };

  const updateTable = (id: string | undefined, field: keyof Table, value: any) => {
    if (!id) return;
    setTables(tables.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const deleteTable = (id: string | undefined) => {
    if (!id) return;
    const table = tables.find(t => t.id === id);
    if (table && table.assignedGuests.length > 0) {
      // Rimuovi gli invitati dal tavolo e rimettili tra i disponibili
      table.assignedGuests.forEach(ag => {
        const guest = availableGuests.find(g => g.id === ag.guestId);
        if (!guest) {
          setAvailableGuests(prev => [...prev, {
            id: ag.guestId,
            name: ag.guestName,
            guestType: "common",
          }]);
        }
      });
    }
    setTables(tables.filter((t) => t.id !== id));
  };

  const handleDragStart = (guest: AvailableGuest) => {
    setDraggedGuest(guest);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (tableId: string) => {
    if (!draggedGuest) return;
    
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    // Verifica se ci sono posti disponibili
    if (table.assignedGuests.length >= table.totalSeats) {
      setMessage("❌ Tavolo pieno! Non ci sono posti disponibili.");
      setTimeout(() => setMessage(null), 3000);
      setDraggedGuest(null);
      return;
    }

    // Aggiungi l'invitato al tavolo
    const newAssignment: AssignedGuest = {
      id: `temp-assign-${Date.now()}`,
      guestId: draggedGuest.id,
      guestName: draggedGuest.name,
      seatNumber: table.assignedGuests.length + 1,
    };

    setTables(tables.map(t => 
      t.id === tableId 
        ? { ...t, assignedGuests: [...t.assignedGuests, newAssignment] }
        : t
    ));

    // Rimuovi l'invitato dalla lista disponibili
    setAvailableGuests(availableGuests.filter(g => g.id !== draggedGuest.id));
    setDraggedGuest(null);
  };

  const removeGuestFromTable = (tableId: string, guestId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const removedGuest = table.assignedGuests.find(ag => ag.guestId === guestId);
    if (!removedGuest) return;

    // Rimuovi dal tavolo
    setTables(tables.map(t =>
      t.id === tableId
        ? { ...t, assignedGuests: t.assignedGuests.filter(ag => ag.guestId !== guestId) }
        : t
    ));

    // Aggiungi di nuovo ai disponibili
    setAvailableGuests([...availableGuests, {
      id: guestId,
      name: removedGuest.guestName,
      guestType: "common",
    }]);
  };

  const saveData = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) {
        setMessage("❌ Devi essere autenticato per salvare. Clicca su 'Accedi' in alto.");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/my/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ tables }),
      });

      if (!res.ok) {
        const json = await res.json();
        setMessage(`❌ Errore: ${json.error || "Impossibile salvare"}`);
      } else {
        setMessage("✅ Disposizione tavoli salvata con successo!");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Errore salvataggio:", err);
      setMessage("❌ Errore di rete");
    } finally {
      setSaving(false);
    }
  };

  const totalSeats = tables.reduce((sum, t) => sum + t.totalSeats, 0);
  const assignedSeats = tables.reduce((sum, t) => sum + t.assignedGuests.length, 0);
  const availableSeats = totalSeats - assignedSeats;

  if (loading) {
    return (
      <section>
        <h2 className="font-serif text-2xl sm:text-3xl mb-4 sm:mb-6 font-bold">🪑 Formazione Tavoli</h2>
        <p className="text-gray-600 font-semibold">Caricamento...</p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-800">🪑 Formazione Tavoli</h2>
        <Link 
          href="/invitati"
          className="text-sm font-bold text-blue-600 hover:text-blue-800 underline"
        >
          ← Torna a Invitati
        </Link>
      </div>

      {message && (
        <div className="mb-4 p-4 rounded-xl bg-blue-50 border-2 border-blue-300 text-sm sm:text-base font-bold">{message}</div>
      )}

      {/* Statistiche */}
      <div className="mb-6 p-5 sm:p-6 rounded-2xl border-3 border-gray-600 bg-gradient-to-br from-gray-200 to-gray-300 shadow-xl">
        <h3 className="font-bold text-lg mb-4 text-gray-900">📊 Riepilogo Disposizione</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm sm:text-base">
          <div className="p-4 bg-white rounded-xl border-2 border-blue-500 shadow-md">
            <div className="text-gray-800 font-bold">Tavoli Totali</div>
            <div className="text-3xl font-bold text-blue-700">{tables.length}</div>
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

      <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
        {/* AREA TAVOLI */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">🍽️ Disposizione Tavoli</h3>
            <button
              onClick={addTable}
              className="px-5 py-3 bg-gradient-to-r from-[#8a9d84] to-[#7a8d74] text-white rounded-xl hover:shadow-xl font-bold text-sm active:scale-95 transition-all shadow-md"
            >
              + Aggiungi Tavolo
            </button>
          </div>

          {tables.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border-2 border-gray-300 shadow-md">
              <div className="text-6xl mb-4">🪑</div>
              <p className="text-gray-600 font-semibold mb-4">Nessun tavolo creato</p>
              <button
                onClick={addTable}
                className="px-6 py-3 bg-[#8a9d84] text-white rounded-xl font-bold hover:bg-[#7a8d74] transition-colors"
              >
                Crea il primo tavolo
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="p-5 bg-white rounded-2xl border-3 border-gray-700 shadow-xl"
                  onDragOver={handleDragOver}
                  onDrop={() => table.id && handleDrop(table.id)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">Numero</label>
                      <input
                        type="number"
                        className="border-2 border-gray-400 rounded-lg px-3 py-2 w-full text-base font-bold"
                        value={table.tableNumber}
                        onChange={(e) => updateTable(table.id, "tableNumber", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">Nome Tavolo</label>
                      <input
                        type="text"
                        className="border-2 border-gray-400 rounded-lg px-3 py-2 w-full text-base font-bold"
                        value={table.tableName}
                        onChange={(e) => updateTable(table.id, "tableName", e.target.value)}
                        placeholder="Es: Tavolo Sposi"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">Tipo</label>
                      <select
                        className="border-2 border-gray-400 rounded-lg px-3 py-2 w-full text-base font-bold"
                        value={table.tableType}
                        onChange={(e) => {
                          const newType = e.target.value as TableType;
                          const typeInfo = TABLE_TYPES.find(t => t.value === newType);
                          updateTable(table.id, "tableType", newType);
                          if (typeInfo) updateTable(table.id, "totalSeats", typeInfo.defaultSeats);
                        }}
                      >
                        {TABLE_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">Posti</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="border-2 border-gray-400 rounded-lg px-3 py-2 w-full text-base font-bold"
                        value={table.totalSeats}
                        onChange={(e) => updateTable(table.id, "totalSeats", Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs font-bold text-gray-800 mb-1">Note</label>
                    <input
                      type="text"
                      className="border-2 border-gray-400 rounded-lg px-3 py-2 w-full text-sm"
                      value={table.notes}
                      onChange={(e) => updateTable(table.id, "notes", e.target.value)}
                      placeholder="Note sul tavolo..."
                    />
                  </div>

                  <div className="bg-gray-100 rounded-xl p-4 border-2 border-gray-400 min-h-[120px]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-800">
                        👥 Invitati ({table.assignedGuests.length}/{table.totalSeats})
                      </span>
                      {table.assignedGuests.length === 0 && (
                        <span className="text-xs text-gray-600 font-semibold">
                          ⬅️ Trascina invitati qui
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {table.assignedGuests.map((ag) => (
                        <div
                          key={ag.id}
                          className="bg-white px-3 py-2 rounded-lg border-2 border-green-500 shadow-md flex items-center gap-2"
                        >
                          <span className="text-sm font-bold text-gray-900">{ag.guestName}</span>
                          <button
                            onClick={() => table.id && removeGuestFromTable(table.id, ag.guestId)}
                            className="text-red-600 hover:text-red-800 font-bold text-lg"
                            title="Rimuovi"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => deleteTable(table.id)}
                      className="text-red-700 hover:text-red-900 font-bold text-sm underline"
                    >
                      🗑️ Elimina Tavolo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AREA INVITATI DISPONIBILI */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-800">👥 Invitati da Assegnare ({availableGuests.length})</h3>
          <div className="bg-white rounded-2xl border-3 border-blue-600 shadow-xl p-4 max-h-[800px] overflow-y-auto">
            {availableGuests.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">✅</div>
                <p className="text-gray-700 font-bold">Tutti gli invitati sono stati assegnati!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableGuests.map((guest) => (
                  <div
                    key={guest.id}
                    draggable
                    onDragStart={() => handleDragStart(guest)}
                    className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl border-2 border-blue-500 cursor-move hover:shadow-lg active:scale-95 transition-all"
                  >
                    <div className="font-bold text-gray-900 text-base">{guest.name}</div>
                    {guest.familyName && (
                      <div className="text-xs text-gray-700 font-semibold mt-1">
                        👨‍👩‍👧‍👦 {guest.familyName}
                      </div>
                    )}
                    <div className="text-xs font-semibold text-gray-600 mt-1">
                      {guest.guestType === "bride" && "💐 Sposa"}
                      {guest.guestType === "groom" && "🤵 Sposo"}
                      {guest.guestType === "common" && "💑 Comune"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
            <p className="text-sm text-yellow-900 font-bold">
              💡 <strong>Come usare:</strong><br/>
              Trascina gli invitati dalla lista e rilasciali sul tavolo desiderato.
            </p>
          </div>
        </div>
      </div>

      {/* Pulsante Salva */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={saveData}
          disabled={saving}
          className="flex-1 sm:flex-none bg-gradient-to-r from-[#8a9d84] to-[#7a8d74] text-white rounded-xl px-8 py-4 hover:shadow-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg active:scale-95 transition-all shadow-md"
        >
          {saving ? "⏳ Salvataggio..." : "💾 Salva Disposizione Tavoli"}
        </button>
      </div>
    </section>
  );
}
