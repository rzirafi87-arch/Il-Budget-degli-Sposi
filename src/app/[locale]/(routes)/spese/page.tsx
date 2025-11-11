"use client";

import ImageCarousel from "@/components/ImageCarousel";
import PageInfoNote from "@/components/PageInfoNote";
// import { useToast } from "@/components/ToastProvider";
// import { getUserCountrySafe } from "@/constants/geo";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/locale";
import { getPageImages } from "@/lib/pageImages";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";



function ExpensesPage() {
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

  const supabase = getBrowserClient();
  const t = useTranslations();
  const country = "IT";
  const isSingleBudgetEvent = false;
  const [plannedBudget, setPlannedBudget] = useState<Record<string, number>>({});
  const [overBudgetKeys, setOverBudgetKeys] = useState<string[]>([]);
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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string|null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expenseHistory, setExpenseHistory] = useState<any[]>([]);

  // ...qui va tutto il resto della logica, useEffect, funzioni, return JSX...
  // (sposta qui tutto il codice che era fuori dal componente, assicurandoti che sia dentro ExpensesPage)
}

export default ExpensesPage;

        // Apri modal e carica storico
        const openHistoryModal = (expenseId: string) => {
          setSelectedExpenseId(expenseId);
          setShowHistoryModal(true);
          loadExpenseHistory(expenseId);
        };

        // ...resto del codice esistente (copia tutto il contenuto della pagina qui dentro, senza duplicare hook)...

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

        const ALL_CATEGORIES = Object.keys(CATEGORIES_MAP);



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
                            onClick={() => openHistoryModal(exp.id!)}
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
                              onClick={() => openHistoryModal(exp.id!)}
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
        <div className="min-h-[120px]">
          {historyLoading ? (
            <div className="flex items-center justify-center h-24 text-gray-400">Caricamento...</div>
          ) : (
            expenseHistory.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-gray-400">Nessuna modifica registrata</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {expenseHistory.map((h) => (
                  <li key={h.id} className="py-3 px-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <span className="font-mono text-gray-400">{new Date(h.created_at).toLocaleString("it-IT")}</span>
                      <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 ml-2">{h.action}</span>
                    </div>
                    <div className="text-sm">
                      {/* Placeholder: mostra differenze old_data/new_data */}
                      <span className="text-gray-700">Modifica: </span>
                      <span className="font-mono text-xs text-gray-600">{JSON.stringify(h.new_data)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )
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
