"use client";

import { AppCard } from "@/components/ui/AppCard";
import { currencyForCountry } from "@/lib/currency";
import { formatCurrency } from "@/lib/locale";
import { Calculator, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export default function BudgetAdvisor({ totalBudget, country }: { totalBudget: number; country: string }) {
  const t = useTranslations("branch47.budgetAdvisor");
  const [percentage, setPercentage] = useState<string>("10");
  const currency = currencyForCountry(country);
  const reserve = useMemo(() => totalBudget > 0 ? totalBudget * Math.min(50, Math.max(0, Number(percentage) || 0)) / 100 : null, [percentage, totalBudget]);
  const available = reserve === null ? null : Math.max(totalBudget - reserve, 0);
  const money = (value: number) => formatCurrency(value, currency, { maximumFractionDigits: 0 });
  return <AppCard className="mb-6" padding="md"><div className="flex items-start gap-3"><span className="app-page-header__icon"><Sparkles size={21} aria-hidden /></span><div className="min-w-0 flex-1"><p className="app-eyebrow">{t("eyebrow")}</p><h2 className="text-xl font-semibold">{t("title")}</h2>{totalBudget <= 0 ? <p className="mt-2 text-sm text-muted-fg">{t("empty")}</p> : <div className="mt-4 grid gap-3 sm:grid-cols-3"><label className="text-sm font-medium">{t("percentage")}<span className="relative mt-1 flex"><Calculator className="pointer-events-none absolute left-3 top-3 text-muted-fg" size={17} aria-hidden /><input className="min-h-11 w-full rounded-xl border border-border bg-bg pl-10 pr-3" type="number" min="0" max="50" inputMode="decimal" value={percentage} onChange={(e) => setPercentage(e.target.value)} /></span></label><div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-fg">{t("reserve")}</p><p className="text-lg font-semibold">{reserve === null ? "—" : money(reserve)}</p></div><div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-fg">{t("available")}</p><p className="text-lg font-semibold">{available === null ? "—" : money(available)}</p></div></div>}</div></div></AppCard>;
}
