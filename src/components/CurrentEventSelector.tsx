"use client";

import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

type EventSummary = {
  id: string;
  name: string | null;
  eventType: string;
  date: string | null;
  capability: { availabilityStatus: "READY" | "COMING_SOON" | "INTERNAL_ONLY" };
};

type Payload = {
  status: "RESOLVED" | "NO_EVENT" | "SELECTION_REQUIRED";
  currentEvent: (EventSummary & { eventId: string }) | null;
  events: EventSummary[];
};

export default function CurrentEventSelector() {
  const t = useTranslations("milestone9.currentEvent");
  const id = useId();
  const selectRef = useRef<HTMLSelectElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [switching, setSwitching] = useState(false);
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);

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
    if (!pendingEventId) return;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !switching) {
        setPendingEventId(null);
        requestAnimationFrame(() => selectRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = cancelRef.current?.closest('[role="dialog"]');
      const focusable = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), select:not([disabled]), input:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pendingEventId, switching]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === "currentEventChangedAt" && event.newValue) window.location.reload();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  if (!payload) return null;
  if (payload.events.length === 0) return <p className="text-sm text-muted-fg">{t("none")}</p>;
  if (payload.events.length === 1 && payload.status === "RESOLVED") {
    const only = payload.events[0];
    return <p className="text-sm font-semibold text-fg">{only.name || only.eventType}{only.date ? ` · ${only.date.slice(0, 10)}` : ""}</p>;
  }

  const value = payload.currentEvent?.eventId || "";
  const pendingEvent = payload.events.find((item) => item.id === pendingEventId);

  async function confirmSwitch() {
    if (!pendingEventId || pendingEventId === value) return;
    setSwitching(true);
    try {
      const { data } = await getBrowserClient().auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) return;
      const response = await fetch("/api/my/current-event", {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: pendingEventId }),
      });
      if (!response.ok) return;
      const next = (await response.json()) as Payload;
      const eventType = next.currentEvent?.eventType;
      if (eventType) localStorage.setItem("eventType", eventType);
      localStorage.setItem("currentEventChangedAt", String(Date.now()));
      window.location.reload();
    } finally {
      setSwitching(false);
      setPendingEventId(null);
    }
  }
  return (
    <div className="min-w-0 max-w-48">
      <label className="sr-only" htmlFor={id}>{t("label")}</label>
      <select
        ref={selectRef}
        id={id}
        aria-label={`${t("label")}. ${t("change")}`}
        className="min-h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-semibold text-fg shadow-soft-sm focus-ring-sage disabled:cursor-wait disabled:opacity-60"
        value={value}
        disabled={switching}
        onChange={(event) => {
          const eventId = event.target.value;
          if (!eventId || eventId === value) return;
          setPendingEventId(eventId);
        }}
      >
        <option value="" disabled>{t("choose")}</option>
        {payload.events.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name || item.eventType}{item.date ? ` · ${item.date.slice(0, 10)}` : ""}{item.capability.availabilityStatus === "COMING_SOON" ? ` · ${t("soon")}` : ""}
          </option>
        ))}
      </select>
      {pendingEvent && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/45 p-4" role="presentation">
          <section className="w-full max-w-md rounded-2xl border border-border bg-bg p-5 text-fg shadow-2xl" role="dialog" aria-modal="true" aria-labelledby={`${id}-switch-title`}>
            <h2 id={`${id}-switch-title`} className="text-lg font-semibold">{t("confirmTitle")}</h2>
            <p className="mt-2 text-sm text-muted-fg">{t("confirmDescription", { event: pendingEvent.name || pendingEvent.eventType })}</p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button ref={cancelRef} type="button" className="app-button app-button-ghost" disabled={switching} onClick={() => { setPendingEventId(null); requestAnimationFrame(() => selectRef.current?.focus()); }}>{t("cancel")}</button>
              <button type="button" className="app-button app-button-primary" disabled={switching} onClick={confirmSwitch}>{switching ? t("switching") : t("confirm")}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
