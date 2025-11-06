"use client";

import ExportPDFButton from "@/components/ExportPDFButton";
import ImageCarousel from "@/components/ImageCarousel";
import { getUserCountrySafe } from "@/constants/geo";
import { formatCurrency, getUserLanguage } from "@/lib/locale";
import { getPageImages } from "@/lib/pageImages";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const supabase = getBrowserClient();

type Totals = { total: 0 | number; common: 0 | number; bride: 0 | number; groom: 0 | number };
type Row = {
  category: string;
  subcategory: string;
  spend_type: "common" | "bride" | "groom" | "gift";
  payment_method: "common" | "bride" | "groom" | "gift";
  budget: number;
  committed: number;
  paid: number;
  residual: number;
  fromDashboard: boolean;
  difference: number;
};

export default function BudgetPage() {
  const country = getUserCountrySafe();
  const t = useTranslations();
  const userEventType = typeof window !== "undefined" ? (localStorage.getItem("eventType") || "wedding") : "wedding";
  const isSingleEvent = userEventType === "baptism" || userEventType === "graduation";
  const [rows, setRows] = useState<Row[]>([]);
  const [totals, setTotals] = useState<Totals>({ total: 0, common: 0, bride: 0, groom: 0 });
  const [loading, setLoading] = useState(true);
  const [plannedItems, setPlannedItems] = useState<{ name: string; amount: number }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const jwt = data.session?.access_token;
        const headers: HeadersInit = {};
        if (jwt) headers.Authorization = `Bearer ${jwt}`;
        const country = (typeof window !== "undefined" ? localStorage.getItem("country") : "it") || "it";

        // Fetch approved expenses and planned budget in parallel
        const [expensesRes, plannedRes] = await Promise.all([
          fetch("/api/my/expenses", { headers }),
          fetch(`/api/budget-items?country=${encodeURIComponent(country)}`, { headers }),
        ]);

        const expensesData = await expensesRes.json();
        type ExpenseData = { status?: string; category?: string; subcategory?: string; spend_type?: string; amount?: number; from_dashboard?: boolean };
        const approvedExpenses = (expensesData.expenses || []).filter((exp: ExpenseData) => exp.status === "approved");

        const budgetRows: Row[] = approvedExpenses.map((exp: ExpenseData) => ({
          category: exp.category || "",
          subcategory: exp.subcategory || "",
          spend_type: (exp.spend_type || "common") as "common" | "bride" | "groom" | "gift",
          payment_method: (exp.spend_type || "common") as "common" | "bride" | "groom" | "gift",
          budget: Number(exp.amount || 0),
          committed: Number(exp.amount || 0),
          paid: 0,
          residual: Number(exp.amount || 0),
          fromDashboard: exp.from_dashboard || false,
          difference: 0,
        }));

        const userLang = getUserLanguage();
        budgetRows.sort((a, b) => {
          const catCompare = a.category.localeCompare(b.category, userLang);
          if (catCompare !== 0) return catCompare;
          return a.subcategory.localeCompare(b.subcategory, userLang);
        });
        setRows(budgetRows);

        const total = budgetRows.reduce((sum, r) => sum + r.budget, 0);
        const common = budgetRows.filter(r => r.spend_type === "common").reduce((sum, r) => sum + r.budget, 0);
        const bride = budgetRows.filter(r => r.spend_type === "bride").reduce((sum, r) => sum + r.budget, 0);
        const groom = budgetRows.filter(r => r.spend_type === "groom").reduce((sum, r) => sum + r.budget, 0);
        setTotals({ total, common, bride, groom });

        const plannedJson = await plannedRes.json();
        type PlannedItem = { name?: string; category?: string; subcategory?: string; amount?: number };
        const planned = Array.isArray(plannedJson?.items)
          ? plannedJson.items.map((it: PlannedItem) => ({
              name: it.name || [it.category, it.subcategory].filter(Boolean).join(" - ") || "Voce",
              amount: Number(it.amount || 0) || 0,
            }))
          : [];
        setPlannedItems(planned);
      } catch {
        setRows([]);
        setTotals({ total: 0, common: 0, bride: 0, groom: 0 });
        setPlannedItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const plannedTotal = useMemo(() => plannedItems.reduce((s, it) => s + (Number(it.amount)||0), 0), [plannedItems]);
  const compareRows = useMemo(() => {
    const planMap = new Map<string, number>();
    for (const p of plannedItems) {
      const key = p.name || "Voce";
      planMap.set(key, (planMap.get(key) || 0) + (Number(p.amount) || 0));
    }
    const actualMap = new Map<string, number>();
    for (const r of rows) {
      const key = [r.category, r.subcategory].filter(Boolean).join(" - ") || "Voce";
      actualMap.set(key, (actualMap.get(key) || 0) + (Number(r.budget) || 0));
    }
    const userLang = getUserLanguage();
    const keys = Array.from(new Set([...planMap.keys(), ...actualMap.keys()])).sort((a,b)=>a.localeCompare(b,userLang));
    return keys.map((k) => ({ key: k, planned: planMap.get(k) || 0, actual: actualMap.get(k) || 0 }));
  }, [plannedItems, rows]);

  return (
    <section className="pt-6">
      <h3 className="sr-only">{t("budgetPage.approvedExpenses")}</h3>

      {/* Carosello immagini */}
      <ImageCarousel images={getPageImages("budget", country)} height="280px" />

      {/* CTA per Idea di Budget */}
      <div className="flex justify-end mt-3">
        <Link
          href="/idea-di-budget"
          className="px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50 relative text-transparent"
        >
          <span className="absolute inset-0 flex items-center justify-center text-current pointer-events-none">{t("budgetPage.ctaIdeaBudget")}</span>
          {t("budgetPage.ctaIdeaBudget")}
        </Link>
      </div>

      <p className="text-sm text-gray-900 mb-4">{t("budgetPage.description")}</p>

      <div className="flex items-center justify-end mb-4 gap-2">
        <ExportPDFButton
          data={rows.map((r) => ({
            Categoria: r.category,
            Sottocategoria: r.subcategory,
            "Tipo spesa": r.spend_type,
            "Metodo pagamento": r.payment_method,
            Budget: formatEuro(r.budget),
            Impegnato: formatEuro(r.committed),
            Pagato: formatEuro(r.paid),
            Residuo: formatEuro(r.residual),
            "Da dashboard": r.fromDashboard ? "✓" : "",
            Differenza: formatEuro(r.difference),
          }) )}
          filename={`budget-${userEventType}`}
          title={t("budgetPage.totals.title")}
          subtitle={t("budgetPage.description")}
          className="text-sm border border-gray-300 rounded-full px-4 py-2"
        >
          Esporta PDF
        </ExportPDFButton>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <div className="grid grid-cols-10 gap-0 px-6 py-3 text-sm text-gray-900 hidden">
          <div>{t("budgetPage.table.category")}</div>
          <div>{t("budgetPage.table.subcategory")}</div>
          <div>{t("budgetPage.table.spendType")}</div>
          <div>{t("budgetPage.table.paymentMethod")}</div>
          <div className="text-right">{t("budgetPage.table.budget")}</div>
          <div className="text-right">{t("budgetPage.table.committed")}</div>
          <div className="text-right">{t("budgetPage.table.paid")}</div>
          <div className="text-right">{t("budgetPage.table.residual")}</div>
          <div className="text-center">{t("budgetPage.table.fromQuote")}</div>
          <div className="text-right">{t("budgetPage.table.difference")}</div>
        </div>
         <div className="h-px bg-gray-100" />
        <div className="grid grid-cols-10 gap-0 px-6 py-3 text-sm text-gray-900">
          <div>{t("budgetPage.table.category")}</div>
          <div>{t("budgetPage.table.subcategory")}</div>
          <div>{t("budgetPage.table.spendType")}</div>
          <div>{t("budgetPage.table.paymentMethod")}</div>
          <div className="text-right">{t("budgetPage.table.budget")}</div>
          <div className="text-right">{t("budgetPage.table.committed")}</div>
          <div className="text-right">{t("budgetPage.table.paid")}</div>
          <div className="text-right">{t("budgetPage.table.residual")}</div>
          <div className="text-center">{t("budgetPage.table.fromQuote")}</div>
          <div className="text-right">{t("budgetPage.table.difference")}</div>
        </div>

        {loading ? (
          <div className="p-6 text-gray-500 text-sm">{t("budgetPage.loading")}</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-gray-500">{t("budgetPage.empty")}</div>
        ) : (
          <ul>
            {rows.map((r, idx) => (
              <li
                key={idx}
                className="grid grid-cols-10 gap-0 px-6 py-3 text-sm border-t border-gray-50 hover:bg-gray-50/60"
              >
                <div>{r.category}</div>
                <div>{r.subcategory}</div>
                <div className="capitalize">
                  {isSingleEvent
                    ? t("budgetPage.spendType.common")
                    : (r.spend_type === "common"
                        ? t("budgetPage.spendType.common")
                        : r.spend_type === "bride"
                        ? t("budgetPage.spendType.bride")
                        : r.spend_type === "groom"
                        ? t("budgetPage.spendType.groom")
                        : t("budgetPage.spendType.gift"))}
                </div>
                <div className="capitalize">
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    r.payment_method === "common" ? "bg-gray-100 text-gray-700" :
                    r.payment_method === "bride"  ? "bg-pink-100 text-pink-700" :
                    r.payment_method === "groom"  ? "bg-blue-100 text-blue-700" :
                    "bg-purple-100 text-purple-700"
                  }`}>
                    {r.payment_method === "common" ? t("budgetPage.paymentMethod.common") :
                     r.payment_method === "bride"  ? t("budgetPage.paymentMethod.bride")  :
                     r.payment_method === "groom"  ? t("budgetPage.paymentMethod.groom")  : t("budgetPage.paymentMethod.gift")}
                  </span>
                </div>
                <div className="text-right">{formatEuro(r.budget)}</div>
                <div className="text-right">{formatEuro(r.committed)}</div>
                <div className="text-right">{formatEuro(r.paid)}</div>
                <div className="text-right">{formatEuro(r.residual)}</div>
                <div className="text-center">
                  {r.fromDashboard ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-gray-300">&mdash;</span>
                  )}
                </div>
                <div className={`text-right font-medium ${
                  r.difference > 0 ? "text-red-600" :
                  r.difference < 0 ? "text-green-600" :
                  "text-gray-600"
                }`}>
                  {r.difference > 0 ? "+" : ""}{formatEuro(Math.abs(r.difference))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pianificato vs Effettivo */}
      <div className="mt-8 bg-white/80 rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold">{t("budgetPage.plannedVsActual.title")}</h3>
          <div className="text-sm text-right">
            <div>{t("budgetPage.plannedVsActual.totalPlanned")}: {formatEuro(plannedTotal)}</div>
            <div>{t("budgetPage.plannedVsActual.totalActualApproved")}: {formatEuro(totals.total)}</div>
            <div className={`${plannedTotal - totals.total > 0 ? 'text-red-600' : 'text-emerald-700'} font-medium`}>
              {t("budgetPage.plannedVsActual.difference")}: {formatEuro(Math.abs(plannedTotal - totals.total))} ({plannedTotal - totals.total > 0 ? t("budgetPage.plannedVsActual.over") : t("budgetPage.plannedVsActual.under")})
            </div>
          </div>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="px-6 py-3 grid grid-cols-12 text-sm text-gray-900">
          <div className="col-span-6">{t("budgetPage.plannedVsActual.item")}</div>
          <div className="col-span-3 text-right">{t("budgetPage.plannedVsActual.planned")}</div>
          <div className="col-span-3 text-right">{t("budgetPage.plannedVsActual.actual")}</div>
        </div>
        <div className="h-px bg-gray-100" />
        <ul>
          {compareRows.length === 0 ? (
            <li className="px-6 py-6 text-sm text-gray-500">{t("budgetPage.plannedVsActual.empty")}</li>
          ) : (
            compareRows.map((row) => (
              <li key={row.key} className="grid grid-cols-12 px-6 py-3 text-sm border-t border-gray-50">
                <div className="col-span-6 truncate" title={row.key}>{row.key}</div>
                <div className="col-span-3 text-right">{formatEuro(row.planned)}</div>
                <div className={`col-span-3 text-right ${row.actual > row.planned ? 'text-red-600' : 'text-gray-800'}`}>{formatEuro(row.actual)}</div>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}

function formatEuro(n: number) {
  return formatCurrency(n, "EUR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
