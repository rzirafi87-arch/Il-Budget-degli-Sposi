"use client";

import { getOnboardingStatus } from "@/lib/onboardingClient";
import { buildLocalizedPath } from "@/lib/localizedPath";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingAuthRedirect({ locale }: { locale: string }) {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    getOnboardingStatus().then((status) => {
      if (!active || status.kind === "anonymous") return;
      router.replace(buildLocalizedPath(locale, status.kind === "complete" ? "/dashboard" : "/wizard"));
    }).catch(() => {
      // La landing resta disponibile se il controllo sessione non è raggiungibile.
    });
    return () => { active = false; };
  }, [locale, router]);

  return null;
}
