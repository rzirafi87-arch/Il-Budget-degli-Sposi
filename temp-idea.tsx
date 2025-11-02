"use client";
<<<<<<< ours
import { BUDGET_CATEGORIES as WEDDING_BUDGET_CATEGORIES } from "@/constants/budgetCategories";
import { BAPTISM_VENDOR_TYPES, getBaptismBudgetPercentages, getBaptismComplianceNotes, getBaptismTemplate } from "@/data/templates/baptism";
import { getCommunionBudgetPercentages, getCommunionTemplate } from "@/data/templates/communion";
import { getConfirmationBudgetPercentages, getConfirmationTemplate } from "@/data/templates/confirmation";
import { getEighteenthBudgetPercentages, getEighteenthTemplate } from "@/data/templates/eighteenth";
import { getGraduationBudgetPercentages, getGraduationTemplate } from "@/data/templates/graduation";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useCallback, useEffect, useMemo, useState } from "react";
=======
import React, { useState, useEffect, useMemo } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";
import { getEventConfig, resolveEventType, DEFAULT_EVENT_TYPE } from "@/constants/eventConfigs";

type ContributorBudgets = Record<string, number>;

type SpendTypeOption = {
  value: string;
  label: string;
};
>>>>>>> theirs

// Struttura dati per idea di budget
export type BudgetIdeaRow = {
  id?: string;
  category: string;
  subcategory: string;
  spendType: string;
  amount: number;
  supplier?: string;
  notes?: string;
};

<<<<<<< ours
// Resolve categories based on selected event type
function resolveCategories(): Record<string, string[]> {
  const et = typeof window !== "undefined" ? (localStorage.getItem("eventType") || "wedding") : "wedding";
  const country = typeof window !== "undefined" ? (localStorage.getItem("country") || "it") : "it";
  if (et === "baptism") {
    const obj: Record<string, string[]> = {};
    const tpl = getBaptismTemplate(country);
    tpl.forEach(cat => { obj[cat.name] = cat.subs; });
    return obj;
  }
  if (et === "graduation") {
    const obj: Record<string, string[]> = {};
    const tpl = getGraduationTemplate(country);
    tpl.forEach(cat => { obj[cat.name] = cat.subs; });
    return obj;
  }
  if (et === "eighteenth") {
    const obj: Record<string, string[]> = {};
    const tpl = getEighteenthTemplate(country);
    tpl.forEach(cat => { obj[cat.name] = cat.subs; });
    return obj;
  }
  if (et === "communion") {
    const obj: Record<string, string[]> = {};
    const tpl = getCommunionTemplate(country);
    tpl.forEach(cat => { obj[cat.name] = cat.subs; });
    return obj;
  }
  if (et === "confirmation") {
    const obj: Record<string, string[]> = {};
    const tpl = getConfirmationTemplate(country);
    tpl.forEach(cat => { obj[cat.name] = cat.subs; });
    return obj;
  }
  return WEDDING_BUDGET_CATEGORIES;
}

const BASE_SPEND_TYPES = [
  { value: "common", label: "Comune" },
  { value: "bride", label: "Sposa" },
  { value: "groom", label: "Sposo" },
  { value: "gift", label: "Regalo" },
];

