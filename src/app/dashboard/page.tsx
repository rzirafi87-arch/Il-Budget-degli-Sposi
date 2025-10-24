"use client";

import { useEffect, useState, useMemo } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";
import ImageCarousel from "@/components/ImageCarousel";
import { PAGE_IMAGES } from "@/lib/pageImages";
import BudgetChart from "@/components/BudgetChart";
import CategoryBars from "@/components/CategoryBars";
import { useToast } from "@/components/ToastProvider";

const supabase = getBrowserClient();

type SpendRow = {
  id?: string;
  category: string;
  subcategory: string;
  supplier: string;
  amount: number;
  spendType: "common" | "bride" | "groom" | "gift";
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
  "Cerimonia/Chiesa Location": [
    "Chiesa / Comune",
    "Musiche",
    "Libretti Messa",
    "Fiori cerimonia",
    "Wedding bag",
    "Ventagli",
    "Pulizia chiesa",
    "Cesto doni",
    "Documenti e pratiche",
    "Offerte / Diritti",
    "Colombe uscita",
    "Riso/Petali",
    "Bottiglia per brindisi",
    "Bicchieri per brindisi",
    "Forfait cerimonia",
  ],
  "Fuochi d'artificio": [
    "Fuochi d'artificio tradizionali",
    "Fontane luminose",
    "Spettacolo pirotecnico",
    "Bengala per ospiti",
    "Lancio palloncini luminosi",
    "Forfait fuochi d'artificio",
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
    "Forfait fioraio",
  ],
  "Foto & Video": [
    "Servizio fotografico",
    "Video",
    "Drone",
    "Album",
    "Stampe",
    "Secondo fotografo",
    "Forfait fotografo",
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
    "e)",
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
  "Ricevimento Location": [
    "Affitto sala",
    "Catering / Banqueting",
    "Torta nuziale",
    "Vini & Bevande",
    "Open bar",
    "Mise en place",
    "Noleggio tovagliato / piatti",
    "Forfait location",
    "Forfait catering (prezzo a persona)",
  ],
  "Musica & Intrattenimento": [
    "DJ / Band",
    "Audio / Luci",
    "Animazione",
    "Diritti SIAE",
    "Guestbook phone / Postazioni",
    "Forfait musica & intrattenimento",
  ],
  "Musica Cerimonia": [
    "Coro",
    "Organo",
    "Arpa",
    "Violino",
    "Violoncello",
    "Gruppo strumenti",
    "Forfait musica cerimonia",
  ],
  "Musica Ricevimento": [
    "DJ",
    "Band live",
    "Orchestra",
    "Duo acustico",
    "Pianista",
    "Forfait musica ricevimento",
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
    "Regalo testimoni",
    "Regalo damigelle",
    "Regalo pagetti",
    "Realizzazione bomboniere",
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
  "Addio al Nubilato": [
    "Location addio al nubilato",
    "Ristorante / Cena",
    "Attività / Esperienze",
    "Gadget / T-shirt",
    "Decorazioni / Palloncini",
    "Trasporti",
    "Alloggio",
    "Forfait addio al nubilato",
  ],
  "Addio al Celibato": [
    "Location addio al celibato",
    "Ristorante / Cena",
    "Attività / Esperienze",
    "Gadget / T-shirt",
    "Decorazioni / Palloncini",
    "Trasporti",
    "Alloggio",
    "Forfait addio al celibato",
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
    "Passaporto",
    "Extra",
    "Lista nozze",
  ],
  "Wedding Planner": [
    "Consulenza",
    "Full planning",
    "Partial planning",
    "Coordinamento giorno del matrimonio",
    "Forfait wedding planner",
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
  const { showToast } = useToast();
  const [brideBudget, setBrideBudget] = useState<number>(0);
  const [groomBudget, setGroomBudget] = useState<number>(0);
  const [rows, setRows] = useState<SpendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Budget totale calcolato automaticamente
  const totalBudget = brideBudget + groomBudget;

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

        setBrideBudget(j.brideBudget || 0);
        setGroomBudget(j.groomBudget || 0);
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
        showToast(`Errore: ${j.error || "Impossibile salvare"}`, "error");
      } else {
        showToast("✅ Dati salvati con successo!", "success");
      }
    } catch (err) {
      console.error("Errore salvataggio:", err);
      showToast("❌ Errore di rete", "error");
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

  // Calcola spese per categoria per il grafico a barre
  const categorySpends = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    rows.forEach((row) => {
      const current = categoryMap.get(row.category) || 0;
      categoryMap.set(row.category, current + row.amount);
    });

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalBudget > 0 ? (amount / totalBudget) * 100 : 0,
    }));
  }, [rows, totalBudget]);

  if (loading) {
    return (
      <section className="pt-6">
        <h2 className="font-serif text-3xl mb-6">Dashboard</h2>
        <p className="text-gray-500">Caricamento...</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-serif text-2xl sm:text-3xl mb-4 sm:mb-6 font-bold">💰 Dashboard Budget</h2>

      {/* Carosello immagini - height dinamica per mobile */}
      <ImageCarousel images={PAGE_IMAGES.dashboard} height="180px" />

      {message && (
        <div className="mb-4 p-4 rounded-xl bg-blue-50 border-2 border-blue-300 text-sm sm:text-base font-medium">{message}</div>
      )}

      <div className="mb-6 sm:mb-8 p-5 sm:p-6 rounded-2xl border-2 border-gray-200 bg-white shadow-md">
        <h3 className="font-semibold text-lg mb-4 text-gray-700">💵 Imposta Budget Iniziale</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">💐 Budget Sposa (€)</label>
            <input
              type="number"
              className="border-2 border-pink-300 rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              value={brideBudget || ""}
              onChange={(e) => setBrideBudget(Number(e.target.value) || 0)}
              placeholder="Es. 10000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🤵 Budget Sposo (€)</label>
            <input
              type="number"
              className="border-2 border-blue-300 rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              value={groomBudget || ""}
              onChange={(e) => setGroomBudget(Number(e.target.value) || 0)}
              placeholder="Es. 10000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">💑 Budget Totale (€)</label>
            <input
              type="number"
              className="border-2 border-gray-300 bg-gray-100 rounded-lg px-4 py-3 w-full font-bold text-base"
              value={totalBudget || ""}
              readOnly
              placeholder="0"
            />
          </div>
        </div>

        <div className="mt-5 sm:mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-xl border-3 border-pink-600 bg-gradient-to-br from-pink-100 to-pink-200 shadow-xl">
            <h4 className="font-bold text-base sm:text-lg text-pink-900 mb-3">💐 Budget Sposa</h4>
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between"><span className="text-gray-800 font-semibold">Disponibile:</span><span className="font-bold text-gray-900">€ {formatEuro(brideBudget)}</span></div>
              <div className="flex justify-between"><span className="text-gray-800 font-semibold">Speso:</span><span className="font-bold text-pink-700">€ {formatEuro(totalBride)}</span></div>
              <div className="flex justify-between border-t-2 border-pink-400 pt-2"><span className="text-gray-900 font-bold">Residuo:</span><span className={`font-bold text-lg ${remainingBride < 0 ? "text-red-700" : "text-green-700"}`}>€ {formatEuro(remainingBride)}</span></div>
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-xl border-3 border-blue-600 bg-gradient-to-br from-blue-100 to-blue-200 shadow-xl">
            <h4 className="font-bold text-base sm:text-lg text-blue-900 mb-3">🤵 Budget Sposo</h4>
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between"><span className="text-gray-800 font-semibold">Disponibile:</span><span className="font-bold text-gray-900">€ {formatEuro(groomBudget)}</span></div>
              <div className="flex justify-between"><span className="text-gray-800 font-semibold">Speso:</span><span className="font-bold text-blue-700">€ {formatEuro(totalGroom)}</span></div>
              <div className="flex justify-between border-t-2 border-blue-400 pt-2"><span className="text-gray-900 font-bold">Residuo:</span><span className={`font-bold text-lg ${remainingGroom < 0 ? "text-red-700" : "text-green-700"}`}>€ {formatEuro(remainingGroom)}</span></div>
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-xl border-3 border-gray-600 bg-gradient-to-br from-gray-200 to-gray-300 shadow-xl">
            <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-3">💑 Budget Totale</h4>
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between"><span className="text-gray-800 font-semibold">Disponibile:</span><span className="font-bold text-gray-900">€ {formatEuro(totalBudget)}</span></div>
              <div className="flex justify-between"><span className="text-gray-800 font-semibold">Speso:</span><span className="font-bold text-gray-900">€ {formatEuro(totalSpent)}</span></div>
              <div className="flex justify-between text-sm text-gray-700"><span className="font-medium">- Comune:</span><span className="font-semibold">€ {formatEuro(totalCommon)}</span></div>
              <div className="flex justify-between border-t-2 border-gray-500 pt-2"><span className="text-gray-900 font-bold">Residuo:</span><span className={`font-bold text-lg ${remaining < 0 ? "text-red-700" : "text-green-700"}`}>€ {formatEuro(remaining)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sezione Grafici Visuali */}
      {totalBudget > 0 && (
        <div className="mb-6 sm:mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grafico a torta */}
          <div className="p-6 rounded-2xl border-2 border-gray-200 bg-white shadow-md">
            <BudgetChart 
              totalBudget={totalBudget}
              spentAmount={totalSpent}
            />
          </div>

          {/* Barre per categoria */}
          <div className="p-6 rounded-2xl border-2 border-gray-200 bg-white shadow-md">
            <CategoryBars 
              categories={categorySpends}
              totalBudget={totalBudget}
            />
          </div>
        </div>
      )}

      {/* Tabella con scroll orizzontale su mobile */}
      <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-gray-200 bg-white/70 shadow-sm -mx-4 sm:mx-0">
        <div className="min-w-[800px]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-2 sm:px-3 py-2 text-left font-medium text-gray-700 w-[18%]">Categoria</th>
                <th className="px-1 sm:px-2 py-2 text-left font-medium text-gray-700 w-[15%]">Sottocategoria</th>
                <th className="px-2 sm:px-3 py-2 text-left font-medium text-gray-700 w-[20%]">Fornitore</th>
                <th className="px-1 sm:px-2 py-2 text-right font-medium text-gray-700 w-[10%]">Importo (€)</th>
                <th className="px-1 sm:px-2 py-2 text-left font-medium text-gray-700 w-[12%]">Tipo</th>
                <th className="px-2 sm:px-3 py-2 text-left font-medium text-gray-700 w-[25%]">Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-2 sm:px-3 py-2 text-gray-700 text-xs">{row.category}</td>
                  <td className="px-1 sm:px-2 py-2 text-gray-700 text-xs">{row.subcategory}</td>
                  <td className="px-2 sm:px-3 py-2">
                    <input type="text" className="border border-gray-200 rounded px-2 py-1 w-full text-xs" value={row.supplier} onChange={(e) => updateRow(row.id, "supplier", e.target.value)} placeholder="Fornitore" />
                  </td>
                  <td className="px-1 sm:px-2 py-2">
                    <input type="number" className="border border-gray-200 rounded px-2 py-1 w-full text-right text-xs" value={row.amount || ""} onChange={(e) => updateRow(row.id, "amount", Number(e.target.value) || 0)} placeholder="0" />
                  </td>
                  <td className="px-1 sm:px-2 py-2">
                    <select className="border border-gray-200 rounded px-1 py-1 w-full text-xs" value={row.spendType} onChange={(e) => updateRow(row.id, "spendType", e.target.value)}>
                      <option value="common">Comune</option>
                      <option value="bride">Sposa</option>
                      <option value="groom">Sposo</option>
                      <option value="gift">Regalo</option>
                    </select>
                  </td>
                  <td className="px-2 sm:px-3 py-2">
                    <input type="text" className="border border-gray-200 rounded px-2 py-1 w-full text-xs" value={row.notes} onChange={(e) => updateRow(row.id, "notes", e.target.value)} placeholder="Note..." />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota per mobile - PIÙ VISIBILE */}
      <div className="mt-3 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-xl sm:hidden">
        <p className="text-sm text-yellow-800 font-medium">💡 <strong>Suggerimento:</strong> Scorri la tabella a destra per vedere tutti i campi</p>
      </div>

      <div className="mt-6 sm:mt-8 flex gap-3">
        <button 
          onClick={saveData} 
          disabled={saving} 
          className="flex-1 sm:flex-none bg-gradient-to-r from-[#A3B59D] to-[#8a9d84] text-white rounded-xl px-8 py-4 hover:shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg active:scale-95 transition-all shadow-md"
        >
          {saving ? "⏳ Salvataggio..." : "💾 Salva Modifiche"}
        </button>
      </div>
    </section>
  );
}

function formatEuro(n: number) {
  return (n || 0).toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
