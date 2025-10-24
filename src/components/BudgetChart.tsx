"use client";

import { useMemo } from "react";

type BudgetChartProps = {
  totalBudget: number;
  spentAmount: number;
  className?: string;
};

export default function BudgetChart({ totalBudget, spentAmount, className = "" }: BudgetChartProps) {
  const percentage = totalBudget > 0 ? Math.min(100, (spentAmount / totalBudget) * 100) : 0;
  const remaining = Math.max(0, totalBudget - spentAmount);

  // Calcola l'angolo per il grafico a torta
  const spentAngle = (percentage / 100) * 360;
  
  // Colore in base allo stato
  const color = useMemo(() => {
    if (percentage < 70) return "#A6B5A0"; // Verde salvia - tutto ok
    if (percentage < 90) return "#f59e0b"; // Giallo - attenzione
    return "#dc2626"; // Rosso - fuori budget
  }, [percentage]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Grafico a torta SVG */}
      <div className="relative w-48 h-48 mb-4">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {/* Cerchio sfondo */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#E8E0D6"
            strokeWidth="20"
          />
          
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
          <div className="text-xs text-gray-500 font-medium">del budget</div>
        </div>
      </div>

      {/* Legenda */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="text-sm font-medium text-gray-700">Speso</span>
          </div>
          <span className="text-sm font-bold text-gray-800">
            € {spentAmount.toLocaleString("it-IT")}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E8E0D6]"></div>
            <span className="text-sm font-medium text-gray-700">Restante</span>
          </div>
          <span className="text-sm font-bold text-gray-800">
            € {remaining.toLocaleString("it-IT")}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#EAD9D4]/20 to-[#A6B5A0]/20 rounded-lg border-2 border-[#A6B5A0]">
          <span className="text-sm font-bold text-gray-800">Budget Totale</span>
          <span className="text-lg font-bold text-[#A6B5A0]">
            € {totalBudget.toLocaleString("it-IT")}
          </span>
        </div>
      </div>

      {/* Messaggio stato */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 italic">
          {percentage < 30 
            ? "💚 Ottimo inizio! Siete nei tempi"
            : percentage < 70
            ? "💛 Buon progresso, continuate così"
            : percentage < 90
            ? "🧡 Attenzione al budget, state per raggiungerlo"
            : percentage < 100
            ? "❤️ Quasi al limite, valutate bene le prossime spese"
            : "🚨 Budget superato! Rivedete le priorità"}
        </p>
      </div>
    </div>
  );
}
