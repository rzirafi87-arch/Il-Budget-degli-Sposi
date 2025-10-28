  // Stato checklist interattiva
  const [checkedChecklist, setCheckedChecklist] = useState<{[key:string]:boolean}>({});
  // Suggerimenti dinamici
  const SUGGESTIONS = useMemo(() => {
    if (userCountry === "mx") {
      return [
        "Ricorda di prenotare il Mariachi!",
        "Verifica la disponibilità della location almeno 6 mesi prima.",
        "Considera una fotocabina a tema messicano per la festa.",
        "Controlla i documenti legali richiesti in Messico.",
      ];
    }
    return [
      "Prenota il fotografo con largo anticipo.",
      "Verifica la lista invitati e aggiorna le preferenze.",
      "Controlla le tradizioni locali per arricchire la cerimonia.",
    ];
  }, [userCountry]);
  // Quick change
  function handleQuickChange(type: "language"|"country"|"eventType") {
    if (type === "language") window.location.href = "/select-language";
    if (type === "country") window.location.href = "/select-country";
    if (type === "eventType") window.location.href = "/select-event-type";
  }
"use client";

// --- Localizzazione Messico ---
const CATEGORIES_MAP_MX: Record<string, string[]> = {
  "Novia": ["Vestido de novia", "Zapatos", "Accesorios", "Maquillaje", "Pettinatura"],
  "Novio": ["Traje de novio", "Zapatos", "Accesorios", "Barbería"],
  "Recepción y Banquete": ["Tarta nupcial", "Menú", "Bebidas", "Decoración tavoli", "Centros de mesa"],
  "Música y Animación": ["Mariachi", "Banda folklórica", "DJ", "Animador", "Bailes tipici"],
  "Tradiciones mexicanas": [
    "El Lazo",
    "Las Arras Matrimoniales",
    "Padrinos y Madrinas",
    "Decoraciones tradizionali (Papel Picado)",
    "Ceremonia & fiesta lunga",
    "Musica tradizionale",
    "Elementi culturali locali",
    "Bienvenida/Fiesta de bienvenida",
    "After-party",
    "Fotocabina con motivo mexicano"
  ],
  "Decoración": ["Decoración floral", "Papel Picado", "Colores vivaci", "Archi floreali", "Illuminazione"],
  "Fotografía y Video": ["Fotógrafo", "Videógrafo", "Fotocabina", "Album", "Drone"],
  "Transporte": ["Transporte invitados", "Auto sposi", "Bus navetta"],
  "Regalos": ["Lista de regalos", "Detalles para invitados"],
  "Documentos": ["Licencia de matrimonio", "Documentos legali"],
  "Location": ["Salón de fiestas", "Jardín", "Hacienda", "Playa"],
  "Iglesia": ["Ceremonia religiosa", "Decoración iglesia"],
};
// Checklist tradizioni messicane
const TRADICIONES_MEXICO = [
  {
    nome: "El Lazo",
    descrizione: "Il cordone/laccio (a forma di otto) che viene posto intorno agli sposi dopo la cerimonia, simbolo di unione eterna.",
    posizione: "Modulo Rituali"
  },
  {
    nome: "Las Arras Matrimoniales",
    descrizione: "Le 13 monete che lo sposo dona alla sposa come simbolo di sostegno reciproco.",
    posizione: "Modulo Simboli/Scambi"
  },
  {
    nome: "Padrinos y Madrinas",
    descrizione: "Sponsor/testimoni che assumono ruoli attivi (ringer, anelli, bomboniere, decorazioni).",
    posizione: "Modulo Partecipanti"
  },
  {
    nome: "Decorazioni tradizionali",
    descrizione: "Papel Picado, colori vivaci, musica mariachi.",
    posizione: "Decorazioni & Atmosfera"
  },
  {
    nome: "Ceremonia & fiesta lunga",
    descrizione: "Festa estesa, musica e balli tipici messicani.",
    posizione: "Timeline Evento"
  },
  {
    nome: "Musica tradizionale",
    descrizione: "Banda mariachi, gruppi folkloristici, elementi locali.",
    posizione: "Musica / Intrattenimento"
  },
  {
    nome: "Elementi culturali locali",
    descrizione: "Bienvenida/Fiesta de bienvenida, After-party, Fotocabina con motivo mexicano.",
    posizione: "Extra/Opzioni"
  }
];