export default function IdeaDiBudgetPage() {
  const [eventType, setEventType] = useState<string>(() => (typeof window !== "undefined" ? localStorage.getItem("eventType") || "wedding" : "wedding"));
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string[]>>(() => resolveCategories());
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
  const [currency, setCurrency] = useState<string>(() => {
    if (typeof window === "undefined") return "EUR";
    const saved = localStorage.getItem("budgetIdea.currency");
    if (saved) return saved;
    const country = localStorage.getItem("country") || "it";
    return country === "mx" ? "MXN" : "EUR";
  });
=======
export default function IdeaDiBudgetPage() {
  const supabase = getBrowserClient();

  const [eventType, setEventType] = useState<string>(DEFAULT_EVENT_TYPE);
  const eventConfig = getEventConfig(eventType);

  const [rows, setRows] = useState<BudgetIdeaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contributorBudgets, setContributorBudgets] = useState<ContributorBudgets>({});
  const [eventDate, setEventDate] = useState<string>("");
  const [currency, setCurrency] = useState<string>(() =>
    (typeof window !== "undefined" && localStorage.getItem("budgetIdea.currency")) || "EUR"
  );
>>>>>>> theirs
  const [contingencyPct, setContingencyPct] = useState<number>(() => {
    const v = typeof window !== "undefined" ? Number(localStorage.getItem("budgetIdea.contingencyPct") || 0) : 0;
    return Number.isFinite(v) ? v : 0;
  });
  const [compactView, setCompactView] = useState<boolean>(() =>
    typeof window !== "undefined" ? localStorage.getItem("budgetIdea.compactView") === "1" : false
  );
<<<<<<< ours

  const supabase = getBrowserClient();
  const fmt = useMemo(() => new Intl.NumberFormat("it-IT", { style: "currency", currency }), [currency]);
  const spendTypes = useMemo(() => {
    if (eventType === 'baptism' || eventType === 'graduation' || eventType === 'confirmation' || eventType === 'communion') return [{ value: 'common', label: 'Comune' }];
    return BASE_SPEND_TYPES;
  }, [eventType]);
  const country = typeof window !== "undefined" ? (localStorage.getItem("country") || "it") : "it";
  const baptismCompliance = useMemo(() => getBaptismComplianceNotes(country), [country]);
  
  // Suggest amounts based on event type percentages (per Laurea)
  const suggestGraduationAmounts = useCallback(() => {
    const totalBase = (brideBudget || 0) + (groomBudget || 0);
    const total = totalBase > 0 ? totalBase * (1 + (contingencyPct || 0) / 100) : 0;
    if (!total || total <= 0) return;
    const newRows = [...rows];
    const pctMap = getGraduationBudgetPercentages();
    // distribuisci per categoria e sottocategoria in parti uguali
    const subCount: Record<string, number> = {};
    Object.entries(categoriesMap).forEach(([cat, subs]) => { subCount[cat] = subs.length || 1; });
    const catBudget: Record<string, number> = {};
    Object.keys(categoriesMap).forEach((cat) => {
      const pct = pctMap[cat] || 0;
      catBudget[cat] = (pct / 100) * total;
    });
    const perKey: Record<string, number> = {};
    Object.entries(categoriesMap).forEach(([cat, subs]) => {
      const each = subCount[cat] ? catBudget[cat] / subCount[cat] : 0;
      subs.forEach((sub) => { perKey[`${cat}|||${sub}`] = Math.max(0, Math.round(each)); });
    });
    for (let i = 0; i < newRows.length; i++) {
      const r = newRows[i];
      const key = `${r.category}|||${r.subcategory}`;
      if (perKey[key] != null) newRows[i] = { ...r, amount: perKey[key] };
    }
    setRows(newRows);
  }, [rows, categoriesMap, brideBudget, groomBudget, contingencyPct]);

  // Suggest amounts based on event type percentages (Cresima)
  const suggestConfirmationAmounts = useCallback(() => {
    const totalBase = (brideBudget || 0) + (groomBudget || 0);
    const total = totalBase > 0 ? totalBase * (1 + (contingencyPct || 0) / 100) : 0;
    if (!total || total <= 0) return;
    const newRows = [...rows];
    const pctMap = getConfirmationBudgetPercentages();
    const subCount: Record<string, number> = {};
    Object.entries(categoriesMap).forEach(([cat, subs]) => { subCount[cat] = subs.length || 1; });
    const catBudget: Record<string, number> = {};
    Object.keys(categoriesMap).forEach((cat) => {
      const pct = pctMap[cat] || 0;
      catBudget[cat] = (pct / 100) * total;
    });
    const perKey: Record<string, number> = {};
    Object.entries(categoriesMap).forEach(([cat, subs]) => {
      const each = subCount[cat] ? catBudget[cat] / subCount[cat] : 0;
      subs.forEach((sub) => { perKey[`${cat}|||${sub}`] = Math.max(0, Math.round(each)); });
    });
    for (let i = 0; i < newRows.length; i++) {
      const r = newRows[i];
      const key = `${r.category}|||${r.subcategory}`;
      if (perKey[key] != null) newRows[i] = { ...r, amount: perKey[key] };
    }
    setRows(newRows);
  }, [rows, categoriesMap, brideBudget, groomBudget, contingencyPct]);

  // Utility: (re)load budget ideas and merge with all possible subcategories
  const fetchBudgetIdeas = useCallback(async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData.session?.access_token;
    const headers: HeadersInit = {};
    if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
    const res = await fetch("/api/idea-di-budget", { headers });
    const json = await res.json();
    const byKey = new Map<string, BudgetIdeaRow>();
    if (json.data && Array.isArray(json.data)) {
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
          if (cur.spendType === "common" && spendType !== "common") cur.spendType = spendType;
          if (!cur.supplier && supplier) cur.supplier = supplier;
          if (!cur.notes && notes) cur.notes = notes;
        }
      }
    }
    const allRows: BudgetIdeaRow[] = [];
    Object.entries(categoriesMap).forEach(([category, subs]) => {
      subs.forEach((subcategory) => {
        const key = `${category}|||${subcategory}`;
        if (byKey.has(key)) {
          allRows.push(byKey.get(key)!);
        } else {
          allRows.push({ category, subcategory, spendType: "common", amount: 0, supplier: "", notes: "" });
        }
      });
    });
    setRows(allRows);
    setLoading(false);
  }, [categoriesMap, supabase]);

  // Initialize eventType and categories, then load ideas
  useEffect(() => {
    const et = typeof window !== "undefined" ? (localStorage.getItem("eventType") || "wedding") : "wedding";
    setEventType(et);
    setCategoriesMap(resolveCategories());
  }, []);

  useEffect(() => {
    fetchBudgetIdeas();
  }, [fetchBudgetIdeas]);

  // Suggest amounts based on event type percentages (for Battesimo)
  const suggestBaptismAmounts = useCallback(() => {
    const totalBase = (brideBudget || 0) + (groomBudget || 0);
    const total = totalBase > 0 ? totalBase * (1 + (contingencyPct || 0) / 100) : 0;
    if (!total || total <= 0) return; // nothing to do
    const newRows = [...rows];
    // build sub count per category
    const subCount: Record<string, number> = {};
    Object.entries(categoriesMap).forEach(([cat, subs]) => {
      subCount[cat] = subs.length || 1;
    });
    // mid percentage per category
    const catBudget: Record<string, number> = {};
    const country = typeof window !== "undefined" ? (localStorage.getItem("country") || "it") : "it";
    const pctMap = getBaptismBudgetPercentages(country);
    Object.keys(categoriesMap).forEach((cat) => {
      const rng = pctMap[cat];
      const pct = rng ? (rng.min + rng.max) / 2 : 0;
      catBudget[cat] = (pct / 100) * total;
    });
    // distribute equally on subcategories
    const perKey: Record<string, number> = {};
    Object.entries(categoriesMap).forEach(([cat, subs]) => {
      const each = subCount[cat] ? catBudget[cat] / subCount[cat] : 0;
      subs.forEach((sub) => {
        perKey[`${cat}|||${sub}`] = Math.max(0, Math.round(each));
      });
    });
    // apply to rows
    for (let i = 0; i < newRows.length; i++) {
      const r = newRows[i];
      const key = `${r.category}|||${r.subcategory}`;
      if (perKey[key] != null) newRows[i] = { ...r, amount: perKey[key] };
    }
    setRows(newRows);
  }, [rows, categoriesMap, brideBudget, groomBudget, contingencyPct]);

  // Suggest amounts based on event type percentages (Comunione)
  const suggestCommunionAmounts = useCallback(() => {
    const totalBase = (brideBudget || 0) + (groomBudget || 0);
    const total = totalBase > 0 ? totalBase * (1 + (contingencyPct || 0) / 100) : 0;
    if (!total || total <= 0) return;
    const newRows = [...rows];
    const pctMap: Record<string, number> = getCommunionBudgetPercentages();
    const subCount: Record<string, number> = {};
    Object.entries(categoriesMap).forEach(([cat, subs]) => { subCount[cat] = subs.length || 1; });
    const catBudget: Record<string, number> = {};
    Object.keys(categoriesMap).forEach((cat) => {
      const pct = pctMap[cat] || 0;
      catBudget[cat] = (pct / 100) * total;
    });
    const perKey: Record<string, number> = {};
    Object.entries(categoriesMap).forEach(([cat, subs]) => {
      const each = subCount[cat] ? catBudget[cat] / subCount[cat] : 0;
      subs.forEach((sub) => { perKey[`${cat}|||${sub}`] = Math.max(0, Math.round(each)); });
    });
    for (let i = 0; i < newRows.length; i++) {
      const r = newRows[i];
      const key = `${r.category}|||${r.subcategory}`;
      if (perKey[key] != null) newRows[i] = { ...r, amount: perKey[key] };
    }
    setRows(newRows);
  }, [rows, categoriesMap, brideBudget, groomBudget, contingencyPct]);

  // Suggest amounts based on event type percentages (Diciottesimo)
  const suggestEighteenthAmounts = useCallback(() => {
    const totalBase = (brideBudget || 0) + (groomBudget || 0);
    const total = totalBase > 0 ? totalBase * (1 + (contingencyPct || 0) / 100) : 0;
    if (!total || total <= 0) return;
    const newRows = [...rows];
    const pctMap: Record<string, number> = getEighteenthBudgetPercentages();
    const subCount: Record<string, number> = {};
    Object.entries(categoriesMap).forEach(([cat, subs]) => { subCount[cat] = subs.length || 1; });
    const catBudget: Record<string, number> = {};
    Object.keys(categoriesMap).forEach((cat) => {
      const pct = pctMap[cat] || 0;
      catBudget[cat] = (pct / 100) * total;
    });
    const perKey: Record<string, number> = {};
    Object.entries(categoriesMap).forEach(([cat, subs]) => {
      const each = subCount[cat] ? catBudget[cat] / subCount[cat] : 0;
      subs.forEach((sub) => { perKey[`${cat}|||${sub}`] = Math.max(0, Math.round(each)); });
    });
    for (let i = 0; i < newRows.length; i++) {
      const r = newRows[i];
      const key = `${r.category}|||${r.subcategory}`;
      if (perKey[key] != null) newRows[i] = { ...r, amount: perKey[key] };
    }
    setRows(newRows);
  }, [rows, categoriesMap, brideBudget, groomBudget, contingencyPct]);

  // Persist simple view preferences
