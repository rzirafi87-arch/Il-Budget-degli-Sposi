"use client";
import BudgetFocusHint, { BudgetFocus } from "@/components/dashboard/BudgetFocusHint";
import BudgetItemsSection from "@/components/dashboard/BudgetItemsSection";
import BudgetSummary from "@/components/dashboard/BudgetSummary";
import ChecklistSection from "@/components/dashboard/ChecklistSection";
import LocalizedWeddingSection, { LocalizedWeddingData } from "@/components/dashboard/LocalizedWeddingSection";
import TraditionsSection from "@/components/dashboard/TraditionsSection";
import PageInfoNote from "@/components/PageInfoNote";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useEffect, useMemo, useState } from "react";

type BudgetItem = { name: string; amount?: number };
type ChecklistModule = { module_name: string; is_required?: boolean };
type Tradition = { name: string; description: string };

export default function DashboardPage() {
  // All hooks at the top - before any conditional returns
  const [brideBudget, setBrideBudget] = useState<number>(0);
  const [groomBudget, setGroomBudget] = useState<number>(0);
  const [weddingDate, setWeddingDate] = useState<string>("");
  const [checkedChecklist, setCheckedChecklist] = useState<{ [k: string]: boolean }>({});
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [checklist, setChecklist] = useState<ChecklistModule[]>([]);
  const [traditions, setTraditions] = useState<Tradition[]>([]);
  const [localized, setLocalized] = useState<LocalizedWeddingData | null>(null);
  const [budgetFocus, setBudgetFocus] = useState<BudgetFocus | null>(null);

  // Read from localStorage with cookie fallback to make onboarding more robust
  const userLang = typeof window !== "undefined"
    ? (localStorage.getItem("language") || document.cookie.match(/(?:^|; )language=([^;]+)/)?.[1] || "")
    : "";
  const userCountry = typeof window !== "undefined"
    ? (localStorage.getItem("country") || document.cookie.match(/(?:^|; )country=([^;]+)/)?.[1] || "")
    : "";
  const userEventType = typeof window !== "undefined"
    ? (localStorage.getItem("eventType") || document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1] || "")
    : "";
  const isWedding = userEventType === "wedding";

  const isReady = useMemo(() => !!userLang && !!userCountry && !!userEventType, [userLang, userCountry, userEventType]);
  const totalBudget = (brideBudget || 0) + (groomBudget || 0);
  const countryState = userCountry;

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

  // Fetch dashboard data from API endpoints
  useEffect(() => {
    if (!isReady) return;
    
    let active = true;
    const supabase = getBrowserClient();
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const jwt = session.session?.access_token;
        const headers: Record<string, string> = jwt ? { Authorization: `Bearer ${jwt}` } : {};
        const country = userCountry || "it";

        // Ensure default event exists with correct type
        if (jwt) {
          try {
            await fetch("/api/event/ensure-default", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
              },
              body: JSON.stringify({ eventType: userEventType, country }),
            });
          } catch {
            // Ignore error
          }
        }

        // Budget Items
        try {
          const res = await fetch(`/api/budget-items?country=${encodeURIComponent(country)}`, { headers });
          const json = await res.json();
          if (active && Array.isArray(json?.items)) {
            setBudgetItems(
              json.items.map((it: Record<string, unknown>) => ({
                name: String(it.name || it.item_name || it.title || "Voce"),
                amount: typeof it.amount === "number" ? it.amount : undefined,
              }))
            );
          }
        } catch {
          // Ignore error
        }

        // Checklist modules
        try {
          const res = await fetch(`/api/checklist-modules?country=${encodeURIComponent(country)}`);
          const json = await res.json();
          if (active && Array.isArray(json?.modules)) {
            setChecklist(
              json.modules.map((m: Record<string, unknown>) => ({
                module_name: String(m.module_name || m.name || m.title || "Attività"),
                is_required: Boolean(m.is_required),
              }))
            );
          }
        } catch {
          // Ignore error
        }

        // Traditions
        try {
          const res = await fetch(`/api/traditions?country=${encodeURIComponent(country)}`);
          const json = await res.json();
          if (active && Array.isArray(json?.traditions)) {
            setTraditions(
              json.traditions.map((t: Record<string, unknown>) => ({
                name: String(t.name || t.title || "Tradizione"),
                description: String(t.description || t.desc || ""),
              }))
            );
          }
        } catch {
          // Ignore error
        }

        // Localized presets (wedding only)
        if (isWedding) {
          try {
            const res = await fetch(`/api/my/wedding/localized?country=${encodeURIComponent(country)}&event=matrimonio`, { headers });
            const json = await res.json();
            if (active && json?.ok && json?.data) {
              setLocalized(json.data as LocalizedWeddingData);
            }
          } catch {
            // ignore
          }

          // Budget focus (slim endpoint)
          try {
            const res = await fetch(`/api/my/wedding/budget-focus?country=${encodeURIComponent(country)}&event=matrimonio`, { headers });
            const json = await res.json();
            if (active && json?.ok && json?.budget) {
              setBudgetFocus(json.budget as BudgetFocus);
            }
          } catch {
            // ignore
          }
        } else {
          setLocalized(null);
          setBudgetFocus(null);
        }
      } catch {
        // ignore, keep minimal UI
      }
    })();
    return () => {
      active = false;
    };
  }, [userCountry, userEventType, isReady, isWedding]);

  if (!isReady) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center p-6">
        <h2 className="text-2xl font-serif font-bold">Seleziona lingua, nazione ed evento</h2>
          <p className="text-gray-800">Completa i passaggi iniziali per personalizzare l&apos;esperienza.</p>
        <div className="flex gap-3 flex-wrap justify-center">
          <a href="/select-language" className="px-4 py-2 rounded-lg border-2 border-[#A3B59D] text-[#2f4231] hover:bg-[#A3B59D] hover:text-white transition">Lingua</a>
          <a href="/select-country" className="px-4 py-2 rounded-lg border-2 border-[#A3B59D] text-[#2f4231] hover:bg-[#A3B59D] hover:text-white transition">Nazione</a>
          <a href="/select-event-type" className="px-4 py-2 rounded-lg border-2 border-[#A3B59D] text-[#2f4231] hover:bg-[#A3B59D] hover:text-white transition">Evento</a>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-serif font-bold mb-6">Dashboard</h1>

      <PageInfoNote
        icon="📊"
        title="Centro di Controllo del Tuo Evento"
        description="La Dashboard è il cuore dell'applicazione. Qui puoi gestire il budget complessivo, impostare i budget separati per sposa e sposo, e visualizzare tutte le categorie di spesa previste. Ogni modifica viene salvata automaticamente al tuo account."
        tips={[
          "Imposta prima il budget totale e la data dell'evento per attivare tutte le funzionalità",
          "Il budget si divide automaticamente in budget della sposa e dello sposo, con spese comuni condivise",
          "Tutte le categorie sono personalizzabili: aggiungi preventivi, conferma spese e traccia pagamenti",
          "Usa le 'Idee di Budget' per applicare template pre-compilati alle tue categorie"
        ]}
        eventTypeSpecific={{
          wedding: "Per il matrimonio, il budget è diviso tra sposa, sposo e spese comuni. Questo ti aiuta a tenere traccia di chi contribuisce a cosa.",
          baptism: "Per il battesimo, tutte le spese sono considerate comuni. Non c'è divisione tra budget individuali.",
          birthday: "Per il compleanno, puoi gestire il budget in modo flessibile, dividendo tra organizzatore e spese condivise.",
          graduation: "Per la laurea, il budget può essere gestito come spese comuni o diviso tra famiglia e laureato."
        }}
      />

      {/* Riepiloghi rapidi rimossi come richiesto */}

      <BudgetSummary
        brideBudget={brideBudget}
        groomBudget={groomBudget}
        totalBudget={totalBudget}
        weddingDate={weddingDate}
        countryState={countryState}
        eventType={userEventType}
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
              <p className="text-sm text-gray-900">Compila le voci e applicale al budget.</p>
          </div>
          <a href="/idea-di-budget" className="px-4 py-2 rounded-full text-white inline-flex justify-center text-center min-w-40" style={{ background: 'var(--color-sage)' }}>Apri Idea di Budget</a>
        </div>
      </div>

  {/* Budget focus hint (wedding only) */}
  {isWedding && <BudgetFocusHint budget={budgetFocus} />}

  {/* Timeline quick access card */}
      <div className="mb-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Timeline</h3>
              <p className="text-sm text-gray-900">Pianifica le attività mese per mese.</p>
            {typeof daysLeft === "number" && (
              <p className="text-sm text-gray-700 mt-1">
                {daysLeft > 0 ? `${daysLeft} giorni al grande giorno` : `Giorno del matrimonio`}
              </p>
            )}
          </div>
          <a href="/timeline" className="px-4 py-2 rounded-full text-white inline-flex justify-center text-center min-w-40" style={{ background: 'var(--color-sage)' }}>Apri Timeline</a>
        </div>
      </div>

      {/* Viaggio di Nozze quick access card - solo per Matrimonio */}
      {isWedding && (
        <div className="mb-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Viaggio di Nozze</h3>
                <p className="text-sm text-gray-900">Consigli e idee per la luna di miele.</p>
            </div>
            <a href="/suggerimenti/viaggio-di-nozze" className="px-4 py-2 rounded-full text-white inline-flex justify-center text-center min-w-40" style={{ background: 'var(--color-sage)' }}>Apri Viaggio di Nozze</a>
          </div>
        </div>
      )}

      {/* Suggerimenti &amp; Consigli quick access card */}
      <div className="mb-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Suggerimenti <span className="font-extrabold text-2xl align-middle">&amp;</span> Consigli</h3>
              <p className="text-sm text-gray-900">Idee utili in base alle tue scelte.</p>
          </div>
          <a href="/suggerimenti" className="px-4 py-2 rounded-full text-white inline-flex justify-center text-center min-w-40" style={{ background: 'var(--color-sage)' }}>Apri Suggerimenti</a>
        </div>
      </div>

      <ChecklistSection
        checklist={checklist}
        checkedChecklist={checkedChecklist}
        setCheckedChecklist={setCheckedChecklist}
      />
      {false && <div />}
      <TraditionsSection traditions={traditions} />
      {isWedding && <LocalizedWeddingSection data={localized} />}
      {/* SuggestionsList rimosso dalla dashboard, visibile solo nella pagina suggerimenti */}
    </main>
  );
}

// Named export for test convenience
export { DashboardPage };

