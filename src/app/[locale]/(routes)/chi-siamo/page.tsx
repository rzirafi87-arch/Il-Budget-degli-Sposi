"use client";

import { BRAND_NAME } from "@/config/brand";
import { useTranslations } from "next-intl";

export default function ChiSiamoPage() {
  const t = useTranslations("about");
  return (
    <section>
      <h2 className="font-serif text-2xl sm:text-3xl mb-4 sm:mb-6 font-bold">{t("title")}</h2>

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-gray-200">
        <div className="prose prose-lg max-w-none">
          <h3 className="text-xl font-bold text-[#A3B59D] mb-4">🎉 {BRAND_NAME}</h3>
          <p className="text-gray-700 mb-4">{t("intro")}</p>

          <h3 className="text-xl font-bold text-[#A3B59D] mb-4 mt-8">🎯 {t("mission.title")}</h3>
          <p className="text-gray-700 mb-4">{t("mission.body")}</p>

          <h3 className="text-xl font-bold text-[#A3B59D] mb-4 mt-8">✨ {t("why.title")}</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>
              <strong>{t("why.points.free.title")}</strong> {t("why.points.free.desc")}
            </li>
            <li>
              <strong>{t("why.points.madeInItaly.title")}</strong> {t("why.points.madeInItaly.desc")}
            </li>
            <li>
              <strong>{t("why.points.privacy.title")}</strong> {t("why.points.privacy.desc")}
            </li>
            <li>
              <strong>{t("why.points.database.title")}</strong> {t("why.points.database.desc")}
            </li>
            <li>
              <strong>{t("why.points.support.title")}</strong> {t("why.points.support.desc")}
            </li>
          </ul>

          <h3 className="text-xl font-bold text-[#A3B59D] mb-4 mt-8">📞 {t("contact.title")}</h3>
          <p className="text-gray-700 mb-4">{t("contact.body")}</p>
          <a
            href="https://wa.me/393001234567?text=Ciao!%20Vorrei%20informazioni%20su%20Il%20Budget%20degli%20Sposi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            💬 {t("contact.cta")}
          </a>
        </div>
      </div>
    </section>
  );
}
