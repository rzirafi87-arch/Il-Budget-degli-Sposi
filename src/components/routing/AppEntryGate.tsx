"use client";

import { getOnboardingStatus, OnboardingError } from "@/lib/onboardingClient";
import { buildLocalizedPath } from "@/lib/localizedPath";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

export default function AppEntryGate({ locale }: { locale?: string }) {
  const router = useRouter();
  const t = useTranslations("runtimeUi.routing");
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
      setError(cause instanceof OnboardingError ? cause.code : "APP_ENTRY_FAILED");
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
        if (active) setError(cause instanceof OnboardingError ? cause.code : "APP_ENTRY_FAILED");
      });
    return () => {
      active = false;
    };
  }, [locale, router]);

  if (error) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">{t("profileCheckFailed")}</h1>
        <p className="max-w-md text-muted-fg">{t(`errors.${error}`)}</p>
        <button className="rounded-xl bg-primary px-5 py-3 font-semibold text-white" onClick={() => void resolveDestination()}>
          {t("retry")}
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center" aria-live="polite">
      <p className="text-lg text-muted-fg">{t("loadingSpace")}</p>
    </main>
  );
}
