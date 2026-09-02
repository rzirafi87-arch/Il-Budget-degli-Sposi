"use client";

import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useLocale } from "next-intl";
import { useEffect, useId, useState } from "react";

type EventSummary = {
  id: string;
  name: string | null;
  eventType: string;
  date: string | null;
  capability: { availabilityStatus: "READY" | "COMING_SOON" | "BETA" };
};

type Payload = {
  status: "RESOLVED" | "NO_EVENT" | "SELECTION_REQUIRED";
  currentEvent: (EventSummary & { eventId: string }) | null;
  events: EventSummary[];
};

const labels = {
  it: { label: "Evento corrente", choose: "Scegli un evento", none: "Nessun evento", change: "Cambia evento", soon: "Prossimamente" },
  en: { label: "Current event", choose: "Choose an event", none: "No event", change: "Change event", soon: "Coming Soon" },
  es: { label: "Evento actual", choose: "Elige un evento", none: "Ningún evento", change: "Cambiar evento", soon: "Próximamente" },
} as const;

export default function CurrentEventSelector() {
  const locale = useLocale();
  const t = labels[locale as keyof typeof labels] || labels.it;
  const id = useId();
  const [payload, setPayload] = useState<Payload | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await getBrowserClient().auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) return;
      const response = await fetch("/api/my/current-event", {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: "no-store",
      });
      if (response.ok && active) setPayload((await response.json()) as Payload);
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === "currentEventChangedAt" && event.newValue) window.location.reload();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  if (!payload) return null;
  if (payload.events.length === 0) return <span className="hidden text-xs text-muted-fg md:inline">{t.none}</span>;
  if (payload.events.length === 1 && payload.status === "RESOLVED") return null;

  const value = payload.currentEvent?.eventId || "";
  return (
    <div className="min-w-0 max-w-48">
      <label className="sr-only" htmlFor={id}>{t.label}</label>
      <select
        id={id}
        aria-label={`${t.label}. ${t.change}`}
        className="min-h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-semibold text-fg shadow-soft-sm focus-ring-sage disabled:cursor-wait disabled:opacity-60"
        value={value}
        disabled={switching}
        onChange={async (event) => {
          const eventId = event.target.value;
          if (!eventId || eventId === value) return;
          setSwitching(true);
          try {
            const { data } = await getBrowserClient().auth.getSession();
            const jwt = data.session?.access_token;
            if (!jwt) return;
            const response = await fetch("/api/my/current-event", {
              method: "POST",
              headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
              body: JSON.stringify({ eventId }),
            });
            if (!response.ok) return;
            const next = (await response.json()) as Payload;
            const eventType = next.currentEvent?.eventType;
            if (eventType) localStorage.setItem("eventType", eventType);
            localStorage.setItem("currentEventChangedAt", String(Date.now()));
            window.location.reload();
          } finally {
            setSwitching(false);
          }
        }}
      >
        <option value="" disabled>{t.choose}</option>
        {payload.events.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name || item.eventType}{item.date ? ` · ${item.date.slice(0, 10)}` : ""}{item.capability.availabilityStatus === "COMING_SOON" ? ` · ${t.soon}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
