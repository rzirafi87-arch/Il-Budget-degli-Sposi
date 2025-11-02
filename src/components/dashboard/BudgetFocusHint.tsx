"use client";

export type BudgetFocus = {
  catering?: number;
  location?: number;
  attire?: number;
  photo_video?: number;
  decor?: number;
  entertainment?: number;
  stationery_gifts?: number;
};

export default function BudgetFocusHint({ budget }: { budget: BudgetFocus | null }) {
  if (!budget) return null;
  const entries = Object.entries(budget);
  if (entries.length === 0) return null;

  return (
    <div className="mb-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">Budget consigliato (percentuali)</h3>
          <p className="text-sm text-gray-700">Distribuzione suggerita per le principali voci.</p>
        </div>
      </div>
      <ul className="space-y-2 text-gray-900">
        {entries.map(([k, v]) => (
          <li key={k} className="flex items-center gap-3">
            <span className="w-48 capitalize">{labelForBudgetKey(k)}</span>
            <div className="flex-1 h-3 bg-gray-100 rounded">
              <div className="h-3 rounded" style={{ width: `${Number(v || 0)}%`, background: "var(--color-sage)" }} />
            </div>
            <span className="w-12 text-right tabular-nums">{Number(v || 0).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function labelForBudgetKey(key: string): string {
  switch (key) {
    case "catering":
      return "Catering";
    case "location":
      return "Location";
    case "attire":
      return "Abiti";
    case "photo_video":
      return "Foto/Video";
    case "decor":
      return "Decor";
    case "entertainment":
      return "Intrattenimento";
    case "stationery_gifts":
      return "Stationery/Regali";
    default:
      return key;
  }
}
