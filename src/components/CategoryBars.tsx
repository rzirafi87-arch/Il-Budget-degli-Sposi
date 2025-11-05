"use client";
import { formatCurrency } from "@/lib/locale";

type CategorySpend = {
  category: string;
  amount: number;
  percentage: number;
};

type CategoryBarsProps = {
  categories: CategorySpend[];
  totalBudget: number;
  className?: string;
};

export default function CategoryBars({ categories, totalBudget, className = "" }: CategoryBarsProps) {
  // Ordina per importo decrescente
  const sortedCategories = [...categories].sort((a, b) => b.amount - a.amount).slice(0, 8); // Top 8

  const getColor = (index: number) => {
    const colors = [
      "#3f7055", // Sage deep
      "#c87373", // Rose clay
      "#d18a3c", // Amber
      "#4e8666", // Sage accent
      "#7a6a5c", // Warm taupe
      "#8fb49b", // Sage light
      "#b98f6f", // Terracotta
      "#a96c7a", // Dusty rose
    ];
    return colors[index % colors.length];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        📊 Spese per Categoria (Top 8)
      </h3>

      {sortedCategories.length === 0 ? (
        <div className="text-center py-8 text-gray-500 italic">
          Nessuna spesa registrata ancora
        </div>
      ) : (
        sortedCategories.map((cat, index) => (
          <div key={cat.category} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 truncate flex-1">
                {cat.category}
              </span>
              <span className="font-bold text-gray-800 ml-3">
                {formatCurrency(cat.amount)}
              </span>
            </div>
            
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                style={{
                  width: `${Math.min(100, cat.percentage)}%`,
                  backgroundColor: getColor(index),
                }}
              >
                {cat.percentage > 15 && (
                  <span className="text-[10px] font-bold text-white">
                    {Math.round(cat.percentage)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
