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
import { getOnboardingStatus, OnboardingError } from "@/lib/onboardingClient";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { buildLocalizedPath } from "@/lib/localizedPath";
import { useLocale, useTranslations } from "next-intl";
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
  const t = useTranslations("runtimeUi.dashboard");
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
        setRouteError(cause instanceof OnboardingError ? cause.code : "DASHBOARD_LOAD_FAILED");
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
                name: String(it.name || it.item_name || it.title || t("fallbackItem")),
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
                module_name: String(m.module_name || m.name || m.title || t("fallbackActivity")),
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
                name: String(t.name || t.title || "TRADITION"),
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
        alert(t("authRequired"));
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
        throw new Error("DASHBOARD_BUDGET_SAVE_FAILED");
      }

      alert(t("budgetSaved"));
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      alert(t("budgetSaveFailed"));
    } finally {
      setSavingBudget(false);
    }
  }

  if (routeStatus === "error") {
    return (
      <AppCard className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center" padding="lg">
        <span className="app-page-header__icon"><LayoutDashboard size={24} aria-hidden /></span>
        <h1 className="text-xl font-semibold">{t("loadFailed")}</h1>
        <p className="max-w-md text-muted-fg">{t(`errors.${routeError || "DASHBOARD_LOAD_FAILED"}`)}</p>
        <AppButton onClick={() => window.location.reload()}>
          <RotateCw size={18} aria-hidden />
          {t("retry")}
        </AppButton>
      </AppCard>
    );
  }

  if (!isReady) {
    return <LoadingState label={t("loading")} cards={3} />;
  }

  return (
    <Page>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        icon={<LayoutDashboard size={24} aria-hidden />}
      />

      <PageInfoNote
        icon="📊"
        title={t("info.title")}
        description={t("info.description")}
        tips={[
          t("info.tips.budgetDate"), t("info.tips.split"), t("info.tips.customize"), t("info.tips.ideas")
        ]}
        eventTypeSpecific={{
          wedding: t("info.events.wedding"), baptism: t("info.events.baptism"), communion: t("info.events.communion"), confirmation: t("info.events.confirmation"), birthday: t("info.events.birthday"), eighteenth: t("info.events.eighteenth"), graduation: t("info.events.graduation")
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

      {isWedding && <section className="mb-8 grid gap-4 md:grid-cols-2" aria-label={t("planning.label")}>
        <AppCard padding="md"><div className="flex items-start gap-3"><span className="app-page-header__icon"><Church size={21} aria-hidden /></span><div className="flex-1"><p className="app-eyebrow">{t("planning.ceremony")}</p><h2 className="text-lg">{planningSelections.church?.churches?.name || t("planning.churchEmpty")}</h2><AppButtonLink href={`/${locale}/chiese`} variant="secondary" className="mt-3">{t("planning.openChurches")}</AppButtonLink></div></div></AppCard>
        <AppCard padding="md"><div className="flex items-start gap-3"><span className="app-page-header__icon"><Landmark size={21} aria-hidden /></span><div className="flex-1"><p className="app-eyebrow">{t("planning.reception")}</p><h2 className="text-lg">{planningSelections.locations.find((item) => item.location_role === "reception")?.locations?.name || t("planning.locationEmpty")}</h2><AppButtonLink href={`/${locale}/location`} variant="secondary" className="mt-3">{t("planning.openLocations")}</AppButtonLink></div></div></AppCard>
      </section>}

      {/* Azioni principali: Salva, PDF, Video */}
      <section className="mb-8 mt-5" aria-labelledby="dashboard-actions-title">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="app-eyebrow">{t("actions.eyebrow")}</p>
            <h2 id="dashboard-actions-title" className="text-xl">{t("actions.title")}</h2>
          </div>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        <AppButton
          onClick={handleSaveBudget}
          loading={savingBudget}
          className="min-h-24 flex-col"
        >
          <Save size={22} aria-hidden />
          <span>{t("actions.save")}</span>
        </AppButton>
        <AppButton
          variant="outline"
          className="min-h-24 flex-col"
          disabled
          title={t("actions.preparing")}
        >
          <FileText size={22} aria-hidden />
          <span>{t("actions.pdf")}</span>
          <span className="text-xs font-normal">{t("actions.comingSoon")}</span>
        </AppButton>
        <AppButton
          variant="outline"
          className="min-h-24 flex-col"
          disabled
          title={t("actions.preparing")}
        >
          <Video size={22} aria-hidden />
          <span>{t("actions.video")}</span>
          <span className="text-xs font-normal">{t("actions.comingSoon")}</span>
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
              <h3 className="font-semibold text-lg">{t("idea.title")}</h3>
              <p className="text-sm text-muted-fg">{t("idea.description")}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center sm:mt-0">
            <AppButtonLink href={`/${locale}/idea-di-budget`} variant="secondary">{t("idea.open")}</AppButtonLink>
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
                <h3 className="font-semibold text-lg">{t("honeymoon.title")}</h3>
                <p className="text-sm text-muted-fg">{t("honeymoon.description")}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-center sm:mt-0">
              <AppButtonLink href={`/${locale}/suggerimenti/viaggio-di-nozze`} variant="secondary">{t("honeymoon.open")}</AppButtonLink>
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
              <h3 className="font-semibold text-lg">{t("suggestions.title")}</h3>
              <p className="text-sm text-muted-fg">{t("suggestions.description")}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center sm:mt-0">
            <AppButtonLink href={`/${locale}/suggerimenti`} variant="secondary">{t("suggestions.open")}</AppButtonLink>
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
