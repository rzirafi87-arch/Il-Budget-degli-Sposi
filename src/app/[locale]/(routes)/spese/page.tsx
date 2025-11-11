"use client";

import ImageCarousel from "@/components/ImageCarousel";
import PageInfoNote from "@/components/PageInfoNote";
// import { useToast } from "@/components/ToastProvider";
// import { getUserCountrySafe } from "@/constants/geo";
import { formatCurrency, formatDate } from "@/lib/locale";
import { getPageImages } from "@/lib/pageImages";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
  // Stato per modal storico modifiche
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string|null>(null);
// import { saveAs } from "file-saver";


const supabase = getBrowserClient();
// ...definizione unica di CATEGORIES_MAP sopra...
// const ALL_CATEGORIES = Object.keys(CATEGORIES_MAP); // già definito sopra
// Tipi
type SpendType = "common" | "bride" | "groom";
type Expense = {
  id?: string;
  category: string;
  subcategory: string;
  supplier: string;
  amount: number;
  spendType: SpendType;
  notes?: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  fromDashboard?: boolean;
  description?: string;
};


  const t = useTranslations();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newExpense, setNewExpense] = useState<Expense>({
    category: "",
    subcategory: "",
    supplier: "",
    amount: 0,
    spendType: "common",
    notes: "",
    date: "",
    status: "pending",
    description: "",
  });
  // Ricava il paese utente (mock: "IT")
  const country = "IT";
  // Determina se l'evento è a budget unico (mock: false)
  const isSingleBudgetEvent = false;

  // Stato per budget pianificato (da /api/budget-items)
  const [plannedBudget, setPlannedBudget] = useState<Record<string, number>>({});
  const [overBudgetKeys, setOverBudgetKeys] = useState<string[]>([]);

  // Carica budget pianificato per categoria-sottocategoria
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const jwt = data.session?.access_token;
        const headers: HeadersInit = {};
        if (jwt) headers.Authorization = `Bearer ${jwt}`;
        const country = (typeof window !== "undefined" ? localStorage.getItem("country") : "it") || "it";
        const res = await fetch(`/api/budget-items?country=${encodeURIComponent(country)}`, { headers });
        const json = await res.json();
        // Crea mappa "Categoria|Sottocategoria" => importo pianificato
        const map: Record<string, number> = {};
        if (Array.isArray(json?.items)) {
          for (const it of json.items) {
            const cat = it.category || (it.name ? String(it.name).split(" - ")[0] : "");
            const sub = it.subcategory || (it.name ? String(it.name).split(" - ")[1] : "");
            const key = `${cat}|${sub}`;
            map[key] = Number(it.amount || 0);
          }
        }
        setPlannedBudget(map);
      } catch {
        setPlannedBudget({});
      }
    })();
  }, []);

  // Calcola se ci sono superamenti budget
  useEffect(() => {
    if (!expenses.length || !Object.keys(plannedBudget).length) {
      setOverBudgetKeys([]);
      return;
    }
    // Somma spese per chiave
    const actual: Record<string, number> = {};
    for (const exp of expenses) {
      const key = `${exp.category}|${exp.subcategory}`;
      actual[key] = (actual[key] || 0) + (exp.amount || 0);
    }
    // Trova chiavi over budget
    const over = Object.keys(plannedBudget).filter(
      key => actual[key] > plannedBudget[key] && plannedBudget[key] > 0
    );
    setOverBudgetKeys(over);
  }, [expenses, plannedBudget]);

  // Aggiungi nuova spesa
  const addExpense = async () => {
    setSaving(true);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (jwt) headers.Authorization = `Bearer ${jwt}`;
      const res = await fetch("/api/my/expenses", {
        method: "POST",
        headers,
        body: JSON.stringify(newExpense),
      });
      if (res.ok) {
        setMessage(t("expensesPage.messages.saved"));
        setShowForm(false);
        setNewExpense({
          category: "",
          subcategory: "",
          supplier: "",
          amount: 0,
          spendType: "common",
          notes: "",
          date: "",
          status: "pending",
          description: "",
        });
        loadExpenses();
      } else {
        setMessage(t("expensesPage.messages.saveError", { fallback: "Errore salvataggio" }));
      }
    } catch {
      setMessage("Errore salvataggio spesa");
    } finally {
      setSaving(false);
    }
  };

  // Caricamento spese
  const loadExpenses = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      const headers: HeadersInit = {};
      if (jwt) headers.Authorization = `Bearer ${jwt}`;
      const res = await fetch("/api/my/expenses", { headers });
      const json = await res.json();
      setExpenses(json.expenses || []);
    } catch {
      setMessage("Errore nel caricamento delle spese");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);


