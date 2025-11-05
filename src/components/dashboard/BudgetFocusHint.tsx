"use client";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("budgetUi");
  if (!budget) return null;
  const entries = Object.entries(budget);
  if (entries.length === 0) return null;

  return (
    <div className="mb-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{t("focus.title")}</h3>
          <p className="text-sm text-gray-700">{t("focus.subtitle")}</p>
        </div>
      </div>
      <ul className="space-y-2 text-gray-900">
        {entries.map(([k, v]) => (
          <li key={k} className="flex items-center gap-3">
            <span className="w-48 capitalize">{labelForBudgetKey(t, k)}</span>
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

function labelForBudgetKey(t: ReturnType<typeof useTranslations>, key: string): string {
  switch (key) {
    case "catering":
      return t("focus.labels.catering");
    case "location":
      return t("focus.labels.location");
    case "attire":
      return t("focus.labels.attire");
    case "photo_video":
      return t("focus.labels.photo_video");
    case "decor":
      return t("focus.labels.decor");
    case "entertainment":
      return t("focus.labels.entertainment");
    case "stationery_gifts":
      return t("focus.labels.stationery_gifts");
    default:
      return key;
  }
}
