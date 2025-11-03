/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import CresimaNav from "@/components/cresima/CresimaNav";
import { getUserLanguage, formatCurrency } from "@/lib/locale";

type Row = {
  category: string;
  subcategory: string;
  budget: number;
  committed: number;
  paid: number;
  residual: number;
  fromDashboard: boolean;
  difference: number;
};

type Totals = { total: number };

export default function CresimaBudgetPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [totals, setTotals] = useState<Totals>({ total: 0 });
  const [plannedItems, setPlannedItems] = useState<{ name: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const headers: HeadersInit = {};
        try {
          const { getBrowserClient } = await import("@/lib/supabaseBrowser");
          const supabase = getBrowserClient();
          const { data } = await supabase.auth.getSession();
          const jwt = data.session?.access_token;
          if (jwt) headers.Authorization = `Bearer ${jwt}`;
        } catch {}

        const country = (typeof window !== "undefined" ? localStorage.getItem("country") : "it") || "it";

        const [expensesRes, plannedRes] = await Promise.all([
          fetch("/api/my/expenses", { headers }),
          fetch(`/api/budget-items?country=${encodeURIComponent(country)}`, { headers }),
        ]);

        const expensesData = await expensesRes.json();
        const approvedExpenses = (expensesData.expenses || []).filter((exp: any) => exp.status === "approved");

        const budgetRows: Row[] = approvedExpenses.map((exp: any) => ({
          category: exp.category || "",
          subcategory: exp.subcategory || "",
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

        const total = budgetRows.reduce((sum, r) => sum + (Number(r.budget) || 0), 0);
        setTotals({ total });

        const plannedJson = await plannedRes.json();
        const planned = Array.isArray(plannedJson?.items)
          ? plannedJson.items.map((it: any) => ({
              name: it.name || [it.category, it.subcategory].filter(Boolean).join(" - ") || "Voce",
              amount: Number(it.amount || 0) || 0,
            }))
          : [];
        setPlannedItems(planned);
      } catch {
        setRows([]);
        setTotals({ total: 0 });
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
    <main>
      <CresimaNav />

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Budget Cresima</h2>
        <p className="text-neutral-600 mt-1">
          Riepilogo delle spese approvate e confronto con l'idea iniziale.
        </p>
      </section>

      <div className="mb-6 bg-white/80 rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold">Totale effettivo</h3>
            <div className="text-xl">{formatEuro(totals.total)}</div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <div className="grid grid-cols-8 gap-0 px-6 py-3 text-sm text-gray-700">
          <div>Categoria</div>
          <div>Sottocategoria</div>
          <div className="text-right">Budget</div>
          <div className="text-right">Impegnato</div>
          <div className="text-right">Pagato</div>
          <div className="text-right">Residuo</div>
          <div className="text-center">Da preventivo</div>
          <div className="text-right">Differenza</div>
        </div>
        {loading ? (
          <div className="p-6 text-gray-500 text-sm">Caricamento...</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Nessuna spesa approvata. Vai alla sezione "Spese" per approvare le tue spese.
          </div>
        ) : (
          <ul>
            {rows.map((r, idx) => (
              <li
                key={idx}
                className="grid grid-cols-8 gap-0 px-6 py-3 text-sm border-t border-gray-50 hover:bg-gray-50/60"
              >
                <div>{r.category}</div>
                <div>{r.subcategory}</div>
                <div className="text-right">{formatEuro(r.budget)}</div>
                <div className="text-right">{formatEuro(r.committed)}</div>
                <div className="text-right">{formatEuro(r.paid)}</div>
                <div className="text-right">{formatEuro(r.residual)}</div>
                <div className="text-center">
                  {r.fromDashboard ? (
                    <span className="text-green-600 font-bold">V</span>
                  ) : (
                    <span className="text-gray-300">-</span>
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

      <div className="mt-8 bg-white/80 rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold">Pianificato vs Effettivo</h3>
          <div className="text-sm text-right">
            <div>Totale pianificato: {formatEuro(plannedTotal)}</div>
            <div>Totale effettivo (approvato): {formatEuro(totals.total)}</div>
            <div className={`${plannedTotal - totals.total > 0 ? 'text-red-600' : 'text-emerald-700'} font-medium`}>
              Differenza: {formatEuro(Math.abs(plannedTotal - totals.total))} {plannedTotal - totals.total > 0 ? '(+ oltre il previsto)' : '(sotto il previsto)'}
            </div>
          </div>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="px-6 py-3 grid grid-cols-12 text-sm text-gray-700">
          <div className="col-span-6">Voce</div>
          <div className="col-span-3 text-right">Pianificato</div>
          <div className="col-span-3 text-right">Effettivo</div>
        </div>
        <div className="h-px bg-gray-100" />
        <ul>
          {compareRows.length === 0 ? (
            <li className="px-6 py-6 text-sm text-gray-500">Nessun dato da confrontare. Usa "Idea di Budget" per pianificare e approva spese nella sezione "Spese".</li>
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
    </main>
  );
}

function formatEuro(n: number) {
  return formatCurrency(n, "EUR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
