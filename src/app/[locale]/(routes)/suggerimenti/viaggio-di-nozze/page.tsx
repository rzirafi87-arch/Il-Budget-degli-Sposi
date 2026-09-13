"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function ViaggioNozzePage() {
  const locale = useLocale();
  const t = useTranslations("milestone9.runtime.honeymoonTips");
  return (
    <section className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-4 flex justify-end">
        <Link href={`/${locale}/dashboard`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">{t("backDashboard")}</Link>
      </div>
      <h1 className="font-serif text-3xl mb-4 text-[#A3B59D] font-bold">{t("title")}</h1>
      <p className="text-gray-700 mb-6">{t("description")}</p>
      <ul className="list-disc ml-6 space-y-2 text-gray-800">
        <li>{t("tips.budget")}</li>
        <li>{t("tips.destinations")}</li>
        <li>{t("tips.documents")}</li>
        <li>{t("tips.activities")}</li>
      </ul>
    </section>
  );
}


