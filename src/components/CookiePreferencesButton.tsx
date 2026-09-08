"use client";

import { COOKIE_PREFERENCES_EVENT } from "@/components/ConsentAwareAnalytics";

export default function CookiePreferencesButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT))}
    >
      Preferenze cookie
    </button>
  );
}
