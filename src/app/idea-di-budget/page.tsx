"use client";
import React, { useState, useEffect, useMemo } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";
import { BUDGET_CATEGORIES } from "@/constants/budgetCategories";

// Struttura dati per idea di budget
export type BudgetIdeaRow = {
  id?: string;
  category: string;
  subcategory: string;
  spendType: "common" | "bride" | "groom" | "gift";
  amount: number;
  supplier?: string;
  notes?: string;
};

const CATEGORIES: Record<string, string[]> = BUDGET_CATEGORIES;

const SPEND_TYPES = [
  { value: "common", label: "Comune" },
  { value: "bride", label: "Sposa" },
  { value: "groom", label: "Sposo" },
  { value: "gift", label: "Regalo" },
];

export default function IdeaDiBudgetPage() {
  const [rows, setRows] = useState<BudgetIdeaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Nuovi controlli in alto: budget e data
  const [brideBudget, setBrideBudget] = useState<number>(() => {
    const v = typeof window !== "undefined" ? Number(localStorage.getItem("brideBudget") || 0) : 0;
    return isFinite(v) ? v : 0;
  });
  const [groomBudget, setGroomBudget] = useState<number>(() => {
    const v = typeof window !== "undefined" ? Number(localStorage.getItem("groomBudget") || 0) : 0;
    return isFinite(v) ? v : 0;
  });
  const [weddingDate, setWeddingDate] = useState<string>(() => (typeof window !== "undefined" ? localStorage.getItem("weddingDate") || "" : ""));
  const [currency, setCurrency] = useState<string>(() =>
    (typeof window !== "undefined" && localStorage.getItem("budgetIdea.currency")) || "EUR"
  );
  const [contingencyPct, setContingencyPct] = useState<number>(() => {
    const v = typeof window !== "undefined" ? Number(localStorage.getItem("budgetIdea.contingencyPct") || 0) : 0;
    return isFinite(v) ? v : 0;
  });
  const [compactView, setCompactView] = useState<boolean>(() =>
    typeof window !== "undefined" ? localStorage.getItem("budgetIdea.compactView") === "1" : false
  );
  const supabase = getBrowserClient();

  // Carica idee di budget reali da Supabase
  useEffect(() => {
    async function fetchBudgetIdeas() {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData.session?.access_token;
      const headers: HeadersInit = {};
      if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
      const res = await fetch("/api/idea-di-budget", { headers });
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        // Mappa e compatta a UNA riga per sottocategoria
        const byKey = new Map<string, BudgetIdeaRow>();
        for (const r of json.data) {
          const category = r.categories?.name || r.category || "";
          const subcategory = r.subcategory || "";
          const key = `${category}|||${subcategory}`;
          const amount = Number(r.idea_amount ?? r.amount ?? 0) || 0;
          const spendType = (r.spendType || r.spend_type || "common") as BudgetIdeaRow["spendType"];
          const supplier = r.supplier || "";
          const notes = r.notes || "";
          if (!byKey.has(key)) {
            byKey.set(key, { category, subcategory, spendType, amount, supplier, notes });
          } else {
            const cur = byKey.get(key)!;
            cur.amount = (Number(cur.amount) || 0) + amount;
            // conserva spendType se già impostato a valore diverso da 'common'
            if (cur.spendType === "common" && spendType !== "common") cur.spendType = spendType;
            if (!cur.supplier && supplier) cur.supplier = supplier;
            if (!cur.notes && notes) cur.notes = notes;
          }
        }
        setRows(Array.from(byKey.values()));
      } else {
        // Nessun dato: UNA riga per sottocategoria, con Tipo selezionabile
        const allRows: BudgetIdeaRow[] = [];
        Object.entries(CATEGORIES).forEach(([category, subs]) => {
          subs.forEach((subcategory) => {
            allRows.push({
              category,
              subcategory,
              spendType: "common",
              amount: 0,
              supplier: "",
              notes: "",
            });
          });
        });
        setRows(allRows);
      }
      setLoading(false);
    }
    fetchBudgetIdeas();
  }, []);

  // Persist simple view preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("budgetIdea.currency", currency);
      localStorage.setItem("budgetIdea.contingencyPct", String(contingencyPct));
      localStorage.setItem("budgetIdea.compactView", compactView ? "1" : "0");
    }
  }, [currency, contingencyPct, compactView]);

  // Persist top-level budget controls to localStorage so Dashboard li usa
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("brideBudget", String(brideBudget || 0));
      localStorage.setItem("groomBudget", String(groomBudget || 0));
      localStorage.setItem("weddingDate", weddingDate || "");
    }
  }, [brideBudget, groomBudget, weddingDate]);

  // Gestione input
  function handleChange(idx: number, field: keyof BudgetIdeaRow, value: any) {
    setRows((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  // Calcoli riepilogo: somma importi per tipologia
  const plannedBride = useMemo(() => rows.filter(r => r.spendType === "bride").reduce((s, r) => s + (Number(r.amount)||0), 0), [rows]);
  const plannedGroom = useMemo(() => rows.filter(r => r.spendType === "groom").reduce((s, r) => s + (Number(r.amount)||0), 0), [rows]);
  const plannedCommon = useMemo(() => rows.filter(r => r.spendType === "common").reduce((s, r) => s + (Number(r.amount)||0), 0), [rows]);
  const plannedTotal = useMemo(() => plannedBride + plannedGroom + plannedCommon + rows.filter(r=>r.spendType==='gift').reduce((s,r)=>s+(Number(r.amount)||0),0), [plannedBride, plannedGroom, plannedCommon, rows]);

  // Salva su Supabase (tabella budget_ideas)
  async function handleSave() {
    setSaving(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData.session?.access_token;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
    // 1) Salva righe idea di budget (come planned expenses da Idea)
    const ideaPayload = rows.map((row) => ({
      category: row.category,
      subcategory: row.subcategory,
      spendType: row.spendType,
      idea_amount: row.amount,
      supplier: row.supplier,
      notes: row.notes,
    }));
    const res = await fetch("/api/idea-di-budget", {
      method: "POST",
      headers,
      body: JSON.stringify(ideaPayload),
    });
    if (!res.ok) {
      setSaving(false);
      alert("Errore nel salvataggio!");
      return;
    }

    // 2) Aggiorna budget Sposa/Sposo + data matrimonio sull'evento
    const totalBudget = (brideBudget || 0) + (groomBudget || 0);
    await fetch("/api/my/dashboard", {
      method: "POST",
      headers,
      body: JSON.stringify({ totalBudget, brideBudget, groomBudget, weddingDate, rows: [] }),
    }).catch(() => {});

    setSaving(false);
    alert("Idea di budget salvata!");
  }

  // Applica le idee al budget (crea/aggiorna voci in budget_items)
  async function handleApplyToBudget() {
    setSaving(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData.session?.access_token;
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
    const country = (typeof window !== "undefined" ? localStorage.getItem("country") : "it") || "it";
    const res = await fetch(`/api/idea-di-budget/apply?country=${encodeURIComponent(country)}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ country, rows }),
    });
    setSaving(false);
    if (res.ok) {
      const json = await res.json();
      alert(`Applicazione completata: ${json.inserted ?? 0} voci aggiornate.`);
    } else {
      alert("Errore nell'applicazione al Budget");
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-start justify-between mb-4">
        <h1 className="text-3xl font-serif font-bold">Idea di Budget</h1>
        <a href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"><span aria-hidden>🏠</span> Torna in Dashboard</a>
      </div>
      {/* Controlli principali: Budget e Data matrimonio */}
      <div className="mb-6 p-5 rounded-2xl border-2 border-gray-200 bg-white shadow-md">
        <h3 className="text-lg font-semibold mb-3">Imposta Budget e Data Matrimonio</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Sposa (EUR)</label>
            <input type="number" className="border-2 border-pink-300 rounded-lg px-3 py-2 w-full" value={brideBudget || ""} onChange={e=>setBrideBudget(Number(e.target.value)||0)} placeholder="Es. 10000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Sposo (EUR)</label>
            <input type="number" className="border-2 border-blue-300 rounded-lg px-3 py-2 w-full" value={groomBudget || ""} onChange={e=>setGroomBudget(Number(e.target.value)||0)} placeholder="Es. 10000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Totale (EUR)</label>
            <input type="number" className="border-2 border-gray-300 bg-gray-100 rounded-lg px-3 py-2 w-full font-bold" value={(brideBudget||0)+(groomBudget||0)} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Matrimonio</label>
            <input type="date" className="border-2 border-[#A3B59D] rounded-lg px-3 py-2 w-full" value={weddingDate} onChange={e=>setWeddingDate(e.target.value)} />
          </div>
        </div>
        {/* Riepiloghi sintetici */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="rounded-xl border-2 border-pink-300 bg-pink-50 p-4">
            <h4 className="font-semibold mb-1">Budget Sposa</h4>
            <div className="text-sm text-gray-700">Disponibile: € {(brideBudget||0).toLocaleString()}</div>
            <div className="text-sm text-gray-700">Speso (pianificato): € {plannedBride.toLocaleString()}</div>
            <div className="text-sm font-semibold text-emerald-700">Residuo: € {Math.max((brideBudget||0)-plannedBride,0).toLocaleString()}</div>
          </div>
          <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-4">
            <h4 className="font-semibold mb-1">Budget Sposo</h4>
            <div className="text-sm text-gray-700">Disponibile: € {(groomBudget||0).toLocaleString()}</div>
            <div className="text-sm text-gray-700">Speso (pianificato): € {plannedGroom.toLocaleString()}</div>
            <div className="text-sm font-semibold text-emerald-700">Residuo: € {Math.max((groomBudget||0)-plannedGroom,0).toLocaleString()}</div>
          </div>
          <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4">
            <h4 className="font-semibold mb-1">Budget Totale</h4>
            <div className="text-sm text-gray-700">Disponibile: € {((brideBudget||0)+(groomBudget||0)).toLocaleString()}</div>
            <div className="text-sm text-gray-700">Speso (pianificato): € {plannedTotal.toLocaleString()}</div>
            <div className="text-sm font-semibold text-emerald-700">Residuo: € {Math.max(((brideBudget||0)+(groomBudget||0))-plannedTotal,0).toLocaleString()}</div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Caricamento idee di budget...</div>
      ) : (
        <>
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-1">Valuta</label>
                <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-24 border rounded px-2 py-1" maxLength={4} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imprevisti (%)</label>
                <input type="number" min={0} max={50} value={contingencyPct} onChange={(e) => setContingencyPct(Number(e.target.value))} className="w-28 border rounded px-2 py-1" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <input id="compactView" type="checkbox" checked={compactView} onChange={(e) => setCompactView(e.target.checked)} className="h-4 w-4" />
                <label htmlFor="compactView" className="text-sm">Vista compatta (righe più strette)</label>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-700">
              {(() => {
                const base = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
                const extra = (base * (contingencyPct || 0)) / 100;
                const total = base + extra;
                return (
                  <div className="flex flex-wrap gap-4">
                    <div><strong>Totale ipotizzato:</strong> {currency} {base.toLocaleString()}</div>
                    <div><strong>Imprevisti:</strong> {currency} {extra.toLocaleString()} ({contingencyPct}%)</div>
                    <div><strong>Totale con imprevisti:</strong> {currency} {total.toLocaleString()}</div>
                  </div>
                );
              })()}
            </div>
          </div>
          <table className={`w-full border ${compactView ? "text-xs" : "text-sm"} mb-6`}>
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Categoria</th>
                <th className="p-2">Sottocategoria</th>
                <th className="p-2">Fornitore</th>
                <th className="p-2">Importo ({currency})</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{row.category}</td>
                  <td className="p-2">{row.subcategory}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      className={`border rounded px-2 py-1 ${compactView ? "w-28" : "w-32"}`}
                      value={row.supplier || ""}
                      onChange={(e) => handleChange(idx, "supplier", e.target.value)}
                      placeholder="Fornitore"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className={`border rounded px-2 py-1 ${compactView ? "w-20" : "w-24"}`}
                      value={row.amount}
                      min={0}
                      onChange={(e) => handleChange(idx, "amount", Number(e.target.value))}
                    />
                  </td>
                  <td className="p-2">
                    <select
                      className={`border rounded px-2 py-1 ${compactView ? "w-28" : "w-32"}`}
                      value={row.spendType}
                      onChange={(e) => handleChange(idx, "spendType", e.target.value as BudgetIdeaRow["spendType"]) }
                    >
                      {SPEND_TYPES.map((st) => (
                        <option key={st.value} value={st.value}>{st.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      className={`border rounded px-2 py-1 ${compactView ? "w-28" : "w-32"}`}
                      value={row.notes || ""}
                      onChange={(e) => handleChange(idx, "notes", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-6 py-2 bg-[#A3B59D] text-white rounded font-bold"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Salvataggio..." : "Salva idea di budget"}
            </button>
            <button
              className="px-6 py-2 bg-[#6b7e65] text-white rounded font-bold"
              onClick={handleApplyToBudget}
              disabled={saving || rows.length === 0}
              title="Crea/Aggiorna le voci di Budget dalla tua Idea"
            >
              {saving ? "Attendere..." : "Applica a Budget"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
