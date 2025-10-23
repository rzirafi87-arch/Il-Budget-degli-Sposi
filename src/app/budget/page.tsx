"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";
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

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const jwt = data.session?.access_token;
        const headers: HeadersInit = {};
        if (jwt) headers.Authorization = `Bearer ${jwt}`;

        const expensesRes = await fetch("/api/my/expenses", { headers });
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
      } catch {
        setRows([]);
        setTotals({ total: 0, common: 0, bride: 0, groom: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-6">Budget - Spese Approvate</h2>

      {/* Carosello immagini */}
      <ImageCarousel images={PAGE_IMAGES.budget} height="280px" />

      <p className="text-sm text-gray-600 mb-4">
        Visualizzazione delle spese approvate dalla sezione "Spese", ordinate alfabeticamente per categoria e sottocategoria.
      </p>

      <div className="flex items-center justify-end mb-4">
        <div className="text-right text-sm">
          <div className="text-gray-700">Totale spese approvate</div>
          <div className="text-xl">€ {formatEuro(totals.total)}</div>
          <div className="text-gray-500">
            Comune: € {formatEuro(totals.common)} · Sposa: € {formatEuro(totals.bride)} · Sposo: € {formatEuro(totals.groom)}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
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
        <div className="h-px bg-gray-100" />

        {loading ? (
          <div className="p-6 text-gray-500 text-sm">Caricamento…</div>
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
                    {r.payment_method === "common" ? "💰 Comune" :
                     r.payment_method === "bride"  ? "👰 Sposa"  :
                     r.payment_method === "groom"  ? "🤵 Sposo"  : "🎁 Regalo"}
                  </span>
                </div>
                <div className="text-right">€ {formatEuro(r.budget)}</div>
                <div className="text-right">€ {formatEuro(r.committed)}</div>
                <div className="text-right">€ {formatEuro(r.paid)}</div>
                <div className="text-right">€ {formatEuro(r.residual)}</div>
                <div className="text-center">
                  {r.fromDashboard ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </div>
                <div className={`text-right font-medium ${
                  r.difference > 0 ? "text-red-600" : 
                  r.difference < 0 ? "text-green-600" : 
                  "text-gray-600"
                }`}>
                  {r.difference > 0 ? "+" : ""}€ {formatEuro(Math.abs(r.difference))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function formatEuro(n: number) {
  return (n || 0).toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
