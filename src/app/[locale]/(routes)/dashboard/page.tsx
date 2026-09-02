"use client";

import BudgetFocusHint, { BudgetFocus } from "@/components/dashboard/BudgetFocusHint";
import BudgetItemsSection from "@/components/dashboard/BudgetItemsSection";
import BudgetSummary from "@/components/dashboard/BudgetSummary";
import ChecklistSection from "@/components/dashboard/ChecklistSection";
import LocalizedWeddingSection, { LocalizedWeddingData } from "@/components/dashboard/LocalizedWeddingSection";
import TraditionsSection from "@/components/dashboard/TraditionsSection";
import Page from "@/components/layout/Page";
import { AppButton, AppButtonLink } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import PageInfoNote from "@/components/PageInfoNote";
import { getOnboardingStatus } from "@/lib/onboardingClient";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { buildLocalizedPath } from "@/lib/localizedPath";
import { useLocale } from "next-intl";
import { Church, FileText, Landmark, LayoutDashboard, Lightbulb, Plane, RotateCw, Save, Sparkles, Video } from "lucide-react";
import { useRouter } from "next/navigation";

import { useEffect, useMemo, useState } from "react";

// Inline type definitions for local state
type BudgetItem = { name: string; amount?: number };
type ChecklistModule = { module_name: string; is_required: boolean };
type Tradition = { name: string; description: string };
type PlanningSelections = { church: { churches: { name: string } | null } | null; locations: Array<{ location_role: string; locations: { name: string } | null }> };


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
  const [planningSelections, setPlanningSelections] = useState<PlanningSelections>({ church: null, locations: [] });

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
        // UI locale is authoritative for presentation. Event/invitation language is separate event data.
        const language = locale || storedLanguage || "it";
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

        if (isWedding && accessToken) {
          try {
            const res = await fetch("/api/my/planning-selections", { headers, cache: "no-store" });
            const json = await res.json();
            if (active && res.ok) setPlanningSelections({ church: json.church || null, locations: json.locations || [] });
          } catch { /* The catalog cards remain useful as navigation fallback. */ }
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
      <AppCard className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center" padding="lg">
        <span className="app-page-header__icon"><LayoutDashboard size={24} aria-hidden /></span>
        <h1 className="text-xl font-semibold">Impossibile caricare la Dashboard</h1>
        <p className="max-w-md text-muted-fg">{routeError}</p>
        <AppButton onClick={() => window.location.reload()}>
          <RotateCw size={18} aria-hidden />
          Riprova
        </AppButton>
      </AppCard>
    );
  }

  if (!isReady) {
    return <LoadingState label="Caricamento Dashboard" cards={3} />;
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Il tuo evento"
        title="Dashboard"
        description="Budget, attività e prossimi passi: tutto ciò che serve per organizzare con serenità."
        icon={<LayoutDashboard size={24} aria-hidden />}
      />

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

      {isWedding && <section className="mb-8 grid gap-4 md:grid-cols-2" aria-label="Scelte cerimonia e ricevimento">
        <AppCard padding="md"><div className="flex items-start gap-3"><span className="app-page-header__icon"><Church size={21} aria-hidden /></span><div className="flex-1"><p className="app-eyebrow">Cerimonia</p><h2 className="text-lg">{planningSelections.church?.churches?.name || "Chiesa ancora da scegliere"}</h2><AppButtonLink href={`/${locale}/chiese`} variant="secondary" className="mt-3">Apri Chiese</AppButtonLink></div></div></AppCard>
        <AppCard padding="md"><div className="flex items-start gap-3"><span className="app-page-header__icon"><Landmark size={21} aria-hidden /></span><div className="flex-1"><p className="app-eyebrow">Ricevimento</p><h2 className="text-lg">{planningSelections.locations.find((item) => item.location_role === "reception")?.locations?.name || "Location ancora da scegliere"}</h2><AppButtonLink href={`/${locale}/location`} variant="secondary" className="mt-3">Apri Location</AppButtonLink></div></div></AppCard>
      </section>}

      {/* Azioni principali: Salva, PDF, Video */}
      <section className="mb-8 mt-5" aria-labelledby="dashboard-actions-title">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="app-eyebrow">Azioni rapide</p>
            <h2 id="dashboard-actions-title" className="text-xl">Continua l’organizzazione</h2>
          </div>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        <AppButton
          onClick={handleSaveBudget}
          loading={savingBudget}
          className="min-h-24 flex-col"
        >
          <Save size={22} aria-hidden />
          <span>Salva configurazione</span>
        </AppButton>
        <AppButton
          variant="outline"
          className="min-h-24 flex-col"
          disabled
          title="Funzione in preparazione"
        >
          <FileText size={22} aria-hidden />
          <span>Genera PDF</span>
          <span className="text-xs font-normal">Prossimamente</span>
        </AppButton>
        <AppButton
          variant="outline"
          className="min-h-24 flex-col"
          disabled
          title="Funzione in preparazione"
        >
          <Video size={22} aria-hidden />
          <span>Genera video</span>
          <span className="text-xs font-normal">Prossimamente</span>
        </AppButton>
        </div>
      </section>

      <BudgetItemsSection budgetItems={budgetItems} />

      {/* Idea di Budget quick access card */}
      <AppCard className="mb-4" padding="md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-start gap-3 text-center sm:text-left">
            <span className="app-page-header__icon"><Lightbulb size={22} aria-hidden /></span>
            <div>
              <h3 className="font-semibold text-lg">Idea di Budget</h3>
              <p className="text-sm text-muted-fg">Compila le voci e applicale al budget.</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center sm:mt-0">
            <AppButtonLink href={`/${locale}/idea-di-budget`} variant="secondary">Apri le idee</AppButtonLink>
          </div>
        </div>
      </AppCard>

      {/* Budget focus hint (wedding only) */}
      {isWedding && <BudgetFocusHint budget={budgetFocus} />}

      {/* Viaggio di Nozze quick access card - solo per Matrimonio */}
      {isWedding && (
        <AppCard className="mb-4" padding="md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-start gap-3 text-center sm:text-left">
              <span className="app-page-header__icon"><Plane size={22} aria-hidden /></span>
              <div>
                <h3 className="font-semibold text-lg">Viaggio di Nozze</h3>
                <p className="text-sm text-muted-fg">Consigli e idee per la luna di miele.</p>
              </div>
            </div>
            <div className="mt-4 flex justify-center sm:mt-0">
              <AppButtonLink href={`/${locale}/suggerimenti/viaggio-di-nozze`} variant="secondary">Esplora il viaggio</AppButtonLink>
            </div>
          </div>
        </AppCard>
      )}

      {/* Suggerimenti & Consigli quick access card */}
      <AppCard className="mb-6" padding="md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-start gap-3 text-center sm:text-left">
            <span className="app-page-header__icon"><Sparkles size={22} aria-hidden /></span>
            <div>
              <h3 className="font-semibold text-lg">Suggerimenti e consigli</h3>
              <p className="text-sm text-muted-fg">Idee utili in base alle tue scelte.</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center sm:mt-0">
            <AppButtonLink href={`/${locale}/suggerimenti`} variant="secondary">Scopri i consigli</AppButtonLink>
          </div>
        </div>
      </AppCard>

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
