"use client";

import { GoogleAnalytics } from "@/components/GoogleTracking";
import { useEffect, useState } from "react";

const COOKIE = "analytics_consent";

function readConsent() {
  return document.cookie.match(new RegExp("(?:^|; )" + COOKIE + "=([^;]+)"))?.[1] || null;
}

export default function ConsentAwareAnalytics({ gaId }: { gaId?: string }) {
  const [consent, setConsent] = useState<string | null>(null);
  useEffect(() => setConsent(readConsent()), []);
  if (!gaId) return null;
  if (consent === "granted") return <GoogleAnalytics gaId={gaId} />;
  if (consent === "denied") return null;
  return (
    <aside className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-xl rounded-xl border bg-white p-4 text-sm text-gray-900 shadow-xl" role="dialog" aria-label="Preferenze cookie">
      <p>Usiamo cookie tecnici necessari. Puoi scegliere se consentire statistiche anonime per migliorare il servizio.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="app-button app-button-primary" onClick={() => { document.cookie = `${COOKIE}=granted; Path=/; Max-Age=31536000; SameSite=Lax; Secure`; setConsent("granted"); }}>Accetta statistiche</button>
        <button className="app-button app-button-ghost" onClick={() => { document.cookie = `${COOKIE}=denied; Path=/; Max-Age=31536000; SameSite=Lax; Secure`; setConsent("denied"); }}>Solo necessari</button>
        <a className="app-button app-button-ghost" href="/it/cookie-policy">Cookie Policy</a>
      </div>
    </aside>
  );
}
