"use client";
import React, { useEffect, useMemo, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";
import BudgetSummary from "@/components/dashboard/BudgetSummary";
import BudgetItemsSection from "@/components/dashboard/BudgetItemsSection";
import ChecklistSection from "@/components/dashboard/ChecklistSection";
import TraditionsSection from "@/components/dashboard/TraditionsSection";
import SuggestionsList from "@/components/dashboard/SuggestionsList";

export default function DashboardPage() {
  const userLang = typeof window !== "undefined" ? (localStorage.getItem("language") || "") : "";
  const userCountry = typeof window !== "undefined" ? (localStorage.getItem("country") || "") : "";
  const userEventType = typeof window !== "undefined" ? (localStorage.getItem("eventType") || "") : "";

  const isReady = useMemo(() => !!userLang && !!userCountry && !!userEventType, [userLang, userCountry, userEventType]);

  if (!isReady) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center p-6">
        <h2 className="text-2xl font-serif font-bold">Seleziona lingua, nazione ed evento</h2>
        <p className="text-gray-600">Completa i passaggi iniziali per personalizzare l&apos;esperienza.</p>
        <div className="flex gap-3 flex-wrap justify-center">
          <a href="/select-language" className="px-4 py-2 rounded-lg border-2 border-[#A3B59D] text-[#2f4231] hover:bg-[#A3B59D] hover:text-white transition">Lingua</a>
          <a href="/select-country" className="px-4 py-2 rounded-lg border-2 border-[#A3B59D] text-[#2f4231] hover:bg-[#A3B59D] hover:text-white transition">Nazione</a>
          <a href="/select-event-type" className="px-4 py-2 rounded-lg border-2 border-[#A3B59D] text-[#2f4231] hover:bg-[#A3B59D] hover:text-white transition">Evento</a>
        </div>
      </div>
    );
  }

  // States used by integrated sections
  const [brideBudget, setBrideBudget] = useState<number>(0);
  const [groomBudget, setGroomBudget] = useState<number>(0);
  const totalBudget = (brideBudget || 0) + (groomBudget || 0);
  const [weddingDate, setWeddingDate] = useState<string>("");
  const countryState = userCountry;

  const [checkedChecklist, setCheckedChecklist] = useState<{ [k: string]: boolean }>({});

  // Data fetched from APIs (fallback to empty arrays)
  const [budgetItems, setBudgetItems] = useState<{ name: string; amount?: number }[]>([]);
  const [checklist, setChecklist] = useState<{ module_name: string; is_required?: boolean }[]>([]);
  // Fornitori rimossi dalla dashboard come richiesto
  const [traditions, setTraditions] = useState<{ name: string; description: string }[]>([]);

  const suggestions = [
    "Definisci il budget totale e le quote",
    "Blocca i fornitori principali con anticipo",
    "Tieni traccia delle spese effettive",
  ];

  // Fetch dashboard data from API endpoints
  useEffect(() => {
    let active = true;
    const supabase = getBrowserClient();
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const jwt = session.session?.access_token;
        const headers: Record<string, string> = jwt ? { Authorization: `Bearer ${jwt}` } : {};
        const country = userCountry || "it";

        // Budget Items
        try {
          const res = await fetch(`/api/budget-items?country=${encodeURIComponent(country)}`, { headers });
          const json = await res.json();
          if (active && Array.isArray(json?.items)) {
            setBudgetItems(
              json.items.map((it: any) => ({
                name: it.name || it.item_name || it.title || "Voce",
                amount: typeof it.amount === "number" ? it.amount : undefined,
              }))
            );
          }
        } catch {}

        // Checklist modules
        try {
          const res = await fetch(`/api/checklist-modules?country=${encodeURIComponent(country)}`);
          const json = await res.json();
          if (active && Array.isArray(json?.modules)) {
            setChecklist(
              json.modules.map((m: any) => ({
                module_name: m.module_name || m.name || m.title || "Attività",
                is_required: Boolean(m.is_required),
              }))
            );
          }
        } catch {}

        // Traditions
        try {
          const res = await fetch(`/api/traditions?country=${encodeURIComponent(country)}`);
          const json = await res.json();
          if (active && Array.isArray(json?.traditions)) {
            setTraditions(
              json.traditions.map((t: any) => ({
                name: t.name || t.title || "Tradizione",
                description: t.description || t.desc || "",
              }))
            );
          }
        } catch {}

        // Suppliers: non visualizzati in dashboard
      } catch {
        // ignore, keep minimal UI
      }
    })();
    return () => {
      active = false;
    };
  }, [userCountry]);

  function handleQuickChange(type: "language" | "country" | "eventType") {
    if (type === "language") window.location.href = "/select-language";
    if (type === "country") window.location.href = "/select-country";
    if (type === "eventType") window.location.href = "/select-event-type";
  }

  const daysLeft = useMemo(() => {
    if (!weddingDate) return null;
    try {
      const d = new Date(weddingDate);
      const today = new Date();
      const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff;
    } catch {
      return null;
    }
  }, [weddingDate]);

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-serif font-bold mb-6">Dashboard</h1>

      {/* Riepiloghi rapidi rimossi come richiesto */}

      <BudgetSummary
        brideBudget={brideBudget}
        groomBudget={groomBudget}
        totalBudget={totalBudget}
        weddingDate={weddingDate}
        countryState={countryState}
        setBrideBudget={setBrideBudget}
        setGroomBudget={setGroomBudget}
        setWeddingDate={setWeddingDate}
      />

  <BudgetItemsSection budgetItems={budgetItems} />

      {/* Idea di Budget quick access card */}
      <div className="mb-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Idea di Budget</h3>
            <p className="text-sm text-gray-600">Compila le voci e applicale al budget.</p>
          </div>
          <a href="/idea-di-budget" className="px-4 py-2 rounded-full text-white" style={{ background: 'var(--color-sage)' }}>Apri Idea di Budget</a>
        </div>
      </div>

      {/* Timeline quick access card */}
      <div className="mb-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Timeline</h3>
            <p className="text-sm text-gray-600">Pianifica le attività mese per mese.</p>
            {typeof daysLeft === "number" && (
              <p className="text-sm text-gray-700 mt-1">
                {daysLeft > 0 ? `${daysLeft} giorni al grande giorno` : `Giorno del matrimonio`}
              </p>
            )}
          </div>
          <a href="/timeline" className="px-4 py-2 rounded-full text-white" style={{ background: 'var(--color-sage)' }}>Apri Timeline</a>
        </div>
      </div>

      <ChecklistSection
        checklist={checklist}
        checkedChecklist={checkedChecklist}
        setCheckedChecklist={setCheckedChecklist}
      />
      {false && <div />}
      <TraditionsSection traditions={traditions} />
      <SuggestionsList suggestions={suggestions} />
    </main>
  );
}

// Named export for test convenience
export { DashboardPage };
