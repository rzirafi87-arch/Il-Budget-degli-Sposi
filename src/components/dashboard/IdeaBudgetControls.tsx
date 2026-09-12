"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  baseTotal: number; // Somma dei budget ipotizzati
};

export default function IdeaBudgetControls({ baseTotal }: Props) {
  const t = useTranslations("budgetRuntime.controls");
  const [currency, setCurrency] = useState<string>(() =>
    (typeof window !== "undefined" && localStorage.getItem("budgetIdea.currency")) || "EUR"
  );
  const [contingencyPct, setContingencyPct] = useState<number>(() => {
    const v = typeof window !== "undefined" ? Number(localStorage.getItem("budgetIdea.contingencyPct") || 0) : 0;
    return isFinite(v) ? v : 0;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("budgetIdea.currency", currency);
      localStorage.setItem("budgetIdea.contingencyPct", String(contingencyPct));
    }
  }, [currency, contingencyPct]);

  const extra = (baseTotal * (contingencyPct || 0)) / 100;
  const total = baseTotal + extra;

  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">{t("currency")}</label>
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-24 border rounded px-2 py-1"
            maxLength={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("contingency")}</label>
          <input
            type="number"
            min={0}
            max={50}
            value={contingencyPct}
            onChange={(e) => setContingencyPct(Number(e.target.value))}
            className="w-28 border rounded px-2 py-1"
          />
        </div>
        <div className="sm:col-span-2 text-sm text-gray-700">
          <div className="flex flex-wrap gap-4">
            <div><strong>{t("estimatedTotal")}</strong> {currency} {baseTotal.toLocaleString()}</div>
            <div><strong>{t("contingencyTotal")}</strong> {currency} {extra.toLocaleString()} ({contingencyPct}%)</div>
            <div><strong>{t("withContingency")}</strong> {currency} {total.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
