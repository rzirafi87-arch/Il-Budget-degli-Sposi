"use client";

import { LoadingState } from "@/components/ui/LoadingState";
import { getOnboardingStatus } from "@/lib/onboardingClient";
import {
  getEventTypeCapability,
  isModuleEnabled,
  moduleForPath,
  normalizeEventType,
} from "@/lib/eventTypeCapabilities";
import { locales } from "@/i18n/config";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

const UNGUARDED_PREFIXES = [
  "/auth",
  "/welcome",
  "/wizard",
  "/select-language",
  "/select-country",
  "/select-event-type",
  "/coming-soon",
];

function normalizePathname(pathname: string | null): string {
  if (!pathname) return "/";
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length && locales.includes(segments[0] as (typeof locales)[number])) {
    segments.shift();
  }
  return `/${segments.join("/")}` || "/";
}

export default function EventModuleGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const normalizedPath = useMemo(() => normalizePathname(pathname), [pathname]);
  const routeModule = useMemo(() => moduleForPath(normalizedPath), [normalizedPath]);
  const isUnguarded =
    normalizedPath === "/" ||
    UNGUARDED_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix)) ||
    !routeModule;
  const [verifiedPath, setVerifiedPath] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (isUnguarded || !routeModule) {
      return () => {
        active = false;
      };
    }

    void (async () => {
      try {
        const status = await getOnboardingStatus();
        if (!active) return;

        if (status.kind === "anonymous") {
          router.replace(`/${locale}/auth`);
          return;
        }
        if (status.kind === "needs-onboarding") {
          router.replace(`/${locale}/wizard`);
          return;
        }

        const eventType = normalizeEventType(status.event.event_type);
        const capability = getEventTypeCapability(eventType);
        try {
          localStorage.setItem("eventType", eventType);
          document.cookie = `eventType=${eventType}; Path=/; Max-Age=15552000; SameSite=Lax`;
          window.dispatchEvent(new CustomEvent("event-type-resolved", { detail: eventType }));
        } catch {
          // The authoritative DB value remains available in this execution.
        }

        if (capability.availabilityStatus !== "READY" || !isModuleEnabled(eventType, routeModule)) {
          router.replace(`/${locale}/coming-soon?legacy=1`);
          return;
        }

        setVerifiedPath(normalizedPath);
      } catch {
        if (!active) return;
        router.replace(`/${locale}/auth`);
      }
    })();

    return () => {
      active = false;
    };
  }, [isUnguarded, locale, normalizedPath, routeModule, router]);

  if (isUnguarded || !routeModule) {
    return <>{children}</>;
  }

  if (verifiedPath !== normalizedPath) {
    return <LoadingState label="Verifica disponibilità modulo" cards={2} />;
  }

  return <>{children}</>;
}
