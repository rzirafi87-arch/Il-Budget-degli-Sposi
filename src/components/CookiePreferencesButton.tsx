"use client";

import { COOKIE_PREFERENCES_EVENT } from "@/components/ConsentAwareAnalytics";
import { useTranslations } from "next-intl";

export default function CookiePreferencesButton({ className = "" }: { className?: string }) {
  const t = useTranslations("milestone9.shared");
  // The preferences dialog exists only when a consent-gated tool is configured.
  // Without one, the button would open nothing.
  if (!process.env.NEXT_PUBLIC_GA_ID) return null;
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