const LABELS_MX = {
  dashboard: "Panel principal",
  timeline: "Cronología",
  budget: "Presupuesto",
  weddingThings: "Elementos de la boda",
  saveTheDate: "Reserva la fecha",
  guests: "Invitados",
  accounting: "Contabilidad",
  suppliers: "Proveedores",
  location: "Lugar",
  churches: "Iglesias",
  documents: "Documentos",
  giftList: "Lista de regalos",
  favorites: "Favoritos",
  suggestions: "Sugerencias y Consejos",
};

const CATEGORIES_MAP_IT: Record<string, string[]> = {
  "Sposa": ["Abito sposa"],
  "Sposo": ["Abito sposo"],
  "Location & Catering": ["Torta nuziale"],
  "Musica & Animazione": ["DJ"],
  "Tradizioni": ["Serenata", "Confetti"],
  "Decorazioni": ["Fiori"],
  "Foto & Video": ["Fotografo"],
  "Trasporti": ["Auto sposi"],
};

const LABELS_IT = {
  dashboard: "Dashboard",
  timeline: "Timeline",
  budget: "Budget",
  weddingThings: "Cose matrimonio",
  saveTheDate: "Save the Date",
  guests: "Invitati",
  accounting: "Contabilità",
  suppliers: "Fornitori",
  location: "Location",
  churches: "Chiese",
  documents: "Documenti",
  giftList: "Lista regali",
  favorites: "Preferiti",
  suggestions: "Suggerimenti & Consigli",
};


// ...existing code...

