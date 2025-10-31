import React from "react";

type Props = {
  brideBudget: number;
  groomBudget: number;
  totalBudget: number;
  weddingDate: string;
  countryState: string;
  setBrideBudget: (n: number) => void;
  setGroomBudget: (n: number) => void;
  setWeddingDate: (d: string) => void;
};

export default function BudgetSummary({ brideBudget, groomBudget, totalBudget, weddingDate, countryState, setBrideBudget, setGroomBudget, setWeddingDate }: Props) {
  return (
    <div className="mb-6 sm:mb-8 p-5 sm:p-6 rounded-2xl border-2 border-gray-200 bg-white shadow-md">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">💐 Budget Sposa {countryState === "mx" ? "(MXN)" : "(€)"}</label>
          <input
            type="number"
            className="border-2 border-pink-300 rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
            value={brideBudget || ""}
            onChange={e => setBrideBudget(Number(e.target.value) || 0)}
            placeholder={countryState === "mx" ? "Ej. 10000" : "Es. 10000"}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">🤵 Budget Sposo {countryState === "mx" ? "(MXN)" : "(€)"}</label>
          <input
            type="number"
            className="border-2 border-blue-300 rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            value={groomBudget || ""}
            onChange={e => setGroomBudget(Number(e.target.value) || 0)}
            placeholder={countryState === "mx" ? "Ej. 10000" : "Es. 10000"}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">💑 Budget Totale {countryState === "mx" ? "(MXN)" : "(€)"}</label>
          <input
            type="number"
            className="border-2 border-gray-300 bg-gray-100 rounded-lg px-4 py-3 w-full font-bold text-base"
            value={totalBudget || ""}
            readOnly
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">📅 Data Matrimonio</label>
          <input
            type="date"
            className="border-2 border-[#A3B59D] rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D]"
            value={weddingDate || ""}
            onChange={e => setWeddingDate(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-2">
        <a href="/idea-di-budget" className="text-sm font-semibold underline text-[#A3B59D] hover:text-[#8a9d84]">💡 Compila l'Idea di Budget</a>
      </div>
    </div>
  );
}