=======

  // Recupera il tipo di evento selezionato
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cookieMatch = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
    const stored = window.localStorage.getItem("eventType");
    const resolved = resolveEventType(stored || cookieMatch || DEFAULT_EVENT_TYPE);
    setEventType(resolved);
  }, []);

  // Inizializza budget e data per il tipo di evento corrente
  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextBudgets: ContributorBudgets = {};
    eventConfig.contributors.forEach(({ value }) => {
      const stored = window.localStorage.getItem(`budgetIdea.budget.${eventType}.${value}`);
      nextBudgets[value] = stored ? Number(stored) || 0 : 0;
    });
    setContributorBudgets(nextBudgets);
    const storedDate = window.localStorage.getItem(`budgetIdea.eventDate.${eventType}`) || "";
    setEventDate(storedDate);
  }, [eventConfig.contributors, eventType]);

  // Carica idee di budget reali da Supabase o genera struttura base
  useEffect(() => {
    async function fetchBudgetIdeas() {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData.session?.access_token;
      const headers: HeadersInit = {};
      if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
      try {
        const res = await fetch("/api/idea-di-budget", { headers });
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const byKey = new Map<string, BudgetIdeaRow>();
          for (const r of json.data) {
            const category = r.categories?.name || r.category || "";
            const subcategory = r.subcategory || "";
            const key = `${category}|||${subcategory}`;
            const amount = Number(r.idea_amount ?? r.amount ?? 0) || 0;
            const rawSpendType = (r.spendType || r.spend_type || eventConfig.defaultSpendType) as string;
            const spendType = rawSpendType === "common" ? eventConfig.defaultSpendType : rawSpendType;
            const supplier = r.supplier || "";
            const notes = r.notes || "";
            if (!byKey.has(key)) {
              byKey.set(key, { category, subcategory, spendType, amount, supplier, notes });
            } else {
              const cur = byKey.get(key)!;
              cur.amount = (Number(cur.amount) || 0) + amount;
              if (!cur.supplier && supplier) cur.supplier = supplier;
              if (!cur.notes && notes) cur.notes = notes;
              if (cur.spendType === eventConfig.defaultSpendType && spendType !== eventConfig.defaultSpendType) cur.spendType = spendType;
            }
          }
          setRows(Array.from(byKey.values()));
        } else {
          const allRows: BudgetIdeaRow[] = [];
          Object.entries(eventConfig.budgetCategories).forEach(([category, subs]) => {
            subs.forEach((subcategory) => {
              allRows.push({
                category,
                subcategory,
                spendType: eventConfig.defaultSpendType,
                amount: 0,
                supplier: "",
                notes: "",
              });
            });
          });
          setRows(allRows);
        }
      } catch (error) {
        console.error("Errore caricamento idea di budget", error);
        const allRows: BudgetIdeaRow[] = [];
        Object.entries(eventConfig.budgetCategories).forEach(([category, subs]) => {
          subs.forEach((subcategory) => {
            allRows.push({
              category,
              subcategory,
              spendType: eventConfig.defaultSpendType,
              amount: 0,
              supplier: "",
              notes: "",
            });
          });
        });
        setRows(allRows);
      } finally {
        setLoading(false);
      }
    }
    fetchBudgetIdeas();
  }, [eventConfig, eventType, supabase]);

  // Persist semplice preferenze di visualizzazione
