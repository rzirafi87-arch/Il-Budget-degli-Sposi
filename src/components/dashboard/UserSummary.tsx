"use client";
import { useTranslations } from "next-intl";

type Props = {
  userLang: string;
  userCountry: string;
  userEventType: string;
  onQuickChange: (type: "language" | "country" | "eventType") => void;
};

export default function UserSummary({ userLang, userCountry, userEventType, onQuickChange }: Props) {
  const t = useTranslations("runtimeUi.userSummary");
  return (
    <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 shadow-sm">
        <span className="text-xl" aria-hidden>🌐</span>
        <span className="font-semibold">{t("language")}</span>
        <span>{t.has(`languages.${userLang}`) ? t(`languages.${userLang}`) : userLang.toUpperCase()}</span>
        <button className="ml-2 rounded bg-[#A3B59D] px-2 py-1 text-xs text-white" onClick={() => onQuickChange("language")}>{t("change")}</button>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 shadow-sm">
        <span className="text-xl" aria-hidden>📍</span>
        <span className="font-semibold">{t("country")}</span>
        <span>{t.has(`countries.${userCountry}`) ? t(`countries.${userCountry}`) : userCountry.toUpperCase()}</span>
        <button className="ml-2 rounded bg-[#A3B59D] px-2 py-1 text-xs text-white" onClick={() => onQuickChange("country")}>{t("change")}</button>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 shadow-sm">
        <span className="text-xl" aria-hidden>🎉</span>
        <span className="font-semibold">{t("event")}</span>
        <span>{t.has(`events.${userEventType}`) ? t(`events.${userEventType}`) : t("events.other")}</span>
        <button className="ml-2 rounded bg-[#A3B59D] px-2 py-1 text-xs text-white" onClick={() => onQuickChange("eventType")}>{t("change")}</button>
      </div>
    </div>
  );
}
