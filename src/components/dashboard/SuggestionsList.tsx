import Link from "next/link";
import { useTranslations } from "next-intl";

type Props = {
  suggestions: string[];
};

export default function SuggestionsList({ suggestions }: Props) {
  const t = useTranslations("runtimeUi.dashboard.suggestions");
  return (
    <div className="mb-6 p-4 rounded-xl bg-blue-50 border-l-4 border-blue-400 text-blue-900">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">{t("title")}</h3>
  <Link href="/suggerimenti" className="px-4 py-2 rounded-full text-white inline-flex justify-center text-center min-w-[160px]" style={{ background: 'var(--color-sage)' }}>{t("open")}</Link>
      </div>
      <ul className="list-disc ml-6">
        {suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
      </ul>
    </div>
  );
}
