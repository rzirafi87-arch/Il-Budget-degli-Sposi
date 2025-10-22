"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";

const supabase = getBrowserClient();

type SpendRow = {
  id?: string;
  category: string;
  subcategory: string;
  supplier: string;
  amount: number;
  spendType: "common" | "bride" | "groom";
  notes: string;
};

const CATEGORIES_MAP: Record<string, string[]> = {
  "Abiti & Accessori (altri)": [
    "Abiti ospiti / Genitori",
    "Accessori damigelle",
    "Accessori testimoni",
    "Fedi nuziali",
    "Anello fidanzamento",
    "Accessori vari",
  ],
  "Cerimonia": [
    "Chiesa / Comune",
    "Musiche",
    "Libretti Messa",
    "Fiori cerimonia",
    "Documenti e pratiche",
    "Offerte / Diritti",
  ],
  "Fiori & Decor": [
    "Bouquet",
    "Boutonnière",
    "Centrotavola",
    "Allestimenti",
    "Candele",
    "Tableau",
    "Segnaposto",
    "Noleggi (vasi / strutture)",
  ],
  "Foto & Video": [
    "Servizio fotografico",
    "Video",
    "Drone",
    "Album",
    "Stampe",
    "Secondo fotografo",
  ],
  "Inviti & Stationery": [
    "Partecipazioni",
    "Menu",
    "Segnaposto",
    "Libretti Messa",
    "Timbri / Cliché",
    "Francobolli / Spedizioni",
    "Calligrafia",
    "Cartoncini / Tag",
    "QR Code / Stampa",
  ],
  "Sposa": [
    "Abito sposa",
    "Scarpe sposa",
    "Accessori (velo, gioielli, ecc.)",
    "Intimo / sottogonna",
    "Parrucchiera",
    "Make-up",
    "Prove",
    "Altro sposa",
  ],
  "Sposo": [
    "Abito sposo",
    "Scarpe sposo",
    "Accessori (cravatta, gemelli, ecc.)",
    "Barbiere / Grooming",
    "Prove",
    "Altro sposo",
  ],
  "Location & Catering": [
    "Affitto sala",
    "Catering / Banqueting",
    "Torta nuziale",
    "Vini & Bevande",
    "Open bar",
    "Mise en place",
    "Noleggio tovagliato / piatti",
  ],
  "Musica & Intrattenimento": [
    "DJ / Band",
    "Audio / Luci",
    "Animazione",
    "Diritti SIAE",
    "Guestbook phone / Postazioni",
  ],
  "Trasporti": [
    "Auto sposi",
    "Navette ospiti",
    "Carburante / Pedaggi",
  ],
  "Bomboniere & Regali": [
    "Bomboniere",
    "Confetti",
    "Packaging / Scatole",
    "Allestimento tavolo bomboniere",
  ],
  "Ospitalità & Logistica": [
    "Alloggi ospiti",
    "Welcome bag / Kit",
    "Cartellonistica / Segnaletica",
  ],
  "Burocrazia": [
    "Pubblicazioni",
    "Certificati",
    "Traduzioni / Apostille",
  ],
  "Beauty & Benessere": [
    "Estetista",
    "SPA / Massaggi",
    "Solarium",
  ],
  "Viaggio di nozze": [
    "Quota viaggio",
    "Assicurazioni",
    "Visti / Documenti",
    "Extra",
    "Lista nozze",
  ],
  "Comunicazione & Media": [
    "Sito web / QR",
    "Social media",
    "Grafica / Design",
  ],
  "Extra & Contingenze": [
    "Imprevisti",
    "Spese varie",
  ],
};

const ALL_CATEGORIES = Object.keys(CATEGORIES_MAP);

