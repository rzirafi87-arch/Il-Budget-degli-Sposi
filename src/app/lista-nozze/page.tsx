"use client";

import { useEffect, useState } from "react";

type GiftItem = {
  id?: string;
  type: string;
  name: string;
  description?: string;
  price?: number;
  url?: string;
  priority?: "alta" | "media" | "bassa";
  status?: "desiderato" | "acquistato";
  notes?: string;
};

const GIFT_TYPES = [
  "Contributo viaggio di nozze",
  "Cassa comune",
  "Esperienze (cene, spa, tour)",
  "Arredamento",
  "Elettrodomestici",
  "Beni di lusso",
  "Beneficenza",
  "Buoni regalo",
  "Tech & Smart Home",
  "Altro",
];

export default function ListaNozzePage() {
  const [items, setItems] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<GiftItem>({
    type: GIFT_TYPES[0],
    name: "",
    description: "",
    price: undefined,
    url: "",
    priority: "media",
    status: "desiderato",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/my/gift-list");
        const json = await res.json();
        setItems(json.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addItem = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/my/gift-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) {
        const j = await res.json();
        setMessage(`❌ ${j.error || "Errore"}`);
      } else {
        const j = await res.json();
        setItems((prev) => [j.item, ...prev]);
        setMessage("✅ Aggiunto alla lista!");
        setNewItem({
          type: GIFT_TYPES[0], name: "", description: "", price: undefined, url: "",
          priority: "media", status: "desiderato", notes: "",
        });
        setTimeout(() => setMessage(null), 2500);
      }
    } catch (e) {
      setMessage("❌ Errore di rete");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-6">Lista Nozze</h2>

      {message && (
        <div className="my-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm">{message}</div>
      )}

      <div className="mb-6 p-5 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <h3 className="font-semibold mb-3">Aggiungi regalo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Tipologia</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
            >
              {GIFT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Es. Robot aspirapolvere"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prezzo stimato (€)</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={newItem.price || ""}
              onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) || undefined })}
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">Link</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={newItem.url}
              onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">Descrizione</label>
            <textarea
              className="border rounded px-3 py-2 w-full"
              rows={2}
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priorità</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={newItem.priority}
              onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as any })}
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="bassa">Bassa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stato</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={newItem.status}
              onChange={(e) => setNewItem({ ...newItem, status: e.target.value as any })}
            >
              <option value="desiderato">Desiderato</option>
              <option value="acquistato">Acquistato</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">Note</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              placeholder="Note opzionali"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={addItem}
            disabled={saving}
            className="bg-[#A3B59D] text-white rounded-lg px-6 py-2 hover:bg-[#8a9d84] disabled:opacity-50"
          >
            {saving ? "Salvataggio..." : "+ Aggiungi"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Caricamento...</div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-gray-500 rounded-xl border bg-white/70">Nessun elemento in lista</div>
      ) : (
        <div className="grid gap-4">
          {items.map((it) => (
            <div key={it.id || it.name + it.type} className="rounded-xl border bg-white/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-gray-600">{it.type} · {it.priority}</div>
                {it.description && (
                  <div className="text-sm text-gray-700 mt-1">{it.description}</div>
                )}
                {it.url && (
                  <a className="text-sm text-blue-600 underline" href={it.url} target="_blank" rel="noreferrer">Link</a>
                )}
              </div>
              <div className="text-right">
                {typeof it.price === "number" && (
                  <div className="font-bold">€ {it.price.toLocaleString("it-IT")}</div>
                )}
                <div className="text-xs text-gray-500 mt-1">{it.status === "acquistato" ? "✓ Acquistato" : "Desiderato"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
