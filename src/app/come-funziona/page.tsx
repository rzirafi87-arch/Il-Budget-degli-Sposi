"use client";

import { useTranslations } from "next-intl";

export default function ComeFunzionaPage() {
  const t = useTranslations("howItWorks");
  return (
    <section>
      <h2 className="font-serif text-2xl sm:text-3xl mb-4 sm:mb-6 font-bold">{t("title")}</h2>

      <div className="space-y-6">
        {/* Step 1 */}
        <div className="bg-linear-to-br from-pink-50 to-pink-100 rounded-2xl shadow-lg p-6 border-2 border-pink-300">
          <div className="flex items-start gap-4">
            <div className="bg-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold text-pink-700 mb-2">{t("steps.1.title")}</h3>
              <p className="text-gray-700">{t("steps.1.desc")}</p>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border-2 border-blue-300">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-700 mb-2">{t("steps.2.title")}</h3>
              <p className="text-gray-700">{t("steps.2.desc")}</p>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 border-2 border-green-300">
          <div className="flex items-start gap-4">
            <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-700 mb-2">{t("steps.3.title")}</h3>
              <p className="text-gray-700">{t("steps.3.desc")}</p>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6 border-2 border-purple-300">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shrink-0">
              4
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-700 mb-2">{t("steps.4.title")}</h3>
              <p className="text-gray-700">{t("steps.4.desc")}</p>
            </div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg p-6 border-2 border-orange-300">
          <div className="flex items-start gap-4">
            <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shrink-0">
              5
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange-700 mb-2">{t("steps.5.title")}</h3>
              <p className="text-gray-700">{t("steps.5.desc")}</p>
            </div>
          </div>
        </div>

        {/* Step 6 */}
        <div className="bg-linear-to-br from-[#A3B59D]/20 to-[#A3B59D]/40 rounded-2xl shadow-lg p-6 border-2 border-[#A3B59D]">
          <div className="flex items-start gap-4">
            <div className="bg-[#A3B59D] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shrink-0">
              6
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#8a9d84] mb-2">{t("steps.6.title")}</h3>
              <p className="text-gray-700">{t("steps.6.desc")}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-linear-to-r from-[#A3B59D] to-[#8a9d84] rounded-2xl shadow-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">{t("cta.title")}</h3>
          <p className="text-white/90 mb-6">{t("cta.subtitle")}</p>
          <a
            href="/auth"
            className="inline-block bg-white text-[#A3B59D] px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all active:scale-95"
          >
            {t("cta.button")}
          </a>
        </div>
      </div>
    </section>
  );
}