import { useMemo, useState, useEffect } from "react";
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
function DashboardPage() {
  // Recupera le scelte utente da localStorage
  const [userLang, setUserLang] = useState<string>("");
  const [userCountry, setUserCountry] = useState<string>("");
  const [userEventType, setUserEventType] = useState<string>("");
  useEffect(() => {
    setUserLang(localStorage.getItem("language") || "it");
    setUserCountry(localStorage.getItem("country") || "it");
    setUserEventType(localStorage.getItem("eventType") || "wedding");
  }, []);
  // Variabili di esempio per la demo
  const LABELS_RENDER = {
    dashboard: "Dashboard",
    budget: "Budget",
  };
  const countryState = userCountry;
  // Stato per dati Messico
  const [traditionsMX, setTraditionsMX] = useState<any[]>([]);
  const [checklistMX, setChecklistMX] = useState<any[]>([]);
  const [vendorsMX, setVendorsMX] = useState<any[]>([]);
  const [budgetItemsMX, setBudgetItemsMX] = useState<any[]>([]);
  useEffect(() => {
    if (userCountry === "mx") {
      // Tradizioni
      fetch("/api/traditions").then(r => r.json()).then(d => setTraditionsMX(d.data || [])).catch(() => setTraditionsMX([]));
      // Checklist
      fetch("/api/checklist-modules").then(r => r.json()).then(d => setChecklistMX(d.data || [])).catch(() => setChecklistMX([]));
      // Vendors
      fetch("/api/vendors").then(r => r.json()).then(d => setVendorsMX(d.data || [])).catch(() => setVendorsMX([]));
      // Budget items
      fetch("/api/budget-items").then(r => r.json()).then(d => setBudgetItemsMX(d.data || [])).catch(() => setBudgetItemsMX([]));
    }
  }, [userCountry]);
  // Stub variabili/funzioni mancanti
  const message = "";
  const totalCommon = 0;
  const saving = false;
  const updateRow = (id: string | undefined, field: keyof SpendRow, value: any) => {};
  const saveData = () => {};
  const [rows, setRows] = useState<SpendRow[]>([]);
  const [brideBudget, setBrideBudget] = useState<number>(0);
  const [groomBudget, setGroomBudget] = useState<number>(0);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [weddingDate, setWeddingDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const totalSpent = rows.reduce((sum: number, r: SpendRow) => sum + r.amount, 0);
  const totalBride = rows.filter((r: SpendRow) => r.spendType === "bride").reduce((sum: number, r: SpendRow) => sum + r.amount, 0);
  const totalGroom = rows.filter((r: SpendRow) => r.spendType === "groom").reduce((sum: number, r: SpendRow) => sum + r.amount, 0);

  const remainingBride = brideBudget - totalBride;
  const remainingGroom = groomBudget - totalGroom;
  const remaining = totalBudget - totalSpent;

  // Calcola spese per categoria per il grafico a barre
  const categorySpends = useMemo(() => {
    const categoryMap = new Map<string, number>();
    rows.forEach((row: SpendRow) => {
      const current = categoryMap.get(row.category) || 0;
      categoryMap.set(row.category, current + row.amount);
    });
    const total = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0) || 1;
    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / total) * 100),
    }));
  }, [rows]);

  // --- RENDER PRINCIPALE ---
  return (
    <div>
      {/* Riepilogo scelte utente */}
      {/* Sezione riassuntiva personalizzata + quick change */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-center">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
          <span className="text-xl">🌐</span>
          <span className="font-semibold">Lingua:</span>
          <span>{userLang === "it" ? "Italiano" : userLang === "es" ? "Español" : userLang === "en" ? "English" : userLang}</span>
          <button className="ml-2 px-2 py-1 text-xs bg-[#A3B59D] text-white rounded" onClick={()=>handleQuickChange("language")}>Cambia</button>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
          <span className="text-xl">📍</span>
          <span className="font-semibold">Nazione:</span>
          <span>{userCountry === "mx" ? "Messico" : userCountry === "it" ? "Italia" : userCountry.toUpperCase()}</span>
          <button className="ml-2 px-2 py-1 text-xs bg-[#A3B59D] text-white rounded" onClick={()=>handleQuickChange("country")}>Cambia</button>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
          <span className="text-xl">🎉</span>
          <span className="font-semibold">Evento:</span>
          <span>{userEventType === "wedding" ? (userLang === "es" ? "Boda" : userLang === "it" ? "Matrimonio" : "Wedding") : userEventType === "anniversary" ? (userLang === "es" ? "Aniversario" : userLang === "it" ? "Anniversario" : "Anniversary") : "Altro"}</span>
          <button className="ml-2 px-2 py-1 text-xs bg-[#A3B59D] text-white rounded" onClick={()=>handleQuickChange("eventType")}>Cambia</button>
        </div>
      </div>
      {/* Suggerimenti dinamici */}
      <div className="mb-6 p-4 rounded-xl bg-blue-50 border-l-4 border-blue-400 text-blue-900">
        <h3 className="font-bold mb-2">Suggerimenti & Consigli</h3>
        <ul className="list-disc ml-6">
          {SUGGESTIONS.map((s, idx) => <li key={idx}>{s}</li>)}
        </ul>
      </div>
      <h2 className="font-serif text-3xl mb-6">{LABELS_RENDER.dashboard}</h2>
      <h2 className="font-serif text-2xl sm:text-3xl mb-2 sm:mb-4 font-bold">💰 {LABELS_RENDER.dashboard} {LABELS_RENDER.budget}</h2>
      {countryState === "mx" && (
        <div className="mb-4 p-4 rounded-xl bg-green-50 border-l-4 border-green-400 text-green-900">
          <div className="mb-2 font-semibold">💱 Tutti i costi sono espressi in <span className="font-bold">peso messicano (MXN)</span>.</div>
          <div className="text-sm">Nota: Puoi convertire i valori in EUR usando il tasso di cambio attuale. <a href="https://www.xe.com/it/currencyconverter/" target="_blank" rel="noopener" className="underline text-green-700">Convertitore valuta</a></div>
        </div>
      )}
      {countryState === "mx" && (
        <div className="mt-8 mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <h2 className="text-2xl font-bold mb-4 text-yellow-700">Tradiciones mexicanas</h2>
          <ul className="space-y-2">
            {traditionsMX.length > 0 ? traditionsMX.map((t: any) => (
              <li key={t.id || t.nome}>
                <span className="font-semibold text-yellow-800">{t.nome}</span>: <span className="text-gray-700">{t.descrizione}</span>
                {t.posizione && <span className="ml-2 text-xs text-yellow-600">({t.posizione})</span>}
              </li>
            )) : <li className="text-gray-500">Nessuna tradizione trovata.</li>}
          </ul>
          {/* Checklist Messico interattiva */}
          <h3 className="text-xl font-bold mt-6 mb-2 text-yellow-700">Checklist Messicana</h3>
          <ul className="space-y-1">
            {checklistMX.length > 0 ? checklistMX.map((c: any) => (
              <li key={c.id || c.nome} className="flex items-center gap-2">
                <input type="checkbox" checked={!!checkedChecklist[c.id || c.nome]} onChange={()=>setCheckedChecklist(prev=>({...prev, [c.id || c.nome]: !prev[c.id || c.nome]}))} />
                <span className={checkedChecklist[c.id || c.nome] ? "line-through text-gray-400" : "font-semibold text-yellow-800"}>{c.nome}</span>
                <span className="text-gray-700">{c.descrizione}</span>
              </li>
            )) : <li className="text-gray-500">Nessuna checklist trovata.</li>}
          </ul>
          {/* Vendors Messico */}
          <h3 className="text-xl font-bold mt-6 mb-2 text-yellow-700">Fornitori Messicani</h3>
          <ul className="space-y-1">
            {vendorsMX.length > 0 ? vendorsMX.map((v: any) => (
              <li key={v.id || v.nome}>
                <span className="font-semibold text-yellow-800">{v.nome}</span>: <span className="text-gray-700">{v.tipo}</span>
              </li>
            )) : <li className="text-gray-500">Nessun fornitore trovato.</li>}
          </ul>
          {/* Budget Items Messico */}
          <h3 className="text-xl font-bold mt-6 mb-2 text-yellow-700">Voci di Budget Messicane</h3>
          <ul className="space-y-1">
            {budgetItemsMX.length > 0 ? budgetItemsMX.map((b: any) => (
              <li key={b.id || b.nome}>
                <span className="font-semibold text-yellow-800">{b.nome}</span>: <span className="text-gray-700">{b.categoria}</span>
              </li>
            )) : <li className="text-gray-500">Nessuna voce di budget trovata.</li>}
          </ul>
        </div>
      )}
      <div className="mb-6 sm:mb-8 p-5 sm:p-6 rounded-2xl border-2 border-gray-200 bg-white shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">💐 Budget Sposa {countryState === "mx" ? "(MXN)" : "(€)"}</label>
            <input
              type="number"
              className="border-2 border-pink-300 rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              value={brideBudget || ""}
              onChange={(e) => setBrideBudget(Number(e.target.value) || 0)}
              placeholder={countryState === "mx" ? "Ej. 10000" : "Es. 10000"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🤵 Budget Sposo {countryState === "mx" ? "(MXN)" : "(€)"}</label>
            <input
              type="number"
              className="border-2 border-blue-300 rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              value={groomBudget || ""}
              onChange={(e) => setGroomBudget(Number(e.target.value) || 0)}
              placeholder={countryState === "mx" ? "Ej. 10000" : "Es. 10000"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">💑 Budget Totale {countryState === "mx" ? "(MXN)" : "(€)"}</label>
            <input
              type="number"
              className="border-2 border-gray-300 bg-gray-100 rounded-lg px-4 py-3 w-full font-bold text-base"
              value={totalBudget || ""}
              readOnly
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📅 Data Matrimonio</label>
            <input
              type="date"
              className="border-2 border-[#A3B59D] rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D]"
              value={weddingDate || ""}
              onChange={(e) => setWeddingDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* ...altri blocchi JSX della dashboard vanno qui, racchiusi nel <div> principale... */}
    </div>
  );
// ...existing code...
function formatEuro(n: number) {
  return (n || 0).toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

}
export default DashboardPage;
