"use client";

import EventAvailabilityNotice from "@/components/EventAvailabilityNotice";
import { AppButtonLink } from "@/components/ui/AppButton";
import { normalizeEventType } from "@/lib/eventTypeCapabilities";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

const HOME_COPY = {
  it: "Torna alla Home",
  en: "Back to Home",
  es: "Volver al inicio",
} as const;

export default function ComingSoonPage() {
  const locale = useLocale();
  const language = locale === "en" ? "en" : locale === "es" ? "es" : "it";
  const [eventType, setEventType] = useState<string>("wedding");

  useEffect(() => {
    try {
      const cookieEventType = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
      const storedEventType = localStorage.getItem("eventType");
      setEventType(normalizeEventType(cookieEventType || storedEventType || "wedding"));
    } catch {
      setEventType("wedding");
    }
  }, []);

  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center gap-6 py-10">
      <EventAvailabilityNotice eventType={eventType} legacy />
      <AppButtonLink href={`/${locale}`} variant="secondary">
        {HOME_COPY[language]}
      </AppButtonLink>
    </div>
  );
}
