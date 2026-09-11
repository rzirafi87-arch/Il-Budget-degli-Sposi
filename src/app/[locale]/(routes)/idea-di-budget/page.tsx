"use client";

import { DEFAULT_EVENT_TYPE, getEventConfig, resolveEventType } from "@/constants/eventConfigs";
import { WEDDING_BUDGET_TAXONOMY, findWeddingBudgetItem } from "@/constants/budgetCategories";
import { getIntlLocale } from "@/i18n/localeFormat";
import {
  getLocalizedWeddingBudgetItem,
  getWeddingBudgetCategoryLabel,
  getWeddingBudgetTaxonomy,
  type WeddingBudgetLocale,
} from "@/i18n/weddingBudgetTaxonomy";
import { budgetTotals, matchesBudgetSearch } from "@/lib/budgetIdea";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

export type BudgetIdeaRow = {
  id?: string;
  canonicalKey?: string;
  category: string;
  categoryLabel: string;
  subcategory: string;
  aliases?: readonly string[];
  contexts?: readonly string[];
  package?: "wedding_bag";
  spendType: string;
  amount: number;
  enabled: boolean;
  supplier?: string;
  notes?: string;
  custom?: boolean;
};

const WEDDING_LOCALES: readonly WeddingBudgetLocale[] = ["it", "en", "es", "fr", "de"];
const canonicalByKey = new Map(WEDDING_BUDGET_TAXONOMY.map((item) => [item.key, item]));
const number = (value: unknown) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;

function budgetLocale(locale: string): WeddingBudgetLocale {
  return WEDDING_LOCALES.includes(locale as WeddingBudgetLocale) ? locale as WeddingBudgetLocale : "it";
}

function browserEventType() {
  if (typeof window === "undefined") return DEFAULT_EVENT_TYPE;
  const cookieType = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
  return resolveEventType(localStorage.getItem("eventType") || cookieType || DEFAULT_EVENT_TYPE);
}

function defaults(eventType: string, locale: WeddingBudgetLocale): BudgetIdeaRow[] {
  const config = getEventConfig(eventType);
  if (eventType === "wedding") {
    return getWeddingBudgetTaxonomy(locale).map((item) => ({
      canonicalKey: item.canonicalKey,
      category: item.canonicalCategory,
      categoryLabel: item.categoryLabel,
      subcategory: item.label,
      aliases: item.searchAliases,
      contexts: item.presentationContexts,
      package: item.package,
      spendType: config.defaultSpendType,
      amount: 0,
      enabled: false,
      supplier: "",
      notes: "",
      custom: false,
    }));
  }
  return Object.entries(config.budgetCategories).flatMap(([category, entries]) => entries.map((subcategory) => ({
    category,
    categoryLabel: category,
    subcategory,
    spendType: config.defaultSpendType,
    amount: 0,
    enabled: false,
    supplier: "",
    notes: "",
    custom: false,
  })));
}

function canonicalPayload(rows: BudgetIdeaRow[]) {
  return rows.map((row) => {
    const canonical = row.canonicalKey ? canonicalByKey.get(row.canonicalKey) : undefined;
    return {
      id: row.id,
      canonicalKey: row.canonicalKey,
      category: canonical?.category || row.category,
      subcategory: canonical?.label || row.subcategory,
      package: canonical?.package || row.package,
      spendType: row.spendType,
      amount: row.amount,
      idea_amount: row.amount,
      enabled: row.enabled,
      supplier: row.supplier || "",
      notes: row.notes || "",
      custom: row.custom === true,
    };
  });
}

