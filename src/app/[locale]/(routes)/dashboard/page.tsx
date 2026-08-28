"use client";

import BudgetFocusHint, { BudgetFocus } from "@/components/dashboard/BudgetFocusHint";
import BudgetItemsSection from "@/components/dashboard/BudgetItemsSection";
import BudgetSummary from "@/components/dashboard/BudgetSummary";
import ChecklistSection from "@/components/dashboard/ChecklistSection";
import LocalizedWeddingSection, { LocalizedWeddingData } from "@/components/dashboard/LocalizedWeddingSection";
import TraditionsSection from "@/components/dashboard/TraditionsSection";
import Page from "@/components/layout/Page";
import PageInfoNote from "@/components/PageInfoNote";
import { getOnboardingStatus } from "@/lib/onboardingClient";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { buildLocalizedPath } from "@/lib/localizedPath";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { useEffect, useMemo, useState } from "react";

// Inline type definitions for local state
type BudgetItem = { name: string; amount?: number };
type ChecklistModule = { module_name: string; is_required: boolean };
type Tradition = { name: string; description: string };


export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const router = useRouter();
  const locale = useLocale();
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
  const [savingBudget, setSavingBudget] = useState(false);
  const [routeStatus, setRouteStatus] = useState<"loading" | "ready" | "redirecting" | "error">("loading");
  const [routeError, setRouteError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [clientPrefs, setClientPrefs] = useState({ language: "", country: "", eventType: "" });

  const userLang = clientPrefs.language;
  const userCountry = clientPrefs.country;
  const userEventType = clientPrefs.eventType;
  const normalizedEventType = userEventType || "";

  useEffect(() => {
    let active = true;

    const resolveAccess = async () => {
      try {
        const status = await getOnboardingStatus();
        if (!active) return;

        if (status.kind !== "complete") {
          setRouteStatus("redirecting");
          const destination = status.kind === "anonymous" ? "/auth" : "/wizard";
          router.replace(buildLocalizedPath(locale, destination));
          return;
        }

        const storedLanguage = localStorage.getItem("language") || document.cookie.match(/(?:^|; )language=([^;]+)/)?.[1];
        const storedCountry = localStorage.getItem("country") || document.cookie.match(/(?:^|; )country=([^;]+)/)?.[1];
        const storedEventType = localStorage.getItem("eventType") || document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
        const eventTypeAliases: Record<string, string> = {
          babyshower: "baby-shower",
          engagement: "engagement-party",
        };
        const eventType = eventTypeAliases[status.event.event_type || ""] || status.event.event_type || storedEventType || "wedding";
        const language = status.event.language || storedLanguage || locale || "it";
        const country = status.event.country || storedCountry || "it";

        localStorage.setItem("language", language);
        localStorage.setItem("country", country);
        localStorage.setItem("eventType", eventType);
        document.cookie = `language=${language}; Path=/; Max-Age=15552000; SameSite=Lax`;
        document.cookie = `country=${country}; Path=/; Max-Age=15552000; SameSite=Lax`;
        document.cookie = `eventType=${eventType}; Path=/; Max-Age=15552000; SameSite=Lax`;

        setClientPrefs({
          language,
          country,
          eventType,
        });
        setAccessToken(status.accessToken);
        setRouteStatus("ready");
      } catch (cause) {
        if (!active) return;
        setRouteError(cause instanceof Error ? cause.message : "Impossibile caricare la Dashboard");
        setRouteStatus("error");
      }
    };

    void resolveAccess();
    return () => {
      active = false;
    };
  }, [locale, router]);
  const effectiveEventType = normalizedEventType || "wedding";
  const isWedding = effectiveEventType === "wedding";
  // Locale corrente (mockato nei test). Fallback a 'it' se vuoto

  const isReady = useMemo(
    () => routeStatus === "ready" && !!userLang && !!userCountry && !!normalizedEventType,
    [routeStatus, userLang, userCountry, normalizedEventType]
  );
  const totalBudget = (brideBudget || 0) + (groomBudget || 0);
  const countryState = userCountry;

  // Fetch dashboard data from API endpoints
  useEffect(() => {
    if (!isReady) return;

    let active = true;
    (async () => {
      try {
        const headers: Record<string, string> = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
        const country = userCountry || "it";

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
            const res = await fetch(`/api/my/wedding/localized?country=${encodeURIComponent(country)}&event=wedding`, { headers });
            const json = await res.json();
            if (active && json?.ok && json?.data) {
              setLocalized(json.data as LocalizedWeddingData);
            }
          } catch {
            // ignore
          }

          // Budget focus (slim endpoint)
          try {
            const res = await fetch(`/api/my/wedding/budget-focus?country=${encodeURIComponent(country)}&event=wedding`, { headers });
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
  }, [accessToken, userCountry, effectiveEventType, isReady, isWedding]);

  // Funzione per salvare il budget in Idea di Budget
  async function handleSaveBudget() {
    setSavingBudget(true);
    try {
      const { data: sessionData } = await getBrowserClient().auth.getSession();
      const jwt = sessionData.session?.access_token;
      if (!jwt) {
        alert("Devi effettuare il login per salvare il budget");
        return;
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`
      };

      // Salva il budget usando l'endpoint esistente
      const budgetPayload = {
        totalBudget: totalBudget,
        brideBudget: brideBudget,
        groomBudget: groomBudget,
        weddingDate: weddingDate,
        rows: budgetItems.map(item => ({
          category: item.name.split(" - ")[0] || "Varie",
          subcategory: item.name.split(" - ")[1] || item.name,
          supplier: "",
          amount: item.amount || 0,
          spendType: "common",
          notes: ""
        }))
      };

      const response = await fetch("/api/my/dashboard", {
        method: "POST",
        headers,
        body: JSON.stringify(budgetPayload)
      });

      if (!response.ok) {
        throw new Error("Errore nel salvataggio del budget");
      }

      alert("✅ Budget salvato con successo! I dati sono ora disponibili in 'Idea di Budget'.");
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      alert("❌ Errore nel salvataggio del budget. Riprova.");
    } finally {
      setSavingBudget(false);
    }
  }

  if (routeStatus === "error") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-xl font-semibold">Impossibile caricare la Dashboard</p>
        <p className="text-muted-fg">{routeError}</p>
        <button className="rounded-xl bg-primary px-5 py-3 font-semibold text-white" onClick={() => window.location.reload()}>
          Riprova
        </button>
      </div>
    );
  }

  if (!isReady) {
    return <div className="min-h-[50vh] flex items-center justify-center text-xl">Caricamento…</div>;
  }

  return (
    <Page>
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-center">Dashboard</h1>
        {/* breadcrumb centrato */}
        <nav className="mt-1 flex justify-center text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li>Home</li>
            <li>›</li>
            <li className="font-medium">Dashboard</li>
          </ol>
        </nav>
      </header>

      <PageInfoNote
        icon="📊"
        title="Centro di Controllo del Tuo Evento"
        description="La Dashboard è il cuore dell'applicazione. Qui puoi gestire il budget complessivo, impostare i budget separati per i partecipanti e visualizzare tutte le categorie di spesa previste. Ogni modifica viene salvata automaticamente sul tuo account."
        tips={[
          "Imposta prima il budget totale e la data dell'evento per attivare tutte le funzionalità",
          "Il budget si divide automaticamente tra i partecipanti, con spese comuni condivise",
          "Tutte le categorie sono personalizzabili: aggiungi preventivi, conferma spese e traccia pagamenti",
          "Usa le 'Idee di Budget' per applicare template pre-compilati alle tue categorie"
        ]}
        eventTypeSpecific={{
          wedding: "Per il matrimonio, il budget è diviso tra sposa, sposo e spese comuni. Questo ti aiuta a tenere traccia di chi contribuisce a cosa.",
          baptism: "Per il battesimo, tutte le spese sono considerate comuni. Non c'è divisione tra budget individuali.",
          communion: "Per la comunione, tutte le spese sono considerate comuni. Budget familiare unificato per la celebrazione.",
          confirmation: "Per la cresima, il budget è gestito come spese comuni della famiglia.",
          birthday: "Per il compleanno, puoi gestire il budget in modo flessibile, dividendo tra organizzatore e spese condivise.",
          eighteenth: "Per il diciottesimo compleanno, il budget è gestito come evento unico. Perfetto per celebrare la maggiore età!",
          graduation: "Per la laurea, il budget può essere gestito come spese comuni o diviso tra famiglia e laureato."
        }}
      />

      <BudgetSummary
        brideBudget={brideBudget}
        groomBudget={groomBudget}
        totalBudget={totalBudget}
        weddingDate={weddingDate}
        countryState={countryState}
        eventType={effectiveEventType}
        setBrideBudget={setBrideBudget}
        setGroomBudget={setGroomBudget}
        setWeddingDate={setWeddingDate}
      />

      {/* Azioni principali: Salva, PDF, Video */}
      <div className="mx-auto mt-4 mb-6 grid w-full max-w-md grid-cols-1 gap-3 sm:max-w-none sm:grid-cols-3">
        <button
          onClick={handleSaveBudget}
          disabled={savingBudget}
          className="rounded-xl p-5 text-center shadow-sm hover:shadow transition bg-[#A3B59D] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="mx-auto mb-2 text-3xl">💾</div>
          <div className="font-semibold">Salva</div>
          <div className="text-xs text-muted-foreground">Configurazione</div>
        </button>
        <button
          className="rounded-xl p-5 text-center shadow-sm hover:shadow transition"
          // TODO: implement PDF generation handler
        >
          <div className="mx-auto mb-2 text-3xl">📄</div>
          <div className="font-semibold">Genera</div>
          <div className="text-xs text-muted-foreground">PDF</div>
        </button>
        <button
          className="rounded-xl p-5 text-center shadow-sm hover:shadow transition"
          // TODO: implement Video generation handler
        >
          <div className="mx-auto mb-2 text-3xl">🎬</div>
          <div className="font-semibold">Genera</div>
          <div className="text-xs text-muted-foreground">Video</div>
        </button>
      </div>

      <BudgetItemsSection budgetItems={budgetItems} />

      {/* Idea di Budget quick access card */}
      <div className="mb-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-lg text-center sm:text-left">Idea di Budget</h3>
            <p className="text-sm text-gray-900">Compila le voci e applicale al budget.</p>
          </div>
          <div className="mt-4 flex justify-center sm:mt-0">
            <Link
              href={`/${locale}/idea-di-budget`}
              className="inline-flex max-w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm whitespace-nowrap break-keep bg-[#A3B59D] text-white"
            >
              💡 Vai a Idea di Budget
            </Link>
          </div>
        </div>
      </div>

      {/* Budget focus hint (wedding only) */}
      {isWedding && <BudgetFocusHint budget={budgetFocus} />}

      {/* Viaggio di Nozze quick access card - solo per Matrimonio */}
      {isWedding && (
        <div className="mb-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-lg text-center sm:text-left">Viaggio di Nozze</h3>
              <p className="text-sm text-gray-900">Consigli e idee per la luna di miele.</p>
            </div>
            <div className="mt-4 flex justify-center sm:mt-0">
              <Link href={`/${locale}/suggerimenti/viaggio-di-nozze`} className="inline-flex max-w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm whitespace-nowrap break-keep bg-[#A3B59D] text-white">
                🌍 Apri Viaggio di Nozze
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Suggerimenti & Consigli quick access card */}
      <div className="mb-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-lg text-center sm:text-left">Suggerimenti <span className="font-extrabold text-2xl align-middle">&</span> Consigli</h3>
            <p className="text-sm text-gray-900">Idee utili in base alle tue scelte.</p>
          </div>
          <div className="mt-4 flex justify-center sm:mt-0">
            <Link href={`/${locale}/suggerimenti`} className="inline-flex max-w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm whitespace-nowrap break-keep bg-[#A3B59D] text-white">
              💡 Apri Suggerimenti
            </Link>
          </div>
        </div>
      </div>

      <ChecklistSection
        checklist={checklist}
        checkedChecklist={checkedChecklist}
        setCheckedChecklist={setCheckedChecklist}
      />
      <TraditionsSection traditions={traditions} />
      {isWedding && <LocalizedWeddingSection data={localized} />}
      {/* Timeline e Agenda sono visibili solo nella pagina /timeline e nei preferiti */}
    </Page>
  );
}
