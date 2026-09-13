"use client";

import { AppCard } from "@/components/ui/AppCard";
import { CalendarDays, Coins, Compass, Plane } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export default function HoneymoonAdvisor() {
  const t = useTranslations("branch47.honeymoon");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("10");
  const [style, setStyle] = useState("balanced");
  const daily = useMemo(() => budget && Number(days) > 0 ? Number(budget) / Number(days) : null, [budget, days]);
  const tier = daily === null ? "empty" : daily < 180 ? "smart" : daily < 350 ? "balanced" : "premium";
  return <div className="space-y-5"><AppCard padding="lg"><div className="flex items-start gap-3"><span className="app-page-header__icon"><Plane size={22} aria-hidden /></span><div><p className="app-eyebrow">{t("eyebrow")}</p><h1 className="text-2xl font-semibold">{t("title")}</h1><p className="mt-1 text-sm text-muted-fg">{t("description")}</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><label className="text-sm font-medium">{t("budget")}<span className="relative mt-1 flex"><Coins className="pointer-events-none absolute left-3 top-3 text-muted-fg" size={18} aria-hidden /><input className="min-h-11 w-full rounded-xl border border-border bg-bg pl-10 pr-3" type="number" min="0" inputMode="decimal" value={budget} placeholder={t("budgetPlaceholder")} onChange={(e) => setBudget(e.target.value)} /></span></label><label className="text-sm font-medium">{t("days")}<span className="relative mt-1 flex"><CalendarDays className="pointer-events-none absolute left-3 top-3 text-muted-fg" size={18} aria-hidden /><input className="min-h-11 w-full rounded-xl border border-border bg-bg pl-10 pr-3" type="number" min="1" max="60" value={days} onChange={(e) => setDays(e.target.value)} /></span></label><label className="text-sm font-medium">{t("style")}<span className="relative mt-1 flex"><Compass className="pointer-events-none absolute left-3 top-3 text-muted-fg" size={18} aria-hidden /><select className="min-h-11 w-full rounded-xl border border-border bg-bg pl-10 pr-3" value={style} onChange={(e) => setStyle(e.target.value)}><option value="relax">{t("styles.relax")}</option><option value="balanced">{t("styles.balanced")}</option><option value="adventure">{t("styles.adventure")}</option></select></span></label></div></AppCard><AppCard padding="lg"><h2 className="text-xl font-semibold">{t("resultTitle")}</h2><p className="mt-2 text-muted-fg">{t(`results.${tier}`, { daily: daily === null ? "—" : Math.round(daily), style: t(`styles.${style}`) })}</p><ul className="mt-4 grid gap-3 sm:grid-cols-2">{["season", "documents", "buffer", "pace"].map((key) => <li key={key} className="rounded-xl bg-muted p-3 text-sm">{t(`tips.${key}`)}</li>)}</ul></AppCard></div>;
}
