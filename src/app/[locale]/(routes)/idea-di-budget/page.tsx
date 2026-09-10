"use client";

import { DEFAULT_EVENT_TYPE, getEventConfig, resolveEventType } from "@/constants/eventConfigs";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { budgetTotals, matchesBudgetSearch } from "@/lib/budgetIdea";
import { useEffect, useMemo, useState } from "react";

export type BudgetIdeaRow = { id?: string; category: string; subcategory: string; spendType: string; amount: number; enabled: boolean; supplier?: string; notes?: string; custom?: boolean };
const money = (value: number, currency: string) => new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(value || 0);
const number = (value: unknown) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;

function defaults(eventType: string): BudgetIdeaRow[] {
  const config = getEventConfig(eventType);
  return Object.entries(config.budgetCategories).flatMap(([category, entries]) => entries.map((subcategory) => ({ category, subcategory, spendType: config.defaultSpendType, amount: 0, enabled: false, supplier: "", notes: "", custom: false })));
}

export default function BudgetIdeaPage() {
  const [eventType] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_EVENT_TYPE;
    const cookieType = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
    return resolveEventType(localStorage.getItem("eventType") || cookieType || DEFAULT_EVENT_TYPE);
  });
  const config = getEventConfig(eventType);
  const [rows, setRows] = useState<BudgetIdeaRow[]>([]);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [currency] = useState(() => typeof window === "undefined" ? "EUR" : localStorage.getItem("budgetIdea.currency") || "EUR");
  const [contingencyPct, setContingencyPct] = useState(() => typeof window === "undefined" ? 0 : number(localStorage.getItem("budgetIdea.contingencyPct")));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      setLoading(true);
      const base = defaults(eventType);
      const { data } = await getBrowserClient().auth.getSession();
      const response = await fetch("/api/idea-di-budget", { headers: data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {} });
      const json = response.ok ? await response.json() : { data: [] };
      if (!active) return;
      const saved = Array.isArray(json.data) ? json.data as Array<Record<string, unknown>> : [];
      const byKey = new Map(base.map((row) => [`${row.category}\u0000${row.subcategory}`, row]));
      saved.forEach((entry) => {
        const row: BudgetIdeaRow = { id: String(entry.id || "") || undefined, category: String(entry.category || ""), subcategory: String(entry.subcategory || ""), spendType: String(entry.spendType || config.defaultSpendType), amount: number(entry.idea_amount), enabled: entry.enabled !== false, supplier: String(entry.supplier || ""), notes: String(entry.notes || ""), custom: entry.custom === true };
        if (row.category && row.subcategory) byKey.set(`${row.category}\u0000${row.subcategory}`, row);
      });
      setRows([...byKey.values()]); setLoading(false);
    })();
    return () => { active = false; };
  }, [eventType, config.defaultSpendType]);

  const categories = useMemo(() => [...new Set(rows.map((row) => row.category))], [rows]);
  const normalizedQuery = query.trim();
  const visible = (category: string) => rows.map((row, index) => ({ row, index })).filter(({ row }) => row.category === category && (!normalizedQuery || matchesBudgetSearch(row.category, row.subcategory, normalizedQuery)));
  const searchedCategories = normalizedQuery ? categories.filter((category) => visible(category).length) : categories;
  const totals = useMemo(() => budgetTotals(rows, contingencyPct), [rows, contingencyPct]);
  const categoryTotal = (category: string) => rows.reduce((sum, row) => sum + (row.category === category && row.enabled ? row.amount : 0), 0);
  const change = (index: number, patch: Partial<BudgetIdeaRow>) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));

  function addCustom(category: string) {
    const label = window.prompt("Nome della nuova voce");
    if (!label?.trim()) return;
    setRows((current) => [...current, { category, subcategory: label.trim(), spendType: config.defaultSpendType, amount: 0, enabled: true, custom: true, supplier: "", notes: "" }]);
    setOpen((current) => new Set(current).add(category));
  }

  async function request(path: string, body: unknown) {
    const { data } = await getBrowserClient().auth.getSession();
    return fetch(path, { method: "POST", headers: { "Content-Type": "application/json", ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) }, body: JSON.stringify(body) });
  }
  async function save() {
    setSaving(true); setMessage(""); localStorage.setItem("budgetIdea.currency", currency); localStorage.setItem("budgetIdea.contingencyPct", String(contingencyPct));
    const response = await request("/api/idea-di-budget", rows);
    setMessage(response.ok ? "Idea di budget salvata." : "Salvataggio non riuscito."); setSaving(false);
  }
  async function apply() {
    setSaving(true); setMessage("");
    const response = await request("/api/idea-di-budget/apply", { country: (localStorage.getItem("country") || "it"), rows });
    const json = await response.json().catch(() => ({}));
    setMessage(response.ok ? `${json.inserted || 0} voci applicate al Budget.` : "Applicazione al Budget non riuscita."); setSaving(false);
  }

  if (loading) return <p className="p-6 text-gray-600">Caricamento idea di budget…</p>;
  return <main className="mx-auto max-w-5xl space-y-6 px-3 py-5 sm:p-6">
    <header><h1 className="font-serif text-3xl font-bold">Idea di budget</h1><p className="mt-2 text-gray-600">Scegli solo le voci che servono al vostro matrimonio. Le altre non incidono sui totali.</p></header>
    <section className="grid gap-4 rounded-xl border bg-white p-4 sm:grid-cols-3">
      <label className="font-semibold sm:col-span-2">Cerca una voce<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Es. make, foto, corsage, autista" className="mt-2 min-h-12 w-full rounded-lg border px-3" /></label>
      <label className="font-semibold">Imprevisti (%)<input type="number" inputMode="decimal" min="0" max="100" value={contingencyPct} onChange={(e) => setContingencyPct(number(e.target.value))} className="mt-2 min-h-12 w-full rounded-lg border px-3" /></label>
    </section>
    <section className="space-y-3">
      {searchedCategories.map((category) => {
        const expanded = normalizedQuery.length > 0 || open.has(category);
        return <article key={category} className="overflow-hidden rounded-xl border bg-white">
          <button type="button" aria-expanded={expanded} onClick={() => setOpen((current) => { const next = new Set(current); if (next.has(category)) next.delete(category); else next.add(category); return next; })} className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 text-left"><span className="font-bold">{category}</span><span className="whitespace-nowrap font-semibold text-rose-700">{money(categoryTotal(category), currency)} <span aria-hidden>⌄</span></span></button>
          {expanded && <div className="space-y-3 border-t bg-gray-50 p-3 sm:p-4">
            {visible(category).map(({ row, index }) => <div key={`${row.subcategory}-${index}`} className={`rounded-xl border bg-white p-3 ${row.enabled ? "border-rose-200" : "border-gray-200"}`}>
              <div className="flex items-start gap-3"><input id={`enabled-${index}`} type="checkbox" checked={row.enabled} onChange={(e) => change(index, { enabled: e.target.checked })} className="mt-1 h-5 w-5 shrink-0" /><label htmlFor={`enabled-${index}`} className="min-w-0 flex-1 font-semibold">{row.custom ? <input aria-label="Nome voce personalizzata" value={row.subcategory} onChange={(e) => change(index, { subcategory: e.target.value })} className="w-full rounded border px-2 py-1" /> : row.subcategory}</label>{row.custom && <button type="button" aria-label={`Elimina ${row.subcategory}`} onClick={() => setRows((current) => current.filter((_, i) => i !== index))} className="rounded px-2 py-1 text-sm font-semibold text-red-700">Elimina</button>}</div>
              {row.enabled && <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-3"><label className="text-sm font-semibold">Importo ({currency})<input type="number" inputMode="decimal" min="0" value={row.amount} onChange={(e) => change(index, { amount: number(e.target.value) })} className="mt-1 min-h-12 w-full rounded-lg border px-3 text-base" /></label><label className="text-sm font-semibold">Tipo spesa<select value={row.spendType} onChange={(e) => change(index, { spendType: e.target.value })} className="mt-1 min-h-12 w-full rounded-lg border px-3">{config.spendTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="text-sm font-semibold">Note<input value={row.notes || ""} onChange={(e) => change(index, { notes: e.target.value })} className="mt-1 min-h-12 w-full rounded-lg border px-3" /></label></div>}
            </div>)}
            <button type="button" onClick={() => addCustom(category)} className="min-h-11 rounded-full border border-rose-700 px-4 font-semibold text-rose-800">+ Aggiungi voce personalizzata</button>
          </div>}
        </article>;
      })}
      {!searchedCategories.length && <p className="rounded-xl border bg-white p-5">Nessuna voce trovata.</p>}
    </section>
    <section className="sticky bottom-3 grid gap-3 rounded-xl border bg-white/95 p-4 shadow-lg sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p><strong>Totale pianificato:</strong> {money(totals.planned, currency)}</p><p className="text-sm text-gray-600">Imprevisti: {money(totals.contingency, currency)} · Totale con imprevisti: <strong>{money(totals.total, currency)}</strong></p><p role="status" className="mt-1 text-sm text-emerald-700">{message}</p></div><button type="button" disabled={saving} onClick={save} className="min-h-12 rounded-full border border-rose-700 px-5 font-semibold text-rose-800 disabled:opacity-60">Salva</button><button type="button" disabled={saving} onClick={apply} className="min-h-12 rounded-full bg-rose-700 px-5 font-semibold text-white disabled:opacity-60">Applica al Budget</button></section>
  </main>;
}
