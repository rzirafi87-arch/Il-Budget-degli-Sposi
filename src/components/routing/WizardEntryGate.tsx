"use client";

import { getOnboardingStatus } from "@/lib/onboardingClient";
import { buildLocalizedPath } from "@/lib/localizedPath";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function WizardEntryGate({ locale }: { locale?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const resolveDestination = useCallback(async () => {
    setError(null);
    try {
      const status = await getOnboardingStatus();
      if (status.kind === "needs-onboarding") {
        localStorage.removeItem("country");
        localStorage.removeItem("eventType");
        document.cookie = "country=; Path=/; Max-Age=0; SameSite=Lax";
        document.cookie = "eventType=; Path=/; Max-Age=0; SameSite=Lax";
      }
      const destination =
        status.kind === "anonymous"
          ? "/auth"
          : status.kind === "complete"
            ? "/dashboard"
            : "/select-language";
      router.replace(buildLocalizedPath(locale, destination));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossibile avviare la configurazione");
    }
  }, [locale, router]);

  useEffect(() => {
    let active = true;
    getOnboardingStatus()
      .then((status) => {
        if (!active) return;
        if (status.kind === "needs-onboarding") {
          localStorage.removeItem("country");
          localStorage.removeItem("eventType");
          document.cookie = "country=; Path=/; Max-Age=0; SameSite=Lax";
          document.cookie = "eventType=; Path=/; Max-Age=0; SameSite=Lax";
        }
        const destination =
          status.kind === "anonymous"
            ? "/auth"
            : status.kind === "complete"
              ? "/dashboard"
              : "/select-language";
        router.replace(buildLocalizedPath(locale, destination));
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Impossibile avviare la configurazione");
      });
    return () => {
      active = false;
    };
  }, [locale, router]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center" aria-live="polite">
      {error ? (
        <>
          <h1 className="text-2xl font-semibold">Configurazione non disponibile</h1>
          <p className="max-w-md text-muted-fg">{error}</p>
          <button className="rounded-xl bg-primary px-5 py-3 font-semibold text-white" onClick={() => void resolveDestination()}>
            Riprova
          </button>
        </>
      ) : (
        <p className="text-lg text-muted-fg">Verifica della configurazione…</p>
      )}
    </main>
  );
}
