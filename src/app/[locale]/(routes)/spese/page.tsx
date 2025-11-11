"use client";

import ImageCarousel from "@/components/ImageCarousel";
import PageInfoNote from "@/components/PageInfoNote";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/locale";
import { getPageImages } from "@/lib/pageImages";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// ---------------- Types ----------------
type SpendType = "common" | "bride" | "groom";

type Expense = {
  id: string;
  category: string;
  subcategory: string;
  supplier: string;
  amount: number;
  spendType: SpendType;
  notes?: string | null;
  date: string; // ISO
  status: "pending" | "approved" | "rejected";
  fromDashboard?: boolean;
  description?: string | null;
};

// ---------------- Utils ----------------
function formatEuro(n: number) {
  return formatCurrency(n, "EUR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ---------------- Component ----------------
export default function ExpensesPage() {
  const t = useTranslations();
  const supabase = useMemo(() => getBrowserClient(), []);
  const country = "IT"; // per le immagini
  const isSingleBudgetEvent = false; // se true, forza "common"

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);

  // Filtri
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterSupplier, setFilterSupplier] = useState<string>("");
  const [filterType, setFilterType] = useState<SpendType | "">("");
  const [filterDate, setFilterDate] = useState<string>(""); // YYYY-MM

  // Budget pianificato e controllo sforamenti (key = "cat|sub")
  const [plannedBudget, setPlannedBudget] = useState<Record<string, number>>({});
  const [overBudgetKeys, setOverBudgetKeys] = useState<string[]>([]);

  // Storico modifiche
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expenseHistory, setExpenseHistory] = useState<any[]>([]);

  // ---------------- Data loading ----------------
  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function authHeaders() {
    const { data } = await supabase.auth.getSession();
    const jwt = data.session?.access_token;
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (jwt) headers.Authorization = `Bearer ${jwt}`;
    return headers;
  }

  async function loadExpenses() {
    setLoading(true);
    try {
      // 1) prova API route se esiste
      const headers = await authHeaders();
      const res = await fetch("/api/my/expenses", { headers });
      if (res.ok) {
        const json = await res.json();
        setExpenses((json.expenses || []) as Expense[]);
      } else {
        // 2) fallback su Supabase (tabella "expenses")
        const { data, error } = await supabase
          .from("expenses")
          .select(
            "id, category, subcategory, supplier, amount, spendType, notes, date, status, fromDashboard, description"
          )
          .order("date", { ascending: false });
        if (error) throw error;
        setExpenses((data as Expense[]) || []);
      }
    } catch (err) {
      console.error("loadExpenses error:", err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }

  // Aggiorna stato spesa (approved/rejected)
  async function updateExpenseStatus(id: string, status: "approved" | "rejected") {
    try {
      const headers = await authHeaders();
      const r = await fetch(`/api/my/expenses/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });
      if (r.ok) {
        setMessage(
          status === "approved" ? t("expensesPage.status.approved") : t("expensesPage.status.rejected")
        );
        await loadExpenses();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Errore:", err);
    }
  }

  // Storico modifiche (modal)
  function openHistoryModal(expenseId: string) {
    setSelectedExpenseId(expenseId);
    setShowHistoryModal(true);
    void loadExpenseHistory(expenseId);
  }

  async function loadExpenseHistory(expenseId: string) {
    setHistoryLoading(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`/api/my/expenses/history?expenseId=${expenseId}`, { headers });
      const json = await res.json();
      setExpenseHistory(json.history || []);
    } catch {
      setExpenseHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  // Totali globali
  const totalPending = useMemo(
    () => expenses.filter((e) => e.status === "pending").reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenses]
  );
  const totalApproved = useMemo(
    () => expenses.filter((e) => e.status === "approved").reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenses]
  );

  // Fornitori unici per filtro
  const allSuppliers = useMemo(
    () => Array.from(new Set(expenses.map((e) => e.supplier).filter(Boolean))),
    [expenses]
  );

  // Raggruppa e filtra
  const groupedExpenses = useMemo(() => {
    return expenses.reduce(
      (acc: Record<string, { category: string; subcategory: string; expenses: Expense[] }>, exp) => {
        if (
          (filterCategory && exp.category !== filterCategory) ||
          (filterSupplier && exp.supplier !== filterSupplier) ||
          (filterType && exp.spendType !== filterType) ||
          (filterDate && !String(exp.date).startsWith(filterDate))
        ) {
          return acc;
        }
        const key = `${exp.category}|${exp.subcategory}`;
        if (!acc[key]) acc[key] = { category: exp.category, subcategory: exp.subcategory, expenses: [] };
        acc[key].expenses.push(exp);
        return acc;
      },
      {}
    );
  }, [expenses, filterCategory, filterSupplier, filterType, filterDate]);

  // Ordina gruppi per categoria/sottocategoria alfabeticamente
  const orderedGroups = useMemo(() => {
    return Object.values(groupedExpenses).sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.subcategory.localeCompare(b.subcategory);
    });
  }, [groupedExpenses]);

  // Calcolo sforamenti budget rispetto a plannedBudget
  useEffect(() => {
    const sums: Record<string, number> = {};
    for (const g of Object.values(groupedExpenses)) {
      const key = `${g.category}|${g.subcategory}`;
      sums[key] = (sums[key] || 0) + g.expenses.reduce((s, e) => s + (e.amount || 0), 0);
    }
    const over = Object.keys(plannedBudget).filter((k) => sums[k] > (plannedBudget[k] || 0));
    setOverBudgetKeys(over);
  }, [groupedExpenses, plannedBudget]);

  // ---------------- Render ----------------
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
          communion: t("expensesPage.info.eventTypeSpecific.communion", {
            fallback:
              "Per la comunione, tutte le spese sono considerate comuni, senza divisione tra genitori.",
          }),
          birthday: t("expensesPage.info.eventTypeSpecific.birthday"),
          graduation: t("expensesPage.info.eventTypeSpecific.graduation"),
        }}
      />

      {/* Carosello immagini */}
      <ImageCarousel images={getPageImages("spese", country)} height="280px" />

      {/* Messaggi */}
      {message && (
        <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm">{message}</div>
      )}

      {/* Banner superamento budget */}
      {overBudgetKeys.length > 0 && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-300 text-red-800 shadow-sm">
          <div className="font-semibold mb-1 flex items-center gap-2">
            <span>⚠️</span>
            <span>Attenzione: alcune voci hanno superato il budget pianificato!</span>
          </div>
          <ul className="list-disc pl-6 text-sm">
            {overBudgetKeys.map((key) => {
              const [cat, sub] = key.split("|");
              return (
                <li key={key}>
                  <span className="font-medium">{cat}</span>
                  {sub ? <span className="text-gray-700"> → {sub}</span> : null}
                  {plannedBudget[key] ? (
                    <span className="ml-2 text-xs text-gray-500">
                      (Budget: {formatCurrency(plannedBudget[key], "EUR")})
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <div className="mt-2 text-xs">
            <Link href="/budget" className="underline text-red-700 hover:text-red-900">
              Vai al dettaglio budget
            </Link>
          </div>
        </div>
      )}

      {/* Filtri */}
      <div className="mb-6 flex flex-wrap gap-2 items-end">
        <select
          className="border rounded px-2 py-1"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Tutte le categorie</option>
          {Array.from(new Set(expenses.map((e) => e.category))).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-2 py-1"
          value={filterSupplier}
          onChange={(e) => setFilterSupplier(e.target.value)}
        >
          <option value="">Tutti i fornitori</option>
          {allSuppliers.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-2 py-1"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as SpendType | "")}
        >
          <option value="">Tutti i tipi</option>
          <option value="common">{t("expensesPage.spendType.common")}</option>
          <option value="bride">{t("expensesPage.spendType.bride")}</option>
          <option value="groom">{t("expensesPage.spendType.groom")}</option>
        </select>
        <input
          type="month"
          className="border rounded px-2 py-1"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {/* Riepilogo totali */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-sm">
          <div className="text-yellow-700 font-medium">{t("expensesPage.status.pending")}</div>
          <div className="text-xl font-semibold">{formatEuro(totalPending)}</div>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm">
          <div className="text-green-700 font-medium">{t("expensesPage.status.approved")}</div>
          <div className="text-xl font-semibold">{formatEuro(totalApproved)}</div>
        </div>
      </div>

      {/* Lista spese raggruppate */}
      <div className="space-y-8">
        {orderedGroups.length === 0 ? (
          <div className="text-center text-gray-400 py-12">{t("expensesPage.empty")}</div>
        ) : (
          orderedGroups.map((group) => (
            <div key={group.category + "|" + group.subcategory} className="bg-white rounded-lg shadow-sm p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-semibold text-base">{group.category}</span>
                <span className="text-gray-500">{group.subcategory}</span>
              </div>

              {/* MOBILE: card list */}
              <ul className="divide-y divide-gray-100 sm:hidden">
                {group.expenses.map((exp) => (
                  <li key={exp.id} className="py-3 px-2">
                    <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                      <div className="col-span-2">
                        <dt className="text-muted-foreground">{t("expensesPage.table.supplier")}</dt>
                        <dd>{exp.supplier || "—"}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-muted-foreground">{t("expensesPage.table.description")}</dt>
                        <dd>{exp.description || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t("expensesPage.table.amount")}</dt>
                        <dd>{formatEuro(exp.amount)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t("expensesPage.table.type")}</dt>
                        <dd>
                          {isSingleBudgetEvent
                            ? t("expensesPage.spendType.common")
                            : exp.spendType === "common"
                            ? t("expensesPage.spendType.common")
                            : exp.spendType === "bride"
                            ? t("expensesPage.spendType.bride")
                            : t("expensesPage.spendType.groom")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t("expensesPage.table.date")}</dt>
                        <dd>{formatDate(new Date(exp.date))}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t("expensesPage.table.status")}</dt>
                        <dd>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs ${
                              exp.status === "approved"
                                ? "bg-green-100 text-green-800 font-semibold"
                                : exp.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {exp.status === "approved"
                              ? t("expensesPage.status.approved")
                              : exp.status === "rejected"
                              ? t("expensesPage.status.rejected")
                              : t("expensesPage.status.pending")}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t("expensesPage.table.fromQuote")}</dt>
                        <dd>{exp.fromDashboard ? <span className="text-green-600 font-bold">✓</span> : "—"}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-muted-foreground">Azioni</dt>
                        <dd>
                          <div className="flex gap-2 flex-wrap justify-center">
                            <button
                              onClick={() => openHistoryModal(exp.id)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium border border-blue-200 rounded px-2 py-1 bg-blue-50"
                            >
                              Storico modifiche
                            </button>
                            {exp.status === "pending" && (
                              <>
                                <button
                                  onClick={() => updateExpenseStatus(exp.id, "approved")}
                                  className="text-green-600 hover:text-green-800 text-xs font-medium"
                                >
                                  {t("expensesPage.buttons.approve")}
                                </button>
                                <button
                                  onClick={() => updateExpenseStatus(exp.id, "rejected")}
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
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>

              {/* DESKTOP: tabella */}
              <div className="-mx-4 overflow-x-auto hidden sm:block mt-4">
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
                          exp.status === "approved"
                            ? "bg-green-50/30"
                            : exp.status === "rejected"
                            ? "bg-red-50/30"
                            : ""
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-2 font-medium">{exp.supplier || "—"}</td>
                        <td className="whitespace-nowrap px-4 py-2">{exp.description || "—"}</td>
                        <td className="whitespace-nowrap px-4 py-2 text-right font-semibold">{formatEuro(exp.amount)}</td>
                        <td className="whitespace-nowrap px-4 py-2 text-center capitalize text-xs">
                          {isSingleBudgetEvent
                            ? t("expensesPage.spendType.common")
                            : exp.spendType === "common"
                            ? t("expensesPage.spendType.common")
                            : exp.spendType === "bride"
                            ? t("expensesPage.spendType.bride")
                            : t("expensesPage.spendType.groom")}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-center text-xs">{formatDate(new Date(exp.date))}</td>
                        <td className="whitespace-nowrap px-4 py-2 text-center">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs ${
                              exp.status === "approved"
                                ? "bg-green-100 text-green-800 font-semibold"
                                : exp.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {exp.status === "approved"
                              ? t("expensesPage.status.approved")
                              : exp.status === "rejected"
                              ? t("expensesPage.status.rejected")
                              : t("expensesPage.status.pending")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-center">
                          {exp.fromDashboard ? <span className="text-green-600 font-bold">✓</span> : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-center">
                          <div className="flex gap-2 flex-wrap justify-center">
                            <button
                              onClick={() => openHistoryModal(exp.id)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium border border-blue-200 rounded px-2 py-1 bg-blue-50"
                            >
                              Storico modifiche
                            </button>
                            {exp.status === "pending" && (
                              <>
                                <button
                                  onClick={() => updateExpenseStatus(exp.id, "approved")}
                                  className="text-green-600 hover:text-green-800 text-xs font-medium"
                                >
                                  {t("expensesPage.buttons.approve")}
                                </button>
                                <button
                                  onClick={() => updateExpenseStatus(exp.id, "rejected")}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal storico modifiche */}
      <Modal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Storico modifiche spesa"
        widthClass="max-w-xl"
      >
        <div className="min-h-[120px]">
          {historyLoading ? (
            <div className="flex items-center justify-center h-24 text-gray-400">Caricamento...</div>
          ) : expenseHistory.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-gray-400">Nessuna modifica registrata</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {expenseHistory.map((h) => (
                <li key={h.id} className="py-3 px-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span className="font-mono text-gray-400">
                      {new Date(h.created_at).toLocaleString("it-IT")}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 ml-2">
                      {h.action}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-700">Modifica: </span>
                    <span className="font-mono text-xs text-gray-600">{JSON.stringify(h.new_data)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </section>
  );
}