>>>>>>> theirs
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("budgetIdea.currency", currency);
      localStorage.setItem("budgetIdea.contingencyPct", String(contingencyPct));
      localStorage.setItem("budgetIdea.compactView", compactView ? "1" : "0");
    }
  }, [currency, contingencyPct, compactView]);

  // Persist budget per contributor (e compatibilit+· dashboard esistente)
  useEffect(() => {
    if (typeof window === "undefined") return;
    eventConfig.contributors.forEach(({ value }) => {
      const amount = contributorBudgets[value] || 0;
      localStorage.setItem(`budgetIdea.budget.${eventType}.${value}`, String(amount));
    });
    const first = eventConfig.contributors[0]?.value;
    const second = eventConfig.contributors[1]?.value;
    if (first) localStorage.setItem("brideBudget", String(contributorBudgets[first] || 0));
    if (second) {
      localStorage.setItem("groomBudget", String(contributorBudgets[second] || 0));
    } else {
      localStorage.setItem("groomBudget", "0");
    }
  }, [contributorBudgets, eventConfig.contributors, eventType]);

  // Persist data evento (compatibile con dashboard)
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`budgetIdea.eventDate.${eventType}`, eventDate || "");
    localStorage.setItem("weddingDate", eventDate || "");
  }, [eventDate, eventType]);

  const spendTypeOptions: SpendTypeOption[] = useMemo(() => {
    const base = eventConfig.spendTypes;
    const extras = Array.from(
      new Set(
        rows
          .map((row) => row.spendType)
          .filter((value) => value && !base.some((opt) => opt.value === value))
      )
    ).map((value) => ({ value, label: value }));
    return [...base, ...extras];
  }, [eventConfig.spendTypes, rows]);

