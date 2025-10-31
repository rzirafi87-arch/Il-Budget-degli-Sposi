"use client";

import { useEffect, useMemo, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";
import Link from "next/link";
import ImageCarousel from "@/components/ImageCarousel";
import { PAGE_IMAGES } from "@/lib/pageImages";

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
        const approvedExpenses = (expensesData.expenses || []).filter((exp: any) => exp.status === "approved");

        const budgetRows: Row[] = approvedExpenses.map((exp: any) => ({
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

        budgetRows.sort((a, b) => {
          const catCompare = a.category.localeCompare(b.category, "it");
          if (catCompare !== 0) return catCompare;
          return a.subcategory.localeCompare(b.subcategory, "it");
        });
        setRows(budgetRows);

        const total = budgetRows.reduce((sum, r) => sum + r.budget, 0);
        const common = budgetRows.filter(r => r.spend_type === "common").reduce((sum, r) => sum + r.budget, 0);
        const bride = budgetRows.filter(r => r.spend_type === "bride").reduce((sum, r) => sum + r.budget, 0);
        const groom = budgetRows.filter(r => r.spend_type === "groom").reduce((sum, r) => sum + r.budget, 0);
        setTotals({ total, common, bride, groom });

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
    const keys = Array.from(new Set([...planMap.keys(), ...actualMap.keys()])).sort((a,b)=>a.localeCompare(b,'it'));
    return keys.map((k) => ({ key: k, planned: planMap.get(k) || 0, actual: actualMap.get(k) || 0 }));
  }, [plannedItems, rows]);

  return (
    <section className="pt-6">
      <h3 className="sr-only">Spese approvate</h3>

      {/* Carosello immagini */}
      <ImageCarousel images={PAGE_IMAGES.budget} height="280px" />

      {/* CTA per Idea di Budget */}
      <div className="flex justify-end mt-3">
        <Link
          href="/idea-di-budget"
          className="px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50 relative text-transparent"
        >
          <span className="absolute inset-0 flex items-center justify-center text-current pointer-events-none">💡 Vai a Idea di Budget</span>
          ðŸ’¡ Vai a Idea di Budget
        </Link>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Visualizzazione delle spese approvate dalla sezione "Spese", ordinate alfabeticamente per categoria e sottocategoria.
      </p>

      <div className="flex items-center justify-end mb-4">
        <div className="text-right text-sm sr-only">
          <div className="text-gray-700">Totale spese approvate</div>
          <div className="text-xl">â‚¬ {formatEuro(totals.total)}</div>
          <div className="text-gray-500">
            Comune: â‚¬ {formatEuro(totals.common)} Â· Sposa: â‚¬ {formatEuro(totals.bride)} Â· Sposo: â‚¬ {formatEuro(totals.groom)}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end mb-4">
        <div className="text-right text-sm">
          <div className="text-gray-700">Totale spese approvate</div>
          <div className="text-xl">€ {formatEuro(totals.total)}</div>
          <div className="text-gray-500">Comune: € {formatEuro(totals.common)} · Sposa: € {formatEuro(totals.bride)} · Sposo: € {formatEuro(totals.groom)}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <div className="grid grid-cols-10 gap-0 px-6 py-3 text-sm text-gray-700 hidden">
          <div>Categoria</div>
          <div>Sottocategoria</div>
          <div>Tipo di spesa</div>
          <div>Metodo pagamento</div>
          <div className="text-right">Budget (â‚¬)</div>
          <div className="text-right">Impegnato</div>
          <div className="text-right">Pagato</div>
          <div className="text-right">Residuo</div>
          <div className="text-center">Da preventivo</div>
          <div className="text-right">Differenza</div>
        </div>
         <div className="h-px bg-gray-100" />
        <div className="grid grid-cols-10 gap-0 px-6 py-3 text-sm text-gray-700">
          <div>Categoria</div>
          <div>Sottocategoria</div>
          <div>Tipo di spesa</div>
          <div>Metodo pagamento</div>
          <div className="text-right">Budget (€)</div>
          <div className="text-right">Impegnato</div>
          <div className="text-right">Pagato</div>
          <div className="text-right">Residuo</div>
          <div className="text-center">Da preventivo</div>
          <div className="text-right">Differenza</div>
        </div>

        {loading ? (
          <div className="p-6 text-gray-500 text-sm">Caricamentoâ€¦</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Nessuna spesa approvata. Vai alla sezione "Spese" per approvare le tue spese.
          </div>
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
                  {r.spend_type === "common" ? "Comune" :
                   r.spend_type === "bride"  ? "Sposa"  :
                   r.spend_type === "groom"  ? "Sposo"  : "Regalo"}
                </div>
                <div className="capitalize">
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    r.payment_method === "common" ? "bg-gray-100 text-gray-700" :
                    r.payment_method === "bride"  ? "bg-pink-100 text-pink-700" :
                    r.payment_method === "groom"  ? "bg-blue-100 text-blue-700" :
                    "bg-purple-100 text-purple-700"
                  }`}>
                    {r.payment_method === "common" ? "ðŸ’° Comune" :
                     r.payment_method === "bride"  ? "ðŸ‘° Sposa"  :
                     r.payment_method === "groom"  ? "ðŸ¤µ Sposo"  : "ðŸŽ Regalo"}
                  </span>
                </div>
                <div className="text-right">â‚¬ {formatEuro(r.budget)}</div>
                <div className="text-right">â‚¬ {formatEuro(r.committed)}</div>
                <div className="text-right">â‚¬ {formatEuro(r.paid)}</div>
                <div className="text-right">â‚¬ {formatEuro(r.residual)}</div>
                <div className="text-center">
                  {r.fromDashboard ? (
                    <span className="text-green-600 font-bold">âœ“</span>
                  ) : (
                    <span className="text-gray-300">â€”</span>
                  )}
                </div>
                <div className={`text-right font-medium ${
                  r.difference > 0 ? "text-red-600" : 
                  r.difference < 0 ? "text-green-600" : 
                  "text-gray-600"
                }`}>
                  {r.difference > 0 ? "+" : ""}â‚¬ {formatEuro(Math.abs(r.difference))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pianificato vs Effettivo */}
      <div className="mt-8 bg-white/80 rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold">Pianificato vs Effettivo</h3>
          <div className="text-sm text-right">
            <div>Totale pianificato: € {formatEuro(plannedTotal)}</div>
            <div>Totale effettivo (approvato): € {formatEuro(totals.total)}</div>
            <div className={`${plannedTotal - totals.total > 0 ? 'text-red-600' : 'text-emerald-700'} font-medium`}>
              Differenza: € {formatEuro(Math.abs(plannedTotal - totals.total))} {plannedTotal - totals.total > 0 ? '(+ oltre il previsto)' : '(sotto il previsto)'}
            </div>
          </div>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="px-6 py-3 grid grid-cols-12 text-sm text-gray-700">
          <div className="col-span-6">Voce</div>
          <div className="col-span-3 text-right">Pianificato (€)</div>
          <div className="col-span-3 text-right">Effettivo (€)</div>
        </div>
        <div className="h-px bg-gray-100" />
        <ul>
          {compareRows.length === 0 ? (
            <li className="px-6 py-6 text-sm text-gray-500">Nessun dato da confrontare. Usa "Idea di Budget" per pianificare e approva spese nella sezione "Spese".</li>
          ) : (
            compareRows.map((row) => (
              <li key={row.key} className="grid grid-cols-12 px-6 py-3 text-sm border-t border-gray-50">
                <div className="col-span-6 truncate" title={row.key}>{row.key}</div>
                <div className="col-span-3 text-right">€ {formatEuro(row.planned)}</div>
                <div className={`col-span-3 text-right ${row.actual > row.planned ? 'text-red-600' : 'text-gray-800'}`}>€ {formatEuro(row.actual)}</div>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}

function formatEuro(n: number) {
  return (n || 0).toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
