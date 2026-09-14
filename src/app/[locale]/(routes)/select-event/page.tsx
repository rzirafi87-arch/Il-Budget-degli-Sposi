"use client";

import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type EventOption = { id: string; name: string | null; eventType: string; date: string | null };
type ResolvePayload = { status: "RESOLVED" | "NO_EVENT" | "SELECTION_REQUIRED"; events: EventOption[] };

export default function SelectEventPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("milestone9.currentEvent");
  const [events, setEvents] = useState<EventOption[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [selecting, setSelecting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    const { data } = await getBrowserClient().auth.getSession();
    const jwt = data.session?.access_token;
    if (!jwt) return router.replace(`/${locale}/auth`);
    try {
      const response = await fetch("/api/my/current-event", { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" });
      if (!response.ok) throw new Error("EVENTS_LOAD_FAILED");
      const payload = (await response.json()) as ResolvePayload;
      if (payload.status === "RESOLVED") return router.replace(`/${locale}/dashboard`);
      if (payload.status === "NO_EVENT") return router.replace(`/${locale}/select-language`);
      setEvents(payload.events);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [locale, router]);

  useEffect(() => { void load(); }, [load]);

  async function choose(eventId: string) {
    setSelecting(eventId);
    try {
      const { data } = await getBrowserClient().auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) throw new Error("NOT_AUTHENTICATED");
      const response = await fetch("/api/my/current-event", {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (!response.ok) throw new Error("EVENT_SELECTION_FAILED");
      localStorage.setItem("currentEventChangedAt", String(Date.now()));
      router.replace(`/${locale}/dashboard`);
      router.refresh();
    } catch {
      setState("error");
      setSelecting(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-4 py-10" aria-busy={state === "loading"}>
      <h1 className="text-center text-3xl font-bold text-fg">{t("choose")}</h1>
      {state === "loading" && <p className="mt-6 text-center text-muted-fg" role="status">{t("switching")}</p>}
      {state === "error" && <div className="mt-6 text-center" role="alert"><p className="text-muted-fg">{t("none")}</p><button type="button" className="app-button app-button--primary mt-4" onClick={() => void load()}>{t("change")}</button></div>}
      {state === "ready" && <div className="mt-8 grid gap-3" role="list">{events.map((event) => (
        <button key={event.id} type="button" role="listitem" disabled={selecting !== null}
          className="rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition hover:border-primary focus-ring-sage disabled:opacity-60"
          onClick={() => void choose(event.id)}>
          <span className="block font-semibold text-fg">{event.name || event.eventType}</span>
          {event.date && <span className="mt-1 block text-sm text-muted-fg">{event.date.slice(0, 10)}</span>}
        </button>
      ))}</div>}
    </main>
  );
}