<<<<<<< ours
  // Gestione input
  function handleChange(
    idx: number,
    field: keyof BudgetIdeaRow,
    value: string | number | BudgetIdeaRow["spendType"]
  ) {
=======
  const spendTypeLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    spendTypeOptions.forEach((opt) => map.set(opt.value, opt.label));
    return map;
  }, [spendTypeOptions]);

  // Gestione input righe tabella
  function handleChange(idx: number, field: keyof BudgetIdeaRow, value: any) {
>>>>>>> theirs
    setRows((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  function handleBudgetChange(key: string, value: number) {
    setContributorBudgets((prev) => ({ ...prev, [key]: value }));
  }

  const plannedBySpendType = useMemo(() => {
    return rows.reduce<Record<string, number>>((acc, row) => {
      const amount = Number(row.amount) || 0;
      acc[row.spendType] = (acc[row.spendType] || 0) + amount;
      return acc;
    }, {});
  }, [rows]);

  const plannedTotal = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    [rows]
  );

  const totalBudget = useMemo(
    () => eventConfig.contributors.reduce((sum, c) => sum + (contributorBudgets[c.value] || 0), 0),
    [contributorBudgets, eventConfig.contributors]
  );

  const extraSpendItems = useMemo(() => {
    const contributorSet = new Set(eventConfig.contributors.map((c) => c.value));
    return Object.entries(plannedBySpendType)
      .filter(([value]) => !contributorSet.has(value))
      .map(([value, amount]) => ({ value, amount }));
  }, [eventConfig.contributors, plannedBySpendType]);

  // Salva su Supabase (tabella budget_ideas)
  async function handleSave() {
    setSaving(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData.session?.access_token;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (jwt) headers["Authorization"] = `Bearer ${jwt}`;

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

    const firstContributor = eventConfig.contributors[0]?.value;
    const secondContributor = eventConfig.contributors[1]?.value;
    const firstBudget = firstContributor ? contributorBudgets[firstContributor] || 0 : 0;
    const secondBudget = secondContributor ? contributorBudgets[secondContributor] || 0 : 0;

    await fetch("/api/my/dashboard", {
      method: "POST",
      headers,
      body: JSON.stringify({
        totalBudget,
        brideBudget: firstBudget,
        groomBudget: secondBudget,
        weddingDate: eventDate,
        rows: [],
      }),
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
        <div className="flex gap-2">
<<<<<<< ours
          <a href="/budget" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">Torna a Budget</a>
          <a href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">Torna in Dashboard</a>
        </div>
      </div>
      {/* Controlli principali: Budget e Data (dinamici per evento) */}
      <div className="mb-6 p-5 rounded-2xl border-2 border-gray-200 bg-white shadow-md">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">{eventType === 'baptism' ? 'Imposta Budget e Data Cerimonia' : eventType === 'graduation' ? 'Imposta Budget e Data Laurea' : 'Imposta Budget e Data Matrimonio'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {eventType === 'baptism' || eventType === 'graduation' || eventType === 'confirmation' || eventType === 'communion' ? (
            <>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">Budget Totale ({currency})</label>
                <input type="number" className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full" value={(brideBudget||0)+(groomBudget||0) || ''} onChange={e=>{ const v = Number(e.target.value)||0; setBrideBudget(v); setGroomBudget(0); }} placeholder="Es. 2000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">{eventType === 'graduation' ? 'Data Laurea' : 'Data Cerimonia'}</label>
                <input type="date" className="border-2 border-[#A3B59D] rounded-lg px-3 py-2 w-full" value={weddingDate} onChange={e=>setWeddingDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Imprevisti (%)</label>
                <input type="number" min={0} max={50} className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full" value={contingencyPct} onChange={(e)=>setContingencyPct(Number(e.target.value)||0)} placeholder="10" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Budget Sposa ({currency})</label>
                <input type="number" className="border-2 border-pink-300 rounded-lg px-3 py-2 w-full" value={brideBudget || ""} onChange={e=>setBrideBudget(Number(e.target.value)||0)} placeholder="Es. 10000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Budget Sposo ({currency})</label>
                <input type="number" className="border-2 border-blue-300 rounded-lg px-3 py-2 w-full" value={groomBudget || ""} onChange={e=>setGroomBudget(Number(e.target.value)||0)} placeholder="Es. 10000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Budget Totale ({currency})</label>
                <input type="number" className="border-2 border-gray-300 bg-gray-100 rounded-lg px-3 py-2 w-full font-bold" value={(brideBudget||0)+(groomBudget||0)} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Data Matrimonio</label>
                <input type="date" className="border-2 border-[#A3B59D] rounded-lg px-3 py-2 w-full" value={weddingDate} onChange={e=>setWeddingDate(e.target.value)} />
              </div>
            </>
          )}
        </div>
        {eventType === 'baptism' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-white/70">
              <h4 className="font-semibold mb-2">Fornitori suggeriti</h4>
              <div className="flex flex-wrap gap-2 text-sm">
                {BAPTISM_VENDOR_TYPES.map((v) => (
                  <span key={v} className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 border">{v}</span>
                ))}
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-white/70">
              <h4 className="font-semibold mb-2">Note paese</h4>
              <ul className="list-disc pl-5 text-sm text-gray-900">
                {baptismCompliance.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {/* Riepiloghi sintetici */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {eventType === 'baptism' || eventType === 'graduation' || eventType === 'confirmation' || eventType === 'communion' ? (
            <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4 sm:col-span-2">
              <h4 className="font-semibold mb-1">Budget Totale</h4>
              <div className="text-sm text-gray-900">Disponibile: {fmt.format(((brideBudget||0)+(groomBudget||0)))}</div>
              <div className="text-sm text-gray-900">Speso (pianificato): {fmt.format(plannedTotal)}</div>
              <div className="text-sm font-semibold text-emerald-700">Residuo: {fmt.format(Math.max(((brideBudget||0)+(groomBudget||0))-plannedTotal,0))}</div>
            </div>
          ) : (
            <>
              <div className="rounded-xl border-2 border-pink-300 bg-pink-50 p-4">
                <h4 className="font-semibold mb-1">Budget Sposa</h4>
                <div className="text-sm text-gray-900">Disponibile: {fmt.format((brideBudget||0))}</div>
                <div className="text-sm text-gray-900">Speso (pianificato): {fmt.format(plannedBride)}</div>
                <div className="text-sm font-semibold text-emerald-700">Residuo: {fmt.format(Math.max((brideBudget||0)-plannedBride,0))}</div>
              </div>
              <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-4">
                <h4 className="font-semibold mb-1">Budget Sposo</h4>
                <div className="text-sm text-gray-900">Disponibile: {fmt.format((groomBudget||0))}</div>
                <div className="text-sm text-gray-900">Speso (pianificato): {fmt.format(plannedGroom)}</div>
                <div className="text-sm font-semibold text-emerald-700">Residuo: {fmt.format(Math.max((groomBudget||0)-plannedGroom,0))}</div>
              </div>
            </>
          )}
          <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4">
            <h4 className="font-semibold mb-1">Budget Totale</h4>
            <div className="text-sm text-gray-900">Disponibile: {fmt.format(((brideBudget||0)+(groomBudget||0)))}</div>
            <div className="text-sm text-gray-900">Speso (pianificato): {fmt.format(plannedTotal)}</div>
            <div className="text-sm font-semibold text-emerald-700">Residuo: {fmt.format(Math.max(((brideBudget||0)+(groomBudget||0))-plannedTotal,0))}</div>
=======
          <a
            href="/budget"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"
          >
            <span aria-hidden>≠É∆¬</span> Torna a Budget
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"
          >
            <span aria-hidden>≠É≈·</span> Torna in Dashboard
          </a>
        </div>
      </div>

      <div className="mb-6 p-5 rounded-2xl border-2 border-gray-200 bg-white shadow-md">
        <h3 className="text-lg font-semibold mb-3">{eventConfig.budgetSectionTitle}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {eventConfig.contributors.map((contributor) => (
            <div key={contributor.value}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {contributor.label} (EUR)
              </label>
              <input
                type="number"
                className="border-2 border-gray-200 rounded-lg px-3 py-2 w-full"
                value={Number.isFinite(contributorBudgets[contributor.value]) ? contributorBudgets[contributor.value] : ""}
                onChange={(e) => handleBudgetChange(contributor.value, Number(e.target.value) || 0)}
                placeholder="Es. 1000"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{eventConfig.totalBudgetLabel} (EUR)</label>
            <input
              type="number"
              className="border-2 border-gray-300 bg-gray-100 rounded-lg px-3 py-2 w-full font-bold"
              value={totalBudget}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{eventConfig.dateLabel}</label>
            <input
              type="date"
              className="border-2 border-[#A3B59D] rounded-lg px-3 py-2 w-full"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {eventConfig.contributors.map((contributor) => {
            const available = contributorBudgets[contributor.value] || 0;
            const planned = plannedBySpendType[contributor.value] || 0;
            const residue = Math.max(available - planned, 0);
            return (
              <div key={contributor.value} className={`rounded-xl ${contributor.cardClass} p-4`}>
                <h4 className="font-semibold mb-1">{contributor.label}</h4>
                <div className="text-sm text-gray-700">Disponibile: ‘Èº {available.toLocaleString()}</div>
                <div className="text-sm text-gray-700">Speso (pianificato): ‘Èº {planned.toLocaleString()}</div>
                <div className="text-sm font-semibold text-emerald-700">Residuo: ‘Èº {residue.toLocaleString()}</div>
              </div>
            );
          })}
          <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4">
            <h4 className="font-semibold mb-1">{eventConfig.totalBudgetLabel}</h4>
            <div className="text-sm text-gray-700">Disponibile: ‘Èº {totalBudget.toLocaleString()}</div>
            <div className="text-sm text-gray-700">Speso (pianificato): ‘Èº {plannedTotal.toLocaleString()}</div>
            <div className="text-sm font-semibold text-emerald-700">
              Residuo: ‘Èº {Math.max(totalBudget - plannedTotal, 0).toLocaleString()}
            </div>
            {extraSpendItems.length > 0 && (
              <div className="mt-3 text-xs text-gray-600">
                <p className="font-semibold mb-1">Altri contributi:</p>
                <ul className="space-y-1">
                  {extraSpendItems.map(({ value, amount }) => (
                    <li key={value}>
                      {spendTypeLabelMap.get(value) || value}: ‘Èº {amount.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
>>>>>>> theirs
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
<<<<<<< ours
                <label className="block text-sm font-medium text-gray-900 mb-1">Valuta</label>
                <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-24 border rounded px-2 py-1" maxLength={4} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Imprevisti (%)</label>
                <input type="number" min={0} max={50} value={contingencyPct} onChange={(e) => setContingencyPct(Number(e.target.value))} className="w-28 border rounded px-2 py-1" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <input id="compactView" type="checkbox" checked={compactView} onChange={(e) => setCompactView(e.target.checked)} className="h-4 w-4" />
                <label htmlFor="compactView" className="text-sm text-gray-900">Vista compatta (righe pi+¶ strette)</label>
=======
                <label className="block text-sm font-medium mb-1">Valuta</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-24 border rounded px-2 py-1"
                  maxLength={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imprevisti (%)</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={contingencyPct}
                  onChange={(e) => setContingencyPct(Number(e.target.value))}
                  className="w-28 border rounded px-2 py-1"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <input
                  id="compactView"
                  type="checkbox"
                  checked={compactView}
                  onChange={(e) => setCompactView(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="compactView" className="text-sm">
                  Vista compatta (righe pi+¶ strette)
                </label>
>>>>>>> theirs
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-900">
              {(() => {
                const base = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
                const extra = (base * (contingencyPct || 0)) / 100;
                const total = base + extra;
                return (
                  <div className="flex flex-wrap gap-4">
<<<<<<< ours
                    <div><strong>Totale ipotizzato:</strong> {fmt.format(base)}</div>
                    <div><strong>Imprevisti:</strong> {fmt.format(extra)} ({contingencyPct}%)</div>
                    <div><strong>Totale con imprevisti:</strong> {fmt.format(total)}</div>
=======
                    <div>
                      <strong>Totale ipotizzato:</strong> {currency} {base.toLocaleString()}
                    </div>
                    <div>
                      <strong>Imprevisti:</strong> {currency} {extra.toLocaleString()} ({contingencyPct}%)
                    </div>
                    <div>
                      <strong>Totale con imprevisti:</strong> {currency} {total.toLocaleString()}
                    </div>
>>>>>>> theirs
                  </div>
                );
              })()}
            </div>
          </div>

          <table className={`w-full border ${compactView ? "text-xs" : "text-sm"} mb-6`}>
            <thead>
              <tr className="bg-gray-100">
<<<<<<< ours
                <th className="p-2 text-gray-900 font-semibold">Categoria</th>
                <th className="p-2 text-gray-900 font-semibold">Sottocategoria</th>
                <th className="p-2 text-gray-900 font-semibold">Fornitore</th>
                <th className="p-2 text-gray-900 font-semibold">Importo ({currency})</th>
                <th className="p-2 text-gray-900 font-semibold">Tipo</th>
                <th className="p-2 text-gray-900 font-semibold">Note</th>
=======
                <th className="p-2">Categoria</th>
                <th className="p-2">Sottocategoria</th>
                <th className="p-2">Fornitore</th>
                <th className="p-2">Importo ({currency})</th>
                <th className="p-2">{eventConfig.spendTypeLabel}</th>
                <th className="p-2">Note</th>
>>>>>>> theirs
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
                      onChange={(e) => handleChange(idx, "spendType", e.target.value)}
                    >
<<<<<<< ours
                      {spendTypes.map((st) => (
                        <option key={st.value} value={st.value}>{st.label}</option>
=======
                      {spendTypeOptions.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
>>>>>>> theirs
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
            {eventType === "baptism" && (
              <button
                className="px-6 py-2 bg-[#3b82f6] text-white rounded font-bold"
                onClick={async () => {
                  setSaving(true);
                  try {
                    const { data: sessionData } = await supabase.auth.getSession();
                    const jwt = sessionData.session?.access_token;
                    const headers: HeadersInit = { "Content-Type": "application/json" };
                    if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
                    const country = typeof window !== 'undefined' ? (localStorage.getItem('country') || 'it') : 'it';
                    await fetch(`/api/baptism/seed?country=${encodeURIComponent(country)}`, { method: "POST", headers });
                    // Ricarica categorie e righe dopo il seed
                    setCategoriesMap(resolveCategories());
                    await fetchBudgetIdeas();
                  } finally {
                    setSaving(false);
                  }
                }}
                title="Crea categorie e sottocategorie Battesimo per l'evento corrente"
              >
                Applica Template Battesimo
              </button>
            )}
            {eventType === "baptism" && (
              <button
                className="px-6 py-2 bg-[#2563eb] text-white rounded font-bold"
                onClick={suggestBaptismAmounts}
                title="Suggerisci importi per categoria in base alle percentuali Battesimo"
              >
                Suggerisci importi (Battesimo)
              </button>
            )}
            {eventType === "graduation" && (
              <button
                className="px-6 py-2 bg-[#2563eb] text-white rounded font-bold"
                onClick={suggestGraduationAmounts}
                title="Suggerisci importi per categoria in base alle percentuali Laurea"
              >
                Suggerisci importi (Laurea)
              </button>
            )}
            {eventType === "confirmation" && (
              <button
                className="px-6 py-2 bg-[#2563eb] text-white rounded font-bold"
                onClick={suggestConfirmationAmounts}
                title="Suggerisci importi per categoria in base alle percentuali Cresima"
              >
                Suggerisci importi (Cresima)
              </button>
            )}
            {eventType === "communion" && (
              <button
                className="px-6 py-2 bg-[#2563eb] text-white rounded font-bold"
                onClick={suggestCommunionAmounts}
                title="Suggerisci importi per categoria in base alle percentuali Comunione"
              >
                Suggerisci importi (Comunione)
              </button>
            )}
            {eventType === "eighteenth" && (
              <button
                className="px-6 py-2 bg-[#2563eb] text-white rounded font-bold"
                onClick={suggestEighteenthAmounts}
                title="Suggerisci importi per categoria in base alle percentuali Diciottesimo"
              >
                Suggerisci importi (Diciottesimo)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

