"use client";

import ImageCarousel from "@/components/ImageCarousel";
import PageInfoNote from "@/components/PageInfoNote";
import { useToast } from "@/components/ToastProvider";
import { getUserCountrySafe } from "@/constants/geo";
import { formatCurrency, formatDate } from "@/lib/locale";
import { getPageImages } from "@/lib/pageImages";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const supabase = getBrowserClient();

type Expense = {
  id?: string;
  category: string;
  subcategory: string;
  supplier: string;
  description: string;
  amount: number;
  spendType: "common" | "bride" | "groom";
  status: "pending" | "approved" | "rejected";
  date: string;
  notes: string;
  fromDashboard: boolean; // indica se era nel preventivo
};

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

export default function SpesePage() {
  const t = useTranslations();
  const userEventType = typeof window !== "undefined" ? (localStorage.getItem("eventType") || "wedding") : "wedding";
  const country = getUserCountrySafe();
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [newExpense, setNewExpense] = useState<Expense>({
    category: ALL_CATEGORIES[0],
    subcategory: CATEGORIES_MAP[ALL_CATEGORIES[0]][0],
    supplier: "",
    description: "",
    amount: 0,
    spendType: "common",
    status: "pending",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    fromDashboard: false,
  });

  // Detect single-budget events (baptism, communion, confirmation, birthday, eighteenth)
  const isBaptism = userEventType === "baptism";
  const isCommunion = userEventType === "communion";
  const isConfirmation = userEventType === "confirmation";
  const isBirthday = userEventType === "birthday";
  const isEighteenth = userEventType === "eighteenth";
  const isSingleBudgetEvent = isBaptism || isCommunion || isConfirmation || isBirthday || isEighteenth;

  // For single-budget events: force spend type to common
  useEffect(() => {
    if (isSingleBudgetEvent && newExpense.spendType !== "common") {
      setNewExpense((prev) => ({ ...prev, spendType: "common" }));
    }
  }, [isSingleBudgetEvent, newExpense.spendType]);

  // Carica le spese
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;

      const headers: HeadersInit = {};
      if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
      }

      const r = await fetch("/api/my/expenses", { headers });
      const j = await r.json();

      setExpenses(j.expenses || []);
    } catch (err) {
      console.error("Errore caricamento:", err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;

      if (!jwt) {
        setMessage(t("expensesPage.messages.mustAuthAdd"));
        setSaving(false);
        return;
      }

      const r = await fetch("/api/my/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(newExpense),
      });

      if (!r.ok) {
        const j = await r.json();
        showToast(`Errore: ${j.error || "Impossibile salvare"}`, "error");
      } else {
        showToast(t("expensesPage.messages.successAdded"), "success");
        setShowForm(false);
        loadExpenses();
        // Reset form
        setNewExpense({
          category: ALL_CATEGORIES[0],
          subcategory: CATEGORIES_MAP[ALL_CATEGORIES[0]][0],
          supplier: "",
          description: "",
          amount: 0,
          spendType: "common",
          status: "pending",
          date: new Date().toISOString().split("T")[0],
          notes: "",
          fromDashboard: false,
        });
      }
    } catch (err) {
      console.error("Errore:", err);
      showToast(t("expensesPage.messages.networkError"), "error");
    } finally {
      setSaving(false);
    }
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

  // Raggruppa le spese per categoria e sottocategoria
  const groupedExpenses = expenses.reduce((acc, exp) => {
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
        <h2 className="font-serif text-3xl mb-6">{t("expensesPage.title")}</h2>
        <p className="text-gray-500">{t("expensesPage.loading")}</p>
      </section>
    );
  }

  return (
    <section className="pt-6">
  <h2 className="font-serif text-3xl mb-2">💸 {t("expensesPage.title")}</h2>
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
          <h3 className="font-semibold mb-4">{t("expensesPage.form.new")}</h3>
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
                onChange={(e) => setNewExpense({ ...newExpense, spendType: e.target.value as any })}
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
                <h3 className="font-semibold text-gray-800">
                  {group.category} → {group.subcategory}
                </h3>
                <div className="text-xs text-gray-600 mt-1">
                  {group.expenses.length} preventivo{group.expenses.length !== 1 ? "i" : ""}
                </div>
              </div>

              {/* Tabella preventivi per questo gruppo (scroll orizzontale su mobile) */}
              <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t("expensesPage.table.supplier")}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t("expensesPage.table.description")}</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-700">{t("expensesPage.table.amount")}</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-700">{t("expensesPage.table.type")}</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-700">{t("expensesPage.table.date")}</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-700">{t("expensesPage.table.status")}</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-700">{t("expensesPage.table.fromQuote")}</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-700">{t("expensesPage.table.actions")}</th>
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
                      <td className="px-4 py-3 font-medium">{exp.supplier || "—"}</td>
                      <td className="px-4 py-3">{exp.description || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatEuro(exp.amount)}</td>
                      <td className="px-4 py-3 text-center capitalize text-xs">
                        {isSingleBudgetEvent ? t("expensesPage.spendType.common") : (exp.spendType === "common" ? t("expensesPage.spendType.common") : exp.spendType === "bride" ? t("expensesPage.spendType.bride") : t("expensesPage.spendType.groom"))}
                      </td>
                      <td className="px-4 py-3 text-center text-xs">{formatDate(new Date(exp.date))}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          exp.status === "approved" ? "bg-green-100 text-green-800 font-semibold" :
                          exp.status === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {exp.status === "approved" ? t("expensesPage.status.approved") : exp.status === "rejected" ? t("expensesPage.status.rejected") : t("expensesPage.status.pending")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {exp.fromDashboard ? <span className="text-green-600 font-bold">✓</span> : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {exp.status === "pending" && (
                          <div className="flex gap-2 justify-center">
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
                          </div>
                        )}
                        {exp.status === "approved" && (
                          <span className="text-xs text-gray-400">{t("expensesPage.messages.confirmed")}</span>
                        )}
                        {exp.status === "rejected" && (
                          <span className="text-xs text-gray-400">{t("expensesPage.messages.discarded")}</span>
                        )}
                      </td>
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
}

function formatEuro(n: number) {
  return formatCurrency(n, "EUR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
