"use client";

import { COOKIE_PREFERENCES_EVENT } from "@/components/ConsentAwareAnalytics";
import { useTranslations } from "next-intl";

export default function CookiePreferencesButton({ className = "" }: { className?: string }) {
  const t = useTranslations("milestone9.shared");
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT))}
    >
      {t("cookiePreferences")}
    </button>
  );
}