export default function DashboardPage() {
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [brideBudget, setBrideBudget] = useState<number>(0);
  const [groomBudget, setGroomBudget] = useState<number>(0);
  const [rows, setRows] = useState<SpendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const generateAllRows = (): SpendRow[] => {
    const allRows: SpendRow[] = [];
    let idCounter = 1;

    ALL_CATEGORIES.forEach((category) => {
      const subcategories = CATEGORIES_MAP[category] || [];
      subcategories.forEach((subcategory) => {
        allRows.push({
          id: `gen-${idCounter++}`,
          category,
          subcategory,
          supplier: "",
          amount: 0,
          spendType: "common",
          notes: "",
        });
      });
    });

    return allRows;
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const jwt = data.session?.access_token;
        const headers: HeadersInit = {};
        if (jwt) headers.Authorization = `Bearer ${jwt}`;

        const r = await fetch("/api/my/dashboard", { headers });
        const j = await r.json();

  setTotalBudget(j.totalBudget || 0);
  setBrideBudget(j.brideBudget ?? Math.floor((j.totalBudget || 0) / 2));
  setGroomBudget(j.groomBudget ?? Math.ceil((j.totalBudget || 0) / 2));
        if (j.rows && j.rows.length > 0) setRows(j.rows);
        else setRows(generateAllRows());
      } catch (err) {
        console.error("Errore caricamento:", err);
        setRows(generateAllRows());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateRow = (id: string | undefined, field: keyof SpendRow, value: any) => {
    if (!id) return;
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const saveData = async () => {
    setSaving(true);
    setMessage(null);
    try {
    const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) {
        setMessage("❌ Devi essere autenticato per salvare. Clicca su 'Registrati' in alto.");
        setSaving(false);
        return;
      }

      const r = await fetch("/api/my/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
  body: JSON.stringify({ totalBudget, brideBudget, groomBudget, rows }),
      });

      if (!r.ok) {
        const j = await r.json();
        setMessage(`❌ Errore: ${j.error || "Impossibile salvare"}`);
      } else {
        setMessage("✅ Dati salvati con successo!");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Errore salvataggio:", err);
      setMessage("❌ Errore di rete");
    } finally {
      setSaving(false);
    }
  };

  const totalSpent = rows.reduce((sum, r) => sum + r.amount, 0);
  const totalCommon = rows.filter((r) => r.spendType === "common").reduce((sum, r) => sum + r.amount, 0);
  const totalBride = rows.filter((r) => r.spendType === "bride").reduce((sum, r) => sum + r.amount, 0);
  const totalGroom = rows.filter((r) => r.spendType === "groom").reduce((sum, r) => sum + r.amount, 0);

  const remainingBride = brideBudget - totalBride;
  const remainingGroom = groomBudget - totalGroom;
  const remaining = totalBudget - totalSpent;

  if (loading) {
    return (
      <section className="pt-6">
        <h2 className="font-serif text-3xl mb-6">Dashboard</h2>
        <p className="text-gray-500">Caricamento...</p>
      </section>
    );
  }

  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-6">Dashboard</h2>

      {message && (
        <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm">{message}</div>
      )}

      <div className="mb-8 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Budget totale disponibile (€)</label>
        <input
          type="number"
          className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs"
          value={totalBudget || ""}
          onChange={(e) => setTotalBudget(Number(e.target.value) || 0)}
          placeholder="Es. 20000"
        />

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Budget iniziale Sposa (€)</label>
            <input
              type="number"
              className="border border-pink-200 rounded px-3 py-2 w-full"
              value={brideBudget || ""}
              onChange={(e) => setBrideBudget(Number(e.target.value) || 0)}
              placeholder="Es. 10000"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Budget iniziale Sposo (€)</label>
            <input
              type="number"
              className="border border-blue-200 rounded px-3 py-2 w-full"
              value={groomBudget || ""}
              onChange={(e) => setGroomBudget(Number(e.target.value) || 0)}
              placeholder="Es. 10000"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-pink-200 bg-pink-50">
            <h4 className="font-semibold text-pink-700 mb-2">💐 Budget Sposa</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Disponibile:</span><span className="font-semibold">€ {formatEuro(brideBudget)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Speso:</span><span className="font-semibold text-pink-600">€ {formatEuro(totalBride)}</span></div>
              <div className="flex justify-between border-t pt-1"><span className="text-gray-700">Residuo:</span><span className={`font-bold ${remainingBride < 0 ? "text-red-600" : "text-green-600"}`}>€ {formatEuro(remainingBride)}</span></div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
            <h4 className="font-semibold text-blue-700 mb-2">🤵 Budget Sposo</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Disponibile:</span><span className="font-semibold">€ {formatEuro(groomBudget)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Speso:</span><span className="font-semibold text-blue-600">€ {formatEuro(totalGroom)}</span></div>
              <div className="flex justify-between border-t pt-1"><span className="text-gray-700">Residuo:</span><span className={`font-bold ${remainingGroom < 0 ? "text-red-600" : "text-green-600"}`}>€ {formatEuro(remainingGroom)}</span></div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-gray-300 bg-gray-50">
            <h4 className="font-semibold text-gray-700 mb-2">💑 Budget Totale</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Disponibile:</span><span className="font-semibold">€ {formatEuro(totalBudget)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Speso:</span><span className="font-semibold text-gray-700">€ {formatEuro(totalSpent)}</span></div>
              <div className="flex justify-between text-xs text-gray-500"><span>- Comune:</span><span>€ {formatEuro(totalCommon)}</span></div>
              <div className="flex justify-between border-t pt-1"><span className="text-gray-700">Residuo:</span><span className={`font-bold ${remaining < 0 ? "text-red-600" : "text-green-600"}`}>€ {formatEuro(remaining)}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="px-3 py-2 text-left font-medium text-gray-700 w-[18%]">Categoria</th>
              <th className="px-2 py-2 text-left font-medium text-gray-700 w-[15%]">Sottocategoria</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 w-[20%]">Fornitore</th>
              <th className="px-2 py-2 text-right font-medium text-gray-700 w-[10%]">Importo (€)</th>
              <th className="px-2 py-2 text-left font-medium text-gray-700 w-[12%]">Tipo</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 w-[25%]">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                <td className="px-3 py-2 text-gray-700 text-xs">{row.category}</td>
                <td className="px-2 py-2 text-gray-700 text-xs">{row.subcategory}</td>
                <td className="px-3 py-2">
                  <input type="text" className="border border-gray-200 rounded px-2 py-1 w-full text-xs" value={row.supplier} onChange={(e) => updateRow(row.id, "supplier", e.target.value)} placeholder="Fornitore" />
                </td>
                <td className="px-2 py-2">
                  <input type="number" className="border border-gray-200 rounded px-2 py-1 w-full text-right text-xs" value={row.amount || ""} onChange={(e) => updateRow(row.id, "amount", Number(e.target.value) || 0)} placeholder="0" />
                </td>
                <td className="px-2 py-2">
                  <select className="border border-gray-200 rounded px-1 py-1 w-full text-xs" value={row.spendType} onChange={(e) => updateRow(row.id, "spendType", e.target.value)}>
                    <option value="common">Comune</option>
                    <option value="bride">Sposa</option>
                    <option value="groom">Sposo</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input type="text" className="border border-gray-200 rounded px-2 py-1 w-full text-xs" value={row.notes} onChange={(e) => updateRow(row.id, "notes", e.target.value)} placeholder="Note..." />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <button onClick={saveData} disabled={saving} className="bg-[#A3B59D] text-white rounded-lg px-6 py-3 hover:bg-[#8a9d84] font-medium disabled:opacity-50">
          {saving ? "Salvataggio..." : "Salva modifiche"}
        </button>
      </div>
    </section>
  );
}

function formatEuro(n: number) {
  return (n || 0).toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
