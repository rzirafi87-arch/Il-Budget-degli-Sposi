import { currencyForCountry } from "@/lib/currency";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

type Props = {
  brideBudget: number;
  groomBudget: number;
  totalBudget: number;
  weddingDate: string;
  countryState: string;
  import { currencyForCountry } from "@/lib/currency";
  import { useTranslations } from "next-intl";
  import Link from "next/link";
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
    const t = useTranslations("budgetUi");
    const dateLabel = eventType === 'baptism'
      ? t('summary.date.baptism')
      : eventType === 'eighteenth'
      ? t('summary.date.eighteenth')
      : eventType === 'graduation'
      ? t('summary.date.graduation')
      : eventType === 'confirmation'
      ? t('summary.date.confirmation')
      : t('summary.date.wedding');
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
                <label htmlFor="totalBudget" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('summary.total', { currency: currencyLabel })}
                </label>
                <input
                  id="totalBudget"
                  type="number"
                  aria-label={t('summary.total', { currency: currencyLabel })}
                  className="border-2 border-gray-300 rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D] focus:outline-none focus-visible:outline-2 focus-visible:outline-[#A3B59D]"
                  value={totalBudget || ""}
                  placeholder={t('summary.totalPlaceholder')}
                  onChange={e => {
                    const v = Number((e.target as HTMLInputElement).value) || 0;
                    setBrideBudget(v);
                    setGroomBudget(0);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('summary.contingency')}</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  className="border-2 border-gray-300 rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D]"
                  value={contingencyPct}
                  onChange={e => setContingencyPct(Number((e.target as HTMLInputElement).value) || 0)}
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{dateLabel}</label>
                <input
                  type="date"
                  className="border-2 border-[#A3B59D] rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D]"
                  value={weddingDate || ""}
                  onChange={e => setWeddingDate((e.target as HTMLInputElement).value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="sm:col-span-2">
                <label htmlFor="brideBudget" className="block text-sm font-medium text-gray-700 mb-2">{t('summary.bride', { currency: currencyLabel })}</label>
                <input
                  id="brideBudget"
                  type="number"
                  aria-label={t('summary.bride', { currency: currencyLabel })}
                  className="border-2 border-gray-300 rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D] focus:outline-none focus-visible:outline-2 focus-visible:outline-[#A3B59D]"
                  value={brideBudget || ""}
                  placeholder={t('summary.bridePlaceholder')}
                  onChange={e => setBrideBudget(Number((e.target as HTMLInputElement).value) || 0)}
                />
              </div>
              <div>
                <label htmlFor="groomBudget" className="block text-sm font-medium text-gray-700 mb-2">{t('summary.groom', { currency: currencyLabel })}</label>
                <input
                  id="groomBudget"
                  type="number"
                  aria-label={t('summary.groom', { currency: currencyLabel })}
                  className="border-2 border-gray-300 rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D] focus:outline-none focus-visible:outline-2 focus-visible:outline-[#A3B59D]"
                  value={groomBudget || ""}
                  placeholder={t('summary.groomPlaceholder')}
                  onChange={e => setGroomBudget(Number((e.target as HTMLInputElement).value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{dateLabel}</label>
                <input
                  type="date"
                  className="border-2 border-[#A3B59D] rounded-lg px-4 py-3 w-full text-base focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D]"
                  value={weddingDate || ""}
                  onChange={e => setWeddingDate((e.target as HTMLInputElement).value)}
                />
              </div>
            </>
          )}
        </div>
        <div className="mt-2">
          <Link href="/idea-di-budget" className="text-sm font-semibold underline text-[#A3B59D] hover:text-[#8a9d84]" aria-label={t('summary.ctaIdea')}>{t('summary.ctaIdea')}</Link>
        </div>
      </div>
    );
  }
  );
}
