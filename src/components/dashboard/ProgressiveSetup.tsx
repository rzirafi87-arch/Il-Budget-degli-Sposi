"use client";

import { AppButton, AppButtonLink } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { Check, Circle, ListChecks } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type EventProgress = { total_budget?: number | null; has_budget_items?: boolean; has_expenses?: boolean; has_saved_suppliers?: boolean; has_guests?: boolean; has_suppliers?: boolean };

export default function ProgressiveSetup() {
  const locale = useLocale();
  const t = useTranslations("branch54");
  const [event, setEvent] = useState<EventProgress | null>(null);
  const [error, setError] = useState<{ reference?: string } | null>(null);
  const [noEvent, setNoEvent] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
      const { data, error: sessionError } = await getBrowserClient().auth.getSession();
      const jwt = data.session?.access_token;
      if (sessionError || !jwt) throw new Error("SESSION_UNAVAILABLE");
      const response = await fetch("/api/event/resolve", { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" });
      const payload = await response.json() as { event?: EventProgress; status?: string; reference?: unknown };
      if (!response.ok) {
        if (active) setError({ reference: typeof payload.reference === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.reference) ? payload.reference : undefined });
        return;
      }
      if (payload.status === "NO_EVENT" || payload.status === "SELECTION_REQUIRED") {
        if (active) { setNoEvent(true); setError(null); }
        return;
      }
      if (!payload.event) throw new Error("EVENT_UNAVAILABLE");
      if (active) { setEvent(payload.event); setNoEvent(false); setError(null); }
      } catch { if (active) setError({}); }
    })();
    return () => { active = false; };
  }, [attempt]);
  const steps = [
    { done: Number(event?.total_budget || 0) > 0, label: t("budget"), href: `/${locale}/idea-di-budget` },
    { done: Boolean(event?.has_budget_items || event?.has_expenses || event?.has_saved_suppliers), label: t("firstValue"), href: `/${locale}/budget` },
    { done: Boolean(event?.has_guests), label: t("guests"), href: `/${locale}/invitati` },
    { done: Boolean(event?.has_suppliers), label: t("suppliers"), href: `/${locale}/fornitori` },
  ];
  if (error) return <AppCard className="mb-6" padding="md"><p role="alert">{t("loadError")}</p>{error.reference && <p className="break-all text-xs text-muted-fg">{t("reference", { id: error.reference })}</p>}<AppButton onClick={() => { setError(null); setAttempt(value => value + 1); }}>{t("retry")}</AppButton></AppCard>;
  // The route guard owns onboarding/event selection, which are successful states.
  if (noEvent) return null;
  if (!event) return <p role="status" className="mb-6">{t("loading")}</p>;
  const completed = steps.filter((step) => step.done).length;
  if (completed === steps.length) return null;
  return <AppCard className="mb-6 border-primary/30" padding="md">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0"><p className="app-eyebrow flex items-center gap-2"><ListChecks size={16} aria-hidden />{t("eyebrow")}</p><h2 className="text-xl font-semibold">{t("title", { completed, total: steps.length })}</h2><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={completed} aria-label={t("progress", { completed, total: steps.length })}><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(completed / steps.length) * 100}%` }} /></div></div>
      <ol className="grid min-w-0 gap-2 sm:grid-cols-2 lg:min-w-[30rem]">{steps.map((step) => <li key={step.label} className="flex min-w-0 items-center gap-2 text-sm">{step.done ? <Check className="shrink-0 text-emerald-700" size={17} aria-hidden /> : <Circle className="shrink-0 text-muted-fg" size={17} aria-hidden />}{step.done ? <span className="truncate text-muted-fg line-through">{step.label}</span> : <AppButtonLink href={step.href} variant="ghost" size="sm" className="min-h-11 justify-start whitespace-normal text-left">{step.label}</AppButtonLink>}</li>)}</ol>
    </div>
  </AppCard>;
}
