"use client";

import { AppButtonLink } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { Check, Circle, ListChecks } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type EventProgress = { total_budget?: number | null; wedding_date?: string | null; couple_name?: string | null; has_guests?: boolean; has_suppliers?: boolean };

export default function ProgressiveSetup() {
  const locale = useLocale();
  const t = useTranslations("branch47.setup");
  const [event, setEvent] = useState<EventProgress | null>(null);
  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await getBrowserClient().auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) return;
      const response = await fetch("/api/event/resolve", { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" });
      const payload = response.ok ? await response.json() as { event?: EventProgress } : {};
      if (active) setEvent(payload.event || {});
    })();
    return () => { active = false; };
  }, []);
  const steps = useMemo(() => [
    { done: Boolean(event?.couple_name), label: t("details"), href: `/${locale}/profilo` },
    { done: Boolean(event?.wedding_date), label: t("date"), href: `/${locale}/dashboard` },
    { done: Number(event?.total_budget || 0) > 0, label: t("budget"), href: `/${locale}/idea-di-budget` },
    { done: Boolean(event?.has_guests), label: t("guests"), href: `/${locale}/invitati` },
    { done: Boolean(event?.has_suppliers), label: t("suppliers"), href: `/${locale}/fornitori` },
  ], [event, locale, t]);
  if (!event) return null;
  const completed = steps.filter((step) => step.done).length;
  if (completed === steps.length) return null;
  return <AppCard className="mb-6 border-primary/30" padding="md">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0"><p className="app-eyebrow flex items-center gap-2"><ListChecks size={16} aria-hidden />{t("eyebrow")}</p><h2 className="text-xl font-semibold">{t("title", { completed, total: steps.length })}</h2><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" aria-label={t("progress", { completed, total: steps.length })}><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(completed / steps.length) * 100}%` }} /></div></div>
      <ol className="grid min-w-0 gap-2 sm:grid-cols-2 lg:min-w-[30rem]">{steps.map((step) => <li key={step.label} className="flex min-w-0 items-center gap-2 text-sm">{step.done ? <Check className="shrink-0 text-emerald-700" size={17} aria-hidden /> : <Circle className="shrink-0 text-muted-fg" size={17} aria-hidden />}{step.done ? <span className="truncate text-muted-fg line-through">{step.label}</span> : <AppButtonLink href={step.href} variant="ghost" size="sm" className="min-h-9 justify-start truncate">{step.label}</AppButtonLink>}</li>)}</ol>
    </div>
  </AppCard>;
}
