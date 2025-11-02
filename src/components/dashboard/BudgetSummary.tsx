import { currencyForCountry } from "@/lib/currency";
import React from "react";

type Props = {
  brideBudget: number;
  groomBudget: number;
  totalBudget: number;
  weddingDate: string;
  countryState: string;
  eventType?: string;
  setBrideBudget: (n: number) => void;
  setGroomBudget: (n: number) => void;
  setWeddingDate: (d: string) => void;
};

export default function BudgetSummary({ brideBudget, groomBudget, totalBudget, weddingDate, countryState, eventType, setBrideBudget, setGroomBudget, setWeddingDate }: Props) {
  const dateLabel = eventType === 'baptism'
    ? 'Data Cerimonia'
    : eventType === 'eighteenth'
    ? 'Data Festa'
    : eventType === 'graduation'
    ? 'Data Laurea'
    : eventType === 'confirmation'
    ? 'Data Cresima'
    : 'Data Matrimonio';
  const currencyCode = currencyForCountry(countryState);
  const currencyLabel = `(${currencyCode})`;
  const isSingle = eventType === 'baptism' || eventType === 'graduation' || eventType === 'eighteenth' || eventType === 'confirmation';

  const [contingencyPct, setContingencyPct] = React.useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const v = Number(localStorage.getItem('budgetIdea.contingencyPct') || 0);
    return Number.isFinite(v) ? v : 0;
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('budgetIdea.contingencyPct', String(contingencyPct));
    }
  }, [contingencyPct]);
  return (
    <div className="mb-6 sm:mb-8 p-5 sm:p-6 rounded-2xl border-2 border-gray-200 bg-white shadow-md">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-4">
        {isSingle ? (
          <>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget Totale {currencyLabel}</label>
              <input
                type="number"
                className="border-2 border-gray-300 rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D]"
                value={totalBudget || ""}
                onChange={e => {
                  const v = Number(e.target.value) || 0;
                  // Store all in bride budget for compatibility; zero for groom
                  setBrideBudget(v);
                  setGroomBudget(0);
                }}
                placeholder={countryState === "mx" ? "Ej. 2000" : "Es. 2000"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imprevisti (%)</label>
              <input
                type="number"
                min={0}
                max={50}
                className="border-2 border-gray-300 rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D]"
                value={contingencyPct}
                onChange={e => setContingencyPct(Number(e.target.value) || 0)}
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{dateLabel}</label>
              <input
                type="date"
                className="border-2 border-[#A3B59D] rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D]"
                value={weddingDate || ""}
                onChange={e => setWeddingDate(e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget Sposa {currencyLabel}</label>
              <input
                type="number"
                className="border-2 border-pink-300 rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                value={brideBudget || ""}
                onChange={e => setBrideBudget(Number(e.target.value) || 0)}
                placeholder={countryState === "mx" ? "Ej. 10000" : "Es. 10000"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget Sposo {currencyLabel}</label>
              <input
                type="number"
                className="border-2 border-blue-300 rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                value={groomBudget || ""}
                onChange={e => setGroomBudget(Number(e.target.value) || 0)}
                placeholder={countryState === "mx" ? "Ej. 10000" : "Es. 10000"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget Totale {currencyLabel}</label>
              <input
                type="number"
                className="border-2 border-gray-300 bg-gray-100 rounded-lg px-4 py-3 w-full font-bold text-base"
                value={totalBudget || ""}
                readOnly
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{dateLabel}</label>
              <input
                type="date"
                className="border-2 border-[#A3B59D] rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D]"
                value={weddingDate || ""}
                onChange={e => setWeddingDate(e.target.value)}
              />
            </div>
          </>
        )}
      </div>
      <div className="mt-2">
        <a href="/idea-di-budget" className="text-sm font-semibold underline text-[#A3B59D] hover:text-[#8a9d84]">Compila l&apos;Idea di Budget</a>
      </div>
    </div>
  );
}