export default function BudgetIdeaPage() {
  const locale = useLocale();
  const localeForBudget = budgetLocale(locale);
  const t = useTranslations("budgetIdea");
  const [eventType, setEventType] = useState(() => browserEventType());
  const config = useMemo(() => getEventConfig(eventType), [eventType]);
  const [rows, setRows] = useState<BudgetIdeaRow[]>([]);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [country, setCountry] = useState("it");
  const [contingencyPct, setContingencyPct] = useState(() => typeof window === "undefined" ? 0 : number(localStorage.getItem("budgetIdea.contingencyPct")));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const money = (value: number) => new Intl.NumberFormat(getIntlLocale(locale), { style: "currency", currency }).format(value || 0);

  useEffect(() => {
    let active = true;
    void (async () => {
      setLoading(true);
      setMessage("");
      const { data } = await getBrowserClient().auth.getSession();
      const authHeaders = data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {};
      const fallbackType = browserEventType();

      const eventResponse = await fetch("/api/event/resolve", { headers: authHeaders });
      const eventJson = eventResponse.ok ? await eventResponse.json().catch(() => ({})) : {};
      const resolvedType = resolveEventType(String(eventJson?.event?.event_type || fallbackType));
      const resolvedCurrency = String(eventJson?.event?.currency || "EUR").toUpperCase();
      const resolvedCountry = String(eventJson?.event?.country || "it").toLowerCase();
      const resolvedConfig = getEventConfig(resolvedType);
      const base = defaults(resolvedType, localeForBudget);

      const response = await fetch("/api/idea-di-budget", { headers: authHeaders });
      const json = response.ok ? await response.json().catch(() => ({ data: [] })) : { data: [] };
      if (!active) return;

      setEventType(resolvedType);
      setCurrency(resolvedCurrency);
      setCountry(resolvedCountry);

      const saved = Array.isArray(json.data) ? json.data as Array<Record<string, unknown>> : [];
      const byKey = new Map(base.map((row) => [row.canonicalKey ? `canonical:${row.canonicalKey}` : `${row.category}\u0000${row.subcategory}`, row]));
      saved.forEach((entry) => {
        const isCustom = entry.custom === true;
        const legacyCanonical = isCustom ? undefined : findWeddingBudgetItem(String(entry.category || ""), String(entry.canonicalKey || entry.subcategory || ""));
        const canonicalKey = legacyCanonical?.key || String(entry.canonicalKey || "") || undefined;
        const localized = canonicalKey && resolvedType === "wedding" ? getLocalizedWeddingBudgetItem(canonicalKey, localeForBudget) : undefined;
        const canonicalCategory = localized?.canonicalCategory || legacyCanonical?.category || String(entry.category || "");
        const row: BudgetIdeaRow = {
          id: String(entry.id || "") || undefined,
          canonicalKey,
          category: canonicalCategory,
          categoryLabel: resolvedType === "wedding" ? (localized?.categoryLabel || getWeddingBudgetCategoryLabel(canonicalCategory, localeForBudget)) : canonicalCategory,
          subcategory: isCustom ? String(entry.subcategory || "") : (localized?.label || legacyCanonical?.label || String(entry.subcategory || "")),
          aliases: localized?.searchAliases || legacyCanonical?.aliases,
          contexts: localized?.presentationContexts || legacyCanonical?.contexts,
          package: localized?.package || legacyCanonical?.package,
          spendType: String(entry.spendType || resolvedConfig.defaultSpendType),
          amount: number(entry.idea_amount ?? entry.amount),
          enabled: entry.enabled !== false,
          supplier: String(entry.supplier || ""),
          notes: String(entry.notes || ""),
          custom: isCustom,
        };
        if (row.category && row.subcategory) byKey.set(row.canonicalKey ? `canonical:${row.canonicalKey}` : `${row.category}\u0000${row.subcategory}`, row);
      });
      setRows([...byKey.values()]);
      if (!response.ok) setMessage(t("messages.loadError"));
      setLoading(false);
    })();
    return () => { active = false; };
  }, [localeForBudget, t]);

  const categories = useMemo(() => [...new Set(rows.map((row) => row.category))], [rows]);
  const normalizedQuery = query.trim();
  const visible = (category: string) => rows.map((row, index) => ({ row, index })).filter(({ row }) => row.category === category && (!normalizedQuery || matchesBudgetSearch(row.categoryLabel, row.subcategory, normalizedQuery, row.aliases, row.contexts)));
  const searchedCategories = normalizedQuery ? categories.filter((category) => visible(category).length) : categories;
  const totals = useMemo(() => budgetTotals(rows, contingencyPct), [rows, contingencyPct]);
  const categoryTotal = (category: string) => rows.reduce((sum, row) => sum + (row.category === category && row.enabled ? row.amount : 0), 0);
  const categoryLabel = (category: string) => rows.find((row) => row.category === category)?.categoryLabel || category;
  const change = (index: number, patch: Partial<BudgetIdeaRow>) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));

  function addCustom(category: string) {
    const label = window.prompt(t("custom.prompt"));
    if (!label?.trim()) return;
    setRows((current) => [...current, {
      category,
      categoryLabel: categoryLabel(category),
      subcategory: label.trim(),
      spendType: config.defaultSpendType,
      amount: 0,
      enabled: true,
      custom: true,
      supplier: "",
      notes: "",
    }]);
    setOpen((current) => new Set(current).add(category));
  }

  function spendTypeLabel(value: string, fallback: string) {
    if (value === "bride") return t("spendTypes.bride");
    if (value === "groom") return t("spendTypes.groom");
    if (value === "municipality") return t("spendTypes.municipality");
    if (value === "gift") return t("spendTypes.gift");
    return fallback;
  }

  async function request(path: string, body: unknown) {
    const { data } = await getBrowserClient().auth.getSession();
    return fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) },
      body: JSON.stringify(body),
    });
  }

  async function save() {
    setSaving(true);
    setMessage("");
    localStorage.setItem("budgetIdea.contingencyPct", String(contingencyPct));
    const response = await request("/api/idea-di-budget", canonicalPayload(rows));
    setMessage(response.ok ? t("messages.saved") : t("messages.saveError"));
    setSaving(false);
  }

  async function apply() {
    setSaving(true);
    setMessage("");
    const response = await request("/api/idea-di-budget/apply", { country, rows: canonicalPayload(rows) });
    const json = await response.json().catch(() => ({}));
    setMessage(response.ok ? t("messages.applied", { count: Number(json.inserted || 0) }) : t("messages.applyError"));
    setSaving(false);
  }

  if (loading) return <p className="p-6 text-gray-600">{t("loading")}</p>;

  return <main className="mx-auto max-w-5xl space-y-6 px-3 py-5 sm:p-6">
    <header>
      <h1 className="font-serif text-3xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-gray-600">{t("description")}</p>
    </header>

    <section className="grid gap-4 rounded-xl border bg-white p-4 sm:grid-cols-3">
      <label className="font-semibold sm:col-span-2">{t("search.label")}<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search.placeholder")} className="mt-2 min-h-12 w-full rounded-lg border px-3" /></label>
      <label className="font-semibold">{t("contingencyPct")}<input type="number" inputMode="decimal" min="0" max="100" value={contingencyPct} onChange={(e) => setContingencyPct(number(e.target.value))} className="mt-2 min-h-12 w-full rounded-lg border px-3" /></label>
    </section>

    <section className="space-y-3">
      {searchedCategories.map((category) => {
        const expanded = normalizedQuery.length > 0 || open.has(category);
        return <article key={category} className="overflow-hidden rounded-xl border bg-white">
          <button type="button" aria-expanded={expanded} onClick={() => setOpen((current) => { const next = new Set(current); if (next.has(category)) next.delete(category); else next.add(category); return next; })} className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 text-left">
            <span className="font-bold">{categoryLabel(category)}</span>
            <span className="whitespace-nowrap font-semibold text-rose-700">{money(categoryTotal(category))} <span aria-hidden>⌄</span></span>
          </button>
          {expanded && <div className="space-y-3 border-t bg-gray-50 p-3 sm:p-4">
            {visible(category).map(({ row, index }) => <div key={row.canonicalKey || `${row.subcategory}-${index}`} className={`rounded-xl border bg-white p-3 ${row.enabled ? "border-rose-200" : "border-gray-200"}`}>
              <div className="flex items-start gap-3">
                <input id={`enabled-${index}`} type="checkbox" checked={row.enabled} onChange={(e) => change(index, { enabled: e.target.checked })} className="mt-1 h-5 w-5 shrink-0" />
                <label htmlFor={`enabled-${index}`} className="min-w-0 flex-1 font-semibold">{row.custom ? <input aria-label={t("custom.nameAria")} value={row.subcategory} onChange={(e) => change(index, { subcategory: e.target.value })} className="w-full rounded border px-2 py-1" /> : row.subcategory}</label>
                {row.custom && <button type="button" aria-label={t("custom.deleteAria", { name: row.subcategory })} onClick={() => setRows((current) => current.filter((_, i) => i !== index))} className="rounded px-2 py-1 text-sm font-semibold text-red-700">{t("custom.delete")}</button>}
              </div>
              {row.enabled && <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-3">
                <label className="text-sm font-semibold">{t("fields.amount", { currency })}<input type="number" inputMode="decimal" min="0" value={row.amount} onChange={(e) => change(index, { amount: number(e.target.value) })} className="mt-1 min-h-12 w-full rounded-lg border px-3 text-base" /></label>
                <label className="text-sm font-semibold">{t("fields.spendType")}<select value={row.spendType} onChange={(e) => change(index, { spendType: e.target.value })} className="mt-1 min-h-12 w-full rounded-lg border px-3">{config.spendTypes.map((option) => <option key={option.value} value={option.value}>{spendTypeLabel(option.value, option.label)}</option>)}</select></label>
                <label className="text-sm font-semibold">{t("fields.notes")}<input value={row.notes || ""} onChange={(e) => change(index, { notes: e.target.value })} className="mt-1 min-h-12 w-full rounded-lg border px-3" /></label>
              </div>}
              {row.enabled && row.package === "wedding_bag" ? <p className="mt-2 text-xs font-semibold text-emerald-700">{t("weddingBagIncluded")}</p> : null}
            </div>)}
            <button type="button" onClick={() => addCustom(category)} className="min-h-11 rounded-full border border-rose-700 px-4 font-semibold text-rose-800">{t("custom.add")}</button>
          </div>}
        </article>;
      })}
      {!searchedCategories.length && <p className="rounded-xl border bg-white p-5">{t("search.empty")}</p>}
    </section>

    <section className="sticky bottom-3 grid gap-3 rounded-xl border bg-white/95 p-4 shadow-lg sm:grid-cols-[1fr_auto_auto] sm:items-center">
      <div>
        <p><strong>{t("summary.planned")}</strong> {money(totals.planned)}</p>
        <p className="text-sm text-gray-600">{t("summary.contingency", { amount: money(totals.contingency) })} · <strong>{t("summary.withContingency", { amount: money(totals.total) })}</strong></p>
        <p role="status" className="mt-1 text-sm text-emerald-700">{message}</p>
      </div>
      <button type="button" disabled={saving} onClick={save} className="min-h-12 rounded-full border border-rose-700 px-5 font-semibold text-rose-800 disabled:opacity-60">{saving ? t("actions.saving") : t("actions.save")}</button>
      <button type="button" disabled={saving} onClick={apply} className="min-h-12 rounded-full bg-rose-700 px-5 font-semibold text-white disabled:opacity-60">{t("actions.apply")}</button>
    </section>
  </main>;
}
