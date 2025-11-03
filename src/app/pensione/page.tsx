"use client";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import React from "react";

export default function PensionePage() {
  type LocalRow = { id?: string; category: string; subcategory: string; supplier?: string | null; amount?: number | null; spend_type?: string | null; notes?: string | null };
  const [rows, setRows] = React.useState<LocalRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const [demo, setDemo] = React.useState<boolean | null>(null);
  const [eventName, setEventName] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
  const supabase = getBrowserClient();
  const { data } = await supabase.auth.getSession();
  const sessionData = data as { session?: { access_token?: string } } | null;
  const jwt = sessionData?.session?.access_token;
        const headers: HeadersInit = {};
        if (jwt) headers.Authorization = `Bearer ${jwt}`;

        const res = await fetch("/api/retirement", { headers });
        const json = await res.json();
        if (!mounted) return;
        setDemo(Boolean(json.demo));
        if (json.event?.name) setEventName(json.event.name);
        setRows(json.rows || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function createEvent() {
    try {
      setCreating(true);
      const supabase = getBrowserClient();
      const { data } = await supabase.auth.getSession();
      const sessionData = data as { session?: { access_token?: string } } | null;
      const jwt = sessionData?.session?.access_token;
      if (!jwt) {
        // no session: prompt user to authenticate
        window.location.href = "/auth";
        return;
      }

      const res = await fetch("/api/retirement", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ total_budget: 0, expenses: [] }),
      });
      const json = await res.json();
      if (!res.ok) {
        console.error("Errore creando evento:", json);
        alert("Si è verificato un errore durante la creazione dell'evento.");
        return;
      }

      // persist selection in localStorage so NavTabs will show retirement tabs
      if (json.event?.id) {
        try {
          localStorage.setItem("eventType", "retirement");
          localStorage.setItem("activeEventId", json.event.id);
        } catch {
          // ignore storage errors
        }
      }

      // set event name immediately and refetch rows
      setEventName(json.event?.name ?? "Festa di Pensionamento");
      setLoading(true);
      const fetchRes = await fetch("/api/retirement", { headers: { Authorization: `Bearer ${jwt}` } });
      const fetchJson = await fetchRes.json();
      setDemo(Boolean(fetchJson.demo));
      if (fetchJson.event?.name) setEventName(fetchJson.event.name);
      setRows(fetchJson.rows || []);
    } catch (err) {
      console.error(err);
      alert("Errore imprevisto");
    } finally {
      setCreating(false);
      setLoading(false);
    }
  }

  const total = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  // Expense form state
  const [cat, setCat] = React.useState("");
  const [subcat, setSubcat] = React.useState("");
  const [supplier, setSupplier] = React.useState("");
  const [amount, setAmount] = React.useState<string>("");
  const [notes, setNotes] = React.useState("");
  const [spendType, setSpendType] = React.useState<string>("common");

  async function submitExpense(e: React.FormEvent) {
    e.preventDefault();
    try {
      const supabase = getBrowserClient();
      const { data } = await supabase.auth.getSession();
      const sessionData = data as { session?: { access_token?: string } } | null;
      const jwt = sessionData?.session?.access_token;
      if (!jwt) {
        window.location.href = "/auth";
        return;
      }

      const expense = {
        category: cat || "Altro",
        subcategory: subcat || "Generico",
        supplier: supplier || null,
        amount: Number(amount) || 0,
        spend_type: spendType,
        notes: notes || null,
      };

      setCreating(true);
      const res = await fetch("/api/retirement", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ expenses: [expense], total_budget: 0 }),
      });
      const json = await res.json();
      if (!res.ok) {
        console.error("Errore inserimento spesa:", json);
        alert("Errore inserimento spesa");
        return;
      }

      // refetch
      const fetchRes = await fetch("/api/retirement", { headers: { Authorization: `Bearer ${jwt}` } });
      const fetchJson = await fetchRes.json();
      setRows(fetchJson.rows || []);

      // clear form
      setCat("");
      setSubcat("");
      setSupplier("");
      setAmount("");
      setNotes("");
      setSpendType("common");
    } catch (err) {
      console.error(err);
      alert("Errore imprevisto");
    } finally {
      setCreating(false);
    }
  }

  // Inline edit/delete
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editCat, setEditCat] = React.useState("");
  const [editSubcat, setEditSubcat] = React.useState("");
  const [editSupplier, setEditSupplier] = React.useState("");
  const [editAmount, setEditAmount] = React.useState<string>("");
  const [editNotes, setEditNotes] = React.useState("");
  const [editSpendType, setEditSpendType] = React.useState<string>("common");

  function startEdit(r: LocalRow) {
    setEditingId(r.id ?? null);
    setEditCat(r.category || "");
    setEditSubcat(r.subcategory || "");
    setEditSupplier(r.supplier || "");
    setEditAmount(r.amount ? String(r.amount) : "");
    setEditNotes(r.notes || "");
    setEditSpendType(r.spend_type || "common");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      setCreating(true);
  const supabase = getBrowserClient();
  const { data } = await supabase.auth.getSession();
  const sessionData = data as { session?: { access_token?: string } } | null;
  const jwt = sessionData?.session?.access_token;
      if (!jwt) { window.location.href = "/auth"; return; }

      const expense = { id: editingId, category: editCat, subcategory: editSubcat, supplier: editSupplier || null, amount: Number(editAmount) || 0, spend_type: editSpendType, notes: editNotes || null };
      const res = await fetch("/api/retirement", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` }, body: JSON.stringify({ expense }) });
      const json = await res.json();
      if (!res.ok) { console.error("Errore update:", json); alert("Errore aggiornamento"); return; }

      // refetch
      const fetchRes = await fetch("/api/retirement", { headers: { Authorization: `Bearer ${jwt}` } });
      const fetchJson = await fetchRes.json();
      setRows(fetchJson.rows || []);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Errore imprevisto");
    } finally {
      setCreating(false);
    }
  }

  async function deleteExpense(id: string) {
    if (!confirm("Eliminare questa spesa?")) return;
    try {
      setCreating(true);
  const supabase = getBrowserClient();
  const { data } = await supabase.auth.getSession();
  const sessionData = data as { session?: { access_token?: string } } | null;
  const jwt = sessionData?.session?.access_token;
      if (!jwt) { window.location.href = "/auth"; return; }

      const res = await fetch("/api/retirement", { method: "DELETE", headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` }, body: JSON.stringify({ expenseId: id }) });
      const json = await res.json();
      if (!res.ok) { console.error("Errore delete:", json); alert("Errore eliminazione"); return; }

      const fetchRes = await fetch("/api/retirement", { headers: { Authorization: `Bearer ${jwt}` } });
      const fetchJson = await fetchRes.json();
      setRows(fetchJson.rows || []);
    } catch (err) {
      console.error(err);
      alert("Errore imprevisto");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Festa di Pensionamento</h1>
      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <>
          {demo === true && <p className="mb-4 text-sm text-gray-600">Esempio demo (utente non autenticato)</p>}
          {demo === false && !eventName && (
            <div className="mb-4 text-sm text-gray-700">
              <p>Non hai ancora creato una Festa di Pensionamento &mdash; puoi crearla subito per iniziare a salvare il budget.</p>
              <div className="mt-3">
                <button
                  onClick={createEvent}
                  disabled={creating}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--color-sage) text-white font-semibold hover:brightness-95"
                >
                  {creating ? "Creazione..." : "Crea Evento Pensione"}
                </button>
              </div>
            </div>
          )}
          {eventName && <p className="mb-4 text-sm text-gray-700">Evento: {eventName}</p>}

          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold">Voci di budget</h2>
            <ul className="mt-3 divide-y">
              {rows.length === 0 && <li className="py-3 text-sm text-gray-500">Nessuna voce</li>}
              {rows.map((r, idx) => (
                <li key={r.id ?? idx} className="py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  {editingId === r.id ? (
                    <div className="w-full">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input value={editCat} onChange={(e) => setEditCat(e.target.value)} className="p-2 border rounded" />
                        <input value={editSubcat} onChange={(e) => setEditSubcat(e.target.value)} className="p-2 border rounded" />
                        <input value={editSupplier} onChange={(e) => setEditSupplier(e.target.value)} className="p-2 border rounded" />
                        <input value={editAmount} onChange={(e) => setEditAmount(e.target.value)} type="number" className="p-2 border rounded" />
                        <select value={editSpendType} onChange={(e) => setEditSpendType(e.target.value)} className="p-2 border rounded">
                          <option value="common">Comune</option>
                          <option value="bride">Sposa</option>
                          <option value="groom">Sposo</option>
                          <option value="retirement">Pensione</option>
                        </select>
                        <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="p-2 border rounded" />
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button onClick={saveEdit} disabled={creating} className="px-3 py-1 rounded bg-(--color-sage) text-white">Salva</button>
                        <button onClick={cancelEdit} className="px-3 py-1 rounded border">Annulla</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="font-medium">{r.category} — {r.subcategory}</div>
                        {r.supplier && <div className="text-sm text-gray-500">Fornitore: {r.supplier}</div>}
                        {r.notes && <div className="text-sm text-gray-500">Note: {r.notes}</div>}
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="font-medium">€ {Number(r.amount || 0).toFixed(2)}</div>
                        {r.spend_type && <div className="text-sm text-gray-500">{r.spend_type}</div>}
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => startEdit(r)} className="px-2 py-1 rounded border">Modifica</button>
                          {r.id && <button onClick={() => deleteExpense(r.id!)} className="px-2 py-1 rounded border text-red-600">Elimina</button>}
                        </div>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-end">
              <div className="font-semibold">Totale: € {total.toFixed(2)}</div>
            </div>

              <form onSubmit={submitExpense} className="mt-6 border-t pt-4">
                <h3 className="font-medium mb-2">Aggiungi spesa</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Categoria" className="p-2 border rounded" />
                  <input value={subcat} onChange={(e) => setSubcat(e.target.value)} placeholder="Sottocategoria" className="p-2 border rounded" />
                  <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Fornitore" className="p-2 border rounded" />
                  <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Importo" type="number" className="p-2 border rounded" />
                  <select value={spendType} onChange={(e) => setSpendType(e.target.value)} className="p-2 border rounded">
                    <option value="common">Comune</option>
                    <option value="bride">Sposa</option>
                    <option value="groom">Sposo</option>
                    <option value="retirement">Pensione</option>
                  </select>
                  <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note" className="p-2 border rounded" />
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="submit" disabled={creating} className="px-4 py-2 rounded bg-(--color-sage) text-white font-semibold">
                    {creating ? "Salvo..." : "Aggiungi spesa"}
                  </button>
                </div>
              </form>
          </div>
        </>
      )}
    </div>
  );
}
