"use client";

import { GoogleAnalytics } from "@/components/GoogleTracking";
import Link from "next/link";
import { useEffect, useState } from "react";

export const ANALYTICS_CONSENT_COOKIE = "analytics_consent";
export const COOKIE_PREFERENCES_EVENT = "open-cookie-preferences";

type Consent = "granted" | "denied" | null;

function readConsent(): Consent {
  const value = document.cookie.match(
    new RegExp("(?:^|; )" + ANALYTICS_CONSENT_COOKIE + "=([^;]+)")
  )?.[1];
  return value === "granted" || value === "denied" ? value : null;
}

function persistConsent(value: Exclude<Consent, null>) {
  document.cookie =
    `${ANALYTICS_CONSENT_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  window.dispatchEvent(new CustomEvent("analytics-consent-change", { detail: value }));
}

export default function ConsentAwareAnalytics({ gaId }: { gaId?: string }) {
  const [consent, setConsent] = useState<Consent>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setConsent(readConsent()), 0);
    const openPreferences = () => setPreferencesOpen(true);
    window.addEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
    };
  }, []);

  const choose = (value: Exclude<Consent, null>) => {
    persistConsent(value);
    setConsent(value);
    setPreferencesOpen(false);
    if (value === "denied") window.location.reload();
  };

  const showDialog = Boolean(gaId) && (consent === null || preferencesOpen);

  return (
    <>
      {gaId && consent === "granted" ? <GoogleAnalytics gaId={gaId} /> : null}
      {showDialog ? (
        <aside
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-xl rounded-xl border bg-white p-4 text-sm text-gray-900 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Preferenze cookie"
        >
          <p>
            Usiamo cookie tecnici necessari. Le statistiche opzionali partono soltanto
            dopo il consenso e puoi cambiare scelta in qualsiasi momento.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="app-button app-button-primary" onClick={() => choose("granted")}>
              Accetta statistiche
            </button>
            <button className="app-button app-button-ghost" onClick={() => choose("denied")}>
              Solo necessari
            </button>
            <Link className="app-button app-button-ghost" href="/it/cookie-policy">
              Cookie Policy
            </Link>
            {consent !== null ? (
              <button className="app-button app-button-ghost" onClick={() => setPreferencesOpen(false)}>
                Chiudi
              </button>
            ) : null}
          </div>
        </aside>
      ) : null}
    </>
  );
}
