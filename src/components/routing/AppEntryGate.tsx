"use client";

import { getOnboardingStatus } from "@/lib/onboardingClient";
import { buildLocalizedPath } from "@/lib/localizedPath";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function AppEntryGate({ locale }: { locale?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const resolveDestination = useCallback(async () => {
    setError(null);
    try {
      const status = await getOnboardingStatus();
      const destination =
        status.kind === "anonymous"
          ? "/welcome"
          : status.kind === "complete"
            ? "/dashboard"
            : "/wizard";
      router.replace(buildLocalizedPath(locale, destination));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossibile aprire l'app");
    }
  }, [locale, router]);

  useEffect(() => {
    let active = true;
    getOnboardingStatus()
      .then((status) => {
        if (!active) return;
        const destination =
          status.kind === "anonymous"
            ? "/welcome"
            : status.kind === "complete"
              ? "/dashboard"
              : "/wizard";
        router.replace(buildLocalizedPath(locale, destination));
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Impossibile aprire l'app");
      });
    return () => {
      active = false;
    };
  }, [locale, router]);

  if (error) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">Impossibile verificare il tuo profilo</h1>
        <p className="max-w-md text-muted-fg">{error}</p>
        <button className="rounded-xl bg-primary px-5 py-3 font-semibold text-white" onClick={() => void resolveDestination()}>
          Riprova
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center" aria-live="polite">
      <p className="text-lg text-muted-fg">Caricamento del tuo spazio…</p>
    </main>
  );
}