// Stesse categorie della dashboard
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
  ],
  "Spese varie": [
    "Spese varie",
  ],
};

  const updateExpenseStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;

      if (!jwt) {
        setMessage(t("expensesPage.messages.mustAuthAdd"));
        return;
      }

      const r = await fetch(`/api/my/expenses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ status }),
      });

      if (r.ok) {
        setMessage(status === "approved" ? t("expensesPage.status.approved") : t("expensesPage.status.rejected"));
        loadExpenses();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Errore:", err);
    }
  };

  const totalPending = expenses.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0);
  const totalApproved = expenses.filter(e => e.status === "approved").reduce((sum, e) => sum + e.amount, 0);


  // Stato filtri
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterSupplier, setFilterSupplier] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");

  // Ricava tutti i fornitori unici
  const allSuppliers = Array.from(new Set(expenses.map(e => e.supplier).filter(Boolean)));

  // Raggruppa le spese per categoria e sottocategoria
  const groupedExpenses = expenses.reduce((acc, exp) => {
    // Applica filtri
    if (
      (filterCategory && exp.category !== filterCategory) ||
      (filterSupplier && exp.supplier !== filterSupplier) ||
      (filterType && exp.spendType !== filterType) ||
      (filterDate && !exp.date.startsWith(filterDate))
    ) {
      return acc;
    }
    const key = `${exp.category}|${exp.subcategory}`;
    if (!acc[key]) {
      acc[key] = {
        category: exp.category,
        subcategory: exp.subcategory,
        expenses: [],
      };
    }
    acc[key].expenses.push(exp);
    return acc;
  }, {} as Record<string, { category: string; subcategory: string; expenses: Expense[] }>);

  // Ordina i gruppi seguendo l'ordine delle categorie
  const orderedGroups = Object.values(groupedExpenses).sort((a, b) => {
    const catIndexA = ALL_CATEGORIES.indexOf(a.category);
    const catIndexB = ALL_CATEGORIES.indexOf(b.category);
    if (catIndexA !== catIndexB) return catIndexA - catIndexB;
    // Ordina sottocategorie all'interno della stessa categoria
    const subsA = CATEGORIES_MAP[a.category] || [];
    const subsB = CATEGORIES_MAP[b.category] || [];
    return subsA.indexOf(a.subcategory) - subsB.indexOf(b.subcategory);
  });

  if (loading) {
    return (
      <section className="pt-6">
  <h2 className="font-serif text-3xl mb-6 text-center">{t("expensesPage.title")}</h2>
        <p className="text-gray-500">{t("expensesPage.loading")}</p>
      </section>
    );
  }



  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-2 text-center">💸 {t("expensesPage.title")}</h2>
      <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">{t("expensesPage.info.lead")}</p>

      <PageInfoNote
        icon="💰"
        title={t("expensesPage.info.title")}
        description={t("expensesPage.info.description")}
        tips={[
          t("expensesPage.info.tips.tip1"),
          t("expensesPage.info.tips.tip2"),
          t("expensesPage.info.tips.tip3"),
          t("expensesPage.info.tips.tip4"),
        ]}
        eventTypeSpecific={{
          wedding: t("expensesPage.info.eventTypeSpecific.wedding"),
          baptism: t("expensesPage.info.eventTypeSpecific.baptism"),
          communion: t("expensesPage.info.eventTypeSpecific.communion", { fallback: "Per la comunione, tutte le spese sono considerate comuni, senza divisione tra genitori." }),
          birthday: t("expensesPage.info.eventTypeSpecific.birthday"),
          graduation: t("expensesPage.info.eventTypeSpecific.graduation"),
        }}
      />

      {/* Carosello immagini */}
      <ImageCarousel images={getPageImages("spese", country)} height="280px" />

      {message && (
        <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm">
          {message}
        </div>
      )}

      {/* Banner superamento budget */}
      {overBudgetKeys && overBudgetKeys.length > 0 && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-300 text-red-800 shadow-sm">
          <div className="font-semibold mb-1 flex items-center gap-2">
            <span>⚠️</span>
            <span>Attenzione: alcune voci hanno superato il budget pianificato!</span>
          </div>
          <ul className="list-disc pl-6 text-sm">
            {overBudgetKeys.map(key => {
              const [cat, sub] = key.split("|");
              return (
                <li key={key}>
                  <span className="font-medium">{cat}</span>
                  {sub ? <span className="text-gray-700"> &rarr; {sub}</span> : null}
                  {plannedBudget[key] ? (
                    <span className="ml-2 text-xs text-gray-500">(Budget: {formatCurrency(plannedBudget[key], "EUR")})</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <div className="mt-2 text-xs">
            <Link href="/budget" className="underline text-red-700 hover:text-red-900">Vai al dettaglio budget</Link>
          </div>
        </div>
      )}

      {/* FILTRI avanzati */}
      <div className="mb-6 flex flex-wrap gap-2 items-end">
        <select className="border rounded px-2 py-1" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">Tutte le categorie</option>
          {ALL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select className="border rounded px-2 py-1" value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}>
          <option value="">Tutti i fornitori</option>
          {allSuppliers.map(sup => <option key={sup} value={sup}>{sup}</option>)}
        </select>
        <select className="border rounded px-2 py-1" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">Tutti i tipi</option>
          <option value="common">Comune</option>
          <option value="bride">Sposa</option>
          <option value="groom">Sposo</option>
        </select>
        <input type="date" className="border rounded px-2 py-1" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        {(filterCategory || filterSupplier || filterType || filterDate) && (
          <button className="ml-2 text-xs text-gray-500 underline" onClick={() => { setFilterCategory(""); setFilterSupplier(""); setFilterType(""); setFilterDate(""); }}>
            Azzera filtri
          </button>
        )}
      </div>

      {/* Riepilogo */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <div className="text-sm text-gray-600">{t("expensesPage.summary.pending")}</div>
          <div className="text-2xl font-semibold">{formatEuro(totalPending)}</div>
        </div>
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <div className="text-sm text-gray-600">{t("expensesPage.summary.approved")}</div>
          <div className="text-2xl font-semibold">{formatEuro(totalApproved)}</div>
        </div>
      </div>

      {/* Bottone aggiungi */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#A3B59D] text-white rounded-lg px-4 py-2 hover:bg-[#8a9d84]"
        >
          {showForm ? t("expensesPage.buttons.cancel") : t("expensesPage.buttons.add")}
        </button>
      </div>

      {/* Form nuova spesa */}
      {showForm && (
        <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
          <h3 className="font-semibold mb-4 text-center">{t("expensesPage.form.new")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("expensesPage.form.category")}</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newExpense.category}
                onChange={(e) => setNewExpense({
                  ...newExpense,
                  category: e.target.value,
                  subcategory: CATEGORIES_MAP[e.target.value][0]
                })}
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("expensesPage.form.subcategory")}</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newExpense.subcategory}
                onChange={(e) => setNewExpense({ ...newExpense, subcategory: e.target.value })}
              >
                {(CATEGORIES_MAP[newExpense.category] || []).map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("expensesPage.form.supplier")}</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newExpense.supplier}
                onChange={(e) => setNewExpense({ ...newExpense, supplier: e.target.value })}
                placeholder={t("expensesPage.form.placeholders.supplier")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("expensesPage.form.amount")}</label>
              <input
                type="number"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newExpense.amount || ""}
                onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) || 0 })}
                placeholder={t("expensesPage.form.placeholders.amount")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("expensesPage.form.spendType")}</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newExpense.spendType}
                onChange={(e) => setNewExpense({ ...newExpense, spendType: e.target.value as SpendType })}
              >
                <option value="common">{t("expensesPage.form.spendTypeOptions.common")}</option>
                {!isSingleBudgetEvent && <option value="bride">{t("expensesPage.form.spendTypeOptions.bride")}</option>}
                {!isSingleBudgetEvent && <option value="groom">{t("expensesPage.form.spendTypeOptions.groom")}</option>}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("expensesPage.form.date")}</label>
              <input
                type="date"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("expensesPage.form.description")}</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder={t("expensesPage.form.placeholders.description")}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("expensesPage.form.notes")}</label>
              <textarea
                className="border border-gray-300 rounded px-3 py-2 w-full"
                rows={2}
                value={newExpense.notes}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                placeholder={t("expensesPage.form.placeholders.notes")}
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={addExpense}
              disabled={saving}
              className="bg-[#A3B59D] text-white rounded-lg px-6 py-2 hover:bg-[#8a9d84] disabled:opacity-50"
            >
              {saving ? t("loading", { fallback: "Salvataggio..." }) : t("expensesPage.buttons.save")}
            </button>
          </div>
        </div>
      )}

      {/* Preventivi raggruppati per categoria */}
      <div className="space-y-8">
        {orderedGroups.length === 0 ? (
          <div className="p-10 text-center text-gray-400 rounded-2xl border border-gray-200 bg-white/70">
            {t("expensesPage.messages.none")}
          </div>
        ) : (
          orderedGroups.map((group, idx) => (
            <div key={idx} className="rounded-2xl border border-gray-200 bg-white/70 shadow-sm overflow-hidden">
              {/* Header gruppo */}
              <div className="bg-[#A3B59D]/10 px-6 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 text-center sm:text-left">
                  {group.category} → {group.subcategory}
                </h3>
                <div className="text-xs text-gray-600 mt-1">
                  {group.expenses.length} preventivo{group.expenses.length !== 1 ? "i" : ""}
                </div>
              </div>

              {/* MOBILE: cards */}
              <ul className="space-y-3 sm:hidden p-4">
                {group.expenses.map((exp) => (
                  <li key={exp.id} className="rounded-2xl border bg-card p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold">{exp.supplier || "—"}</span>
                      <span className="text-xs text-muted-foreground">{exp.description || "—"}</span>
                    </div>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <div><dt className="text-muted-foreground">{t("expensesPage.table.amount")}</dt><dd>{formatEuro(exp.amount)}</dd></div>
                      <div><dt className="text-muted-foreground">{t("expensesPage.table.type")}</dt><dd>{isSingleBudgetEvent ? t("expensesPage.spendType.common") : (exp.spendType === "common" ? t("expensesPage.spendType.common") : exp.spendType === "bride" ? t("expensesPage.spendType.bride") : t("expensesPage.spendType.groom"))}</dd></div>
                      <div><dt className="text-muted-foreground">{t("expensesPage.table.date")}</dt><dd>{formatDate(new Date(exp.date))}</dd></div>
                      <div><dt className="text-muted-foreground">{t("expensesPage.table.status")}</dt><dd>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          exp.status === "approved" ? "bg-green-100 text-green-800 font-semibold" :
                          exp.status === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {exp.status === "approved" ? t("expensesPage.status.approved") : exp.status === "rejected" ? t("expensesPage.status.rejected") : t("expensesPage.status.pending")}
                        </span>
                      </dd></div>
                      <div className="col-span-2"><dt className="text-muted-foreground">{t("expensesPage.table.fromQuote")}</dt><dd>{exp.fromDashboard ? <span className="text-green-600 font-bold">✓</span> : "—"}</dd></div>
                      <div className="col-span-2"><dt className="text-muted-foreground">Azioni</dt><dd>
                        <div className="flex gap-2 flex-wrap justify-center">
                          <button
                            onClick={() => { setSelectedExpenseId(exp.id!); setShowHistoryModal(true); }}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium border border-blue-200 rounded px-2 py-1 bg-blue-50"
                          >
                            Storico modifiche
                          </button>
                          {exp.status === "pending" && (
                            <>
                              <button
                                onClick={() => updateExpenseStatus(exp.id!, "approved")}
                                className="text-green-600 hover:text-green-800 text-xs font-medium"
                              >
                                {t("expensesPage.buttons.approve")}
                              </button>
                              <button
                                onClick={() => updateExpenseStatus(exp.id!, "rejected")}
                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                              >
                                {t("expensesPage.buttons.reject")}
                              </button>
                            </>
                          )}
                          {exp.status === "approved" && (
                            <span className="text-xs text-gray-400">{t("expensesPage.messages.confirmed")}</span>
                          )}
                          {exp.status === "rejected" && (
                            <span className="text-xs text-gray-400">{t("expensesPage.messages.discarded")}</span>
                          )}
                        </div>
                      </dd></div>
                    </dl>
                  </li>
                ))}
              </ul>

              {/* DESKTOP: tabella classica */}
              <div className="-mx-4 overflow-x-auto hidden sm:block">
                <table className="min-w-[680px] table-auto text-xs sm:min-w-full sm:text-sm">
                  <thead className="text-left">
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="whitespace-nowrap px-4 py-2">{t("expensesPage.table.supplier")}</th>
                      <th className="whitespace-nowrap px-4 py-2">{t("expensesPage.table.description")}</th>
                      <th className="whitespace-nowrap px-4 py-2">{t("expensesPage.table.amount")}</th>
                      <th className="whitespace-nowrap px-4 py-2">{t("expensesPage.table.type")}</th>
                      <th className="whitespace-nowrap px-4 py-2">{t("expensesPage.table.date")}</th>
                      <th className="whitespace-nowrap px-4 py-2">{t("expensesPage.table.status")}</th>
                      <th className="whitespace-nowrap px-4 py-2">{t("expensesPage.table.fromQuote")}</th>
                      <th className="whitespace-nowrap px-4 py-2">{t("expensesPage.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.expenses.map((exp) => (
                      <tr
                        key={exp.id}
                        className={`border-b border-gray-50 hover:bg-gray-50/60 ${
                          exp.status === "approved" ? "bg-green-50/30" :
                          exp.status === "rejected" ? "bg-red-50/30" : ""
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-2 font-medium">{exp.supplier || "—"}</td>
                        <td className="whitespace-nowrap px-4 py-2">{exp.description || "—"}</td>
                        <td className="whitespace-nowrap px-4 py-2 text-right font-semibold">{formatEuro(exp.amount)}</td>
                        <td className="whitespace-nowrap px-4 py-2 text-center capitalize text-xs">
                          {isSingleBudgetEvent ? t("expensesPage.spendType.common") : (exp.spendType === "common" ? t("expensesPage.spendType.common") : exp.spendType === "bride" ? t("expensesPage.spendType.bride") : t("expensesPage.spendType.groom"))}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-center text-xs">{formatDate(new Date(exp.date))}</td>
                        <td className="whitespace-nowrap px-4 py-2 text-center">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            exp.status === "approved" ? "bg-green-100 text-green-800 font-semibold" :
                            exp.status === "rejected" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {exp.status === "approved" ? t("expensesPage.status.approved") : exp.status === "rejected" ? t("expensesPage.status.rejected") : t("expensesPage.status.pending")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-center">
                          {exp.fromDashboard ? <span className="text-green-600 font-bold">✓</span> : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-center">
                          <div className="flex gap-2 flex-wrap justify-center">
                            <button
                              onClick={() => { setSelectedExpenseId(exp.id!); setShowHistoryModal(true); }}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium border border-blue-200 rounded px-2 py-1 bg-blue-50"
                            >
                              Storico modifiche
                            </button>
                            {exp.status === "pending" && (
                              <>
                                <button
                                  onClick={() => updateExpenseStatus(exp.id!, "approved")}
                                  className="text-green-600 hover:text-green-800 text-xs font-medium"
                                >
                                  {t("expensesPage.buttons.approve")}
                                </button>
                                <button
                                  onClick={() => updateExpenseStatus(exp.id!, "rejected")}
                                  className="text-red-600 hover:text-red-800 text-xs font-medium"
                                >
                                  {t("expensesPage.buttons.reject")}
                                </button>
                              </>
                            )}
                            {exp.status === "approved" && (
                              <span className="text-xs text-gray-400">{t("expensesPage.messages.confirmed")}</span>
                            )}
                            {exp.status === "rejected" && (
                              <span className="text-xs text-gray-400">{t("expensesPage.messages.discarded")}</span>
                            )}
                          </div>
                        </td>
      {/* Modal storico modifiche */}
      <Modal open={showHistoryModal} onClose={() => setShowHistoryModal(false)} title="Storico modifiche spesa" widthClass="max-w-xl">
        <div className="min-h-[120px] flex items-center justify-center text-gray-500">
          {selectedExpenseId ? (
            <span>Storico modifiche per spesa ID: <b>{selectedExpenseId}</b> (prossimamente...)</span>
          ) : (
            <span>Nessuna spesa selezionata</span>
          )}
        </div>
      </Modal>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
// Rimuovi chiusura extra

function formatEuro(n: number) {
  return formatCurrency(n, "EUR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
