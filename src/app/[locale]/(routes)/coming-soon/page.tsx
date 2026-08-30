"use client";

import EventAvailabilityNotice from "@/components/EventAvailabilityNotice";
import { AppButtonLink } from "@/components/ui/AppButton";
import { normalizeEventType } from "@/lib/eventTypeCapabilities";
import { useLocale } from "next-intl";
import { useSyncExternalStore } from "react";

const HOME_COPY = {
  it: "Torna alla Home",
  en: "Back to Home",
  es: "Volver al inicio",
} as const;

function readEventType() {
  if (typeof window === "undefined") return "wedding";
  try {
    const cookieEventType = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
    const storedEventType = localStorage.getItem("eventType");
    return normalizeEventType(cookieEventType || storedEventType || "wedding");
  } catch {
    return "wedding";
  }
}

function subscribeEventType(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("event-type-resolved", handler);
  window.addEventListener("event-type-changed", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("event-type-resolved", handler);
    window.removeEventListener("event-type-changed", handler);
  };
}

export default function ComingSoonPage() {
  const locale = useLocale();
  const language = locale === "en" ? "en" : locale === "es" ? "es" : "it";
  const eventType = useSyncExternalStore(subscribeEventType, readEventType, () => "wedding");

  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center gap-6 py-10">
      <EventAvailabilityNotice eventType={eventType} legacy />
      <AppButtonLink href={`/${locale}`} variant="secondary">
        {HOME_COPY[language]}
      </AppButtonLink>
    </div>
  );
}
