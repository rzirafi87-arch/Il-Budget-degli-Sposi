import { formatCurrency } from "@/lib/locale";
import { useTranslations } from "next-intl";

type Item = { name: string; amount?: number };

export default function BudgetItemsSection({ budgetItems }: { budgetItems: Item[] }) {
  const t = useTranslations("budgetUi");
  if (!budgetItems?.length) return null;
  return (
    <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">{t("items.title")}</h3>
      <ul className="space-y-1">
        {budgetItems.map((it, idx) => (
          <li key={idx} className="flex justify-between text-sm">
            <span>{it.name}</span>
            {typeof it.amount === 'number' ? <span>{formatCurrency(it.amount)}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

