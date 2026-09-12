"use client";

import { formatCurrency } from "@/lib/locale";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

type BudgetChartProps = {
  totalBudget: number;
  spentAmount: number;
  className?: string;
};

export default function BudgetChart({ totalBudget, spentAmount, className = "" }: BudgetChartProps) {
  const t = useTranslations("budgetRuntime.chart");
  const percentage = totalBudget > 0 ? Math.min(100, (spentAmount / totalBudget) * 100) : 0;
  const remaining = Math.max(0, totalBudget - spentAmount);

  // Calcola l'angolo per il grafico a torta
  const spentAngle = (percentage / 100) * 360;
  
  // Colore in base allo stato
  const color = useMemo(() => {
    if (percentage < 70) return "var(--status-positive)"; // Verde salvia - tutto ok
    if (percentage < 90) return "var(--status-warning)"; // Giallo - attenzione
    return "var(--status-critical)"; // Rosso - fuori budget
  }, [percentage]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Grafico a torta SVG */}
      <div className="relative w-48 h-48 mb-4">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {/* Cerchio sfondo */}
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--chart-neutral)" strokeWidth="20" />
          
          {/* Cerchio progresso */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        
        {/* Percentuale al centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold" style={{ color }}>
            {Math.round(percentage)}%
          </div>
          <div className="text-xs text-gray-500 font-medium">{t("ofBudget")}</div>
        </div>
      </div>

      {/* Legenda */}
      <div className="w-full space-y-2">
        <div
          className="flex items-center justify-between p-3 bg-white rounded-lg border"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="text-sm font-medium text-gray-700">{t("spent")}</span>
          </div>
          <span className="text-sm font-bold text-gray-800">{formatCurrency(spentAmount)}</span>
        </div>

        <div
          className="flex items-center justify-between p-3 bg-white rounded-lg border"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--chart-neutral)" }}></div>
            <span className="text-sm font-medium text-gray-700">{t("remaining")}</span>
          </div>
          <span className="text-sm font-bold text-gray-800">{formatCurrency(remaining)}</span>
        </div>

        <div
          className="flex items-center justify-between p-3 rounded-lg border-2"
          style={{
            background: "linear-gradient(135deg, rgba(200, 115, 115, 0.12) 0%, rgba(78, 134, 102, 0.16) 100%)",
            borderColor: "var(--accent-sage-500)",
          }}
        >
          <span className="text-sm font-bold text-gray-800">{t("total")}</span>
          <span className="text-lg font-bold" style={{ color: "var(--color-sage)" }}>
            {formatCurrency(totalBudget)}
          </span>
        </div>
      </div>

      {/* Messaggio stato */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 italic">
          {percentage < 30 
            ? t("status.start")
            : percentage < 70
            ? t("status.progress")
            : percentage < 90
            ? t("status.warning")
            : percentage < 100
            ? t("status.limit")
            : t("status.exceeded")}
        </p>
      </div>
    </div>
  );
}
